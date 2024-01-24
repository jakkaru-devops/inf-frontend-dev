import { createRef, FC, RefObject, useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import { CoordsType, YandexMapProps } from './interfaces';
import {
  convertAddressToString,
  createMap,
  getAddressByCoords,
  loadYandexMapScript,
  preciseGeoObjectAddress,
  setPlacemark,
} from './utils';
import { openNotification } from 'utils/common.utils';
import { Container } from 'components/common';
import { useLocale } from 'hooks/locale.hook';

const YandexMap: FC<YandexMapProps> = ({
  defaultAddress,
  coords,
  zoom,
  hasSearch,
  onAddressChange,
  onModalCancel,
}) => {
  const { locale } = useLocale();
  const [address, setAddress] = useState({
    value: convertAddressToString(defaultAddress) || '',
    coords: coords,
    country: defaultAddress.country || '',
    region: defaultAddress.region || '',
    city: defaultAddress.city || '',
    street: defaultAddress.street || '',
    building: defaultAddress.building || '',
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const inputRef: RefObject<any> = createRef();
  const mapContainerRef: RefObject<HTMLDivElement> = createRef();
  const [ymaps, setYmaps] = useState<typeof window.ymaps>(null);

  useEffect(() => {
    loadYandexMapScript().then(ymaps => {
      setYmaps(ymaps);
    });
  }, []);

  useEffect(() => {
    if (isInitialized || !ymaps) return;
    setIsInitialized(true);
    onInit();
  }, [ymaps, isInitialized]);

  useEffect(() => {
    onAddressChange({
      country: address.country,
      region: address.region,
      city: address.city,
      street: address.street,
      building: address.building,
    });
  }, [address]);

  const onInit = () => {
    let map = new ymaps.Map(mapContainerRef.current, {
      center: coords,
      zoom,
      controls: [
        'geolocationControl',
        'fullscreenControl',
        'zoomControl',
        'rulerControl',
      ],
    });
    let placemark = null;
    const searchInput = inputRef.current.input;

    // If hasSearch prop is set to true
    // Add suggestions view to search input
    if (hasSearch) {
      new ymaps.SuggestView(searchInput);
    }

    map.controls.remove('searchControl');

    // cursor: default
    map.cursors.push('arrow');

    // Map click event listener
    map.events.add('click', e => {
      if (!hasSearch) return;
      const coords = e.get('coords') as CoordsType;
      placemark = setPlacemark({ ymaps, placemark, map, coords });
      getAddressByCoords(ymaps, coords, geoObject => {
        setAddress({
          ...address,
          value: geoObject.getAddressLine(),
          country: geoObject.getCountry() || '',
          region: geoObject.getAdministrativeAreas()[0] || '',
          city: geoObject.getLocalities()[0] || '',
          street:
            geoObject.getThoroughfare() || geoObject.getLocalities()[1] || '',
          building: geoObject.getPremiseNumber() || '',
        });
      });
    });

    // mySearchControl.events
    //   .add('resultselect', function (e: any) {
    //     const index = e.get('index');
    //     mySearchControl.getResult(index).then(function (res: any) {
    //       mySearchResults.add(res);
    //     });
    //   })
    //   .add('submit', function () {
    //     mySearchResults.removeAll();
    //   });

    // Handle default address
    if (defaultAddress) {
      geocode();
    }

    searchInput.addEventListener('focusout', e => {
      setTimeout(() => geocode(), 300);
    });

    function geocode() {
      // Get address from search input
      var requestAddress = searchInput.value;
      if (!requestAddress) return;
      // Geocode input data
      ymaps.geocode(requestAddress).then((res: any) => {
        const geoObject = res.geoObjects.get(0);
        const { error, hint } = preciseGeoObjectAddress(geoObject, locale);
        // If geocoder returns an empty array or not enough precise result
        // Show an error
        if (error) {
          openNotification(
            <>
              <div>
                <strong>{error}</strong>
              </div>
              <div>{hint}</div>
            </>,
          );
        } else {
          showResult(geoObject);
        }
      });
    }

    function showResult(geoObject: any) {
      const mapContainer = searchInput;
      const bounds = geoObject.properties.get('boundedBy');
      const coords = geoObject.geometry._coordinates;
      // Calculate the visible area of the current user position
      const mapState = (ymaps.util as any).bounds.getCenterAndZoom(bounds, [
        mapContainer.clientWidth,
        mapContainer.clientHeight,
      ]);
      // Save short address for placemark caption text
      const shortAddress = [
        geoObject.getThoroughfare(),
        geoObject.getPremiseNumber(),
        geoObject.getPremise(),
      ].join(' ');
      // Remove controls from the map
      mapState.controls = [];
      // Create or update map with new address
      const newMap = createMap({
        mapState,
        caption: shortAddress,
        placemark,
        ymaps,
        map,
        coords,
      });
      map = newMap.map;
      placemark = newMap.placemark;

      const addressDetails = {
        country: geoObject.getCountry() || '',
        region: geoObject.getAdministrativeAreas()[0] || '',
        city: geoObject.getLocalities()[0] || '',
        street:
          geoObject.getThoroughfare() || geoObject.getLocalities()[1] || '',
        building: geoObject.getPremiseNumber() || '',
      };

      setAddress({
        ...address,
        ...addressDetails,
        value: convertAddressToString(addressDetails),
      });
    }
  };

  return (
    <div className="ymap-wrapper">
      <div ref={mapContainerRef} className="ymap-wrapper__map" />
      <Container className="ymap-wrapper__container">
        <Input
          value={address.value}
          onChange={e =>
            setAddress({
              ...address,
              value: e.target.value,
            })
          }
          placeholder={locale.address.address}
          ref={inputRef}
          disabled={!hasSearch}
          className="ymap-wrapper__input"
        />

        {!!hasSearch && (
          <Button
            type="primary"
            onClick={onModalCancel}
            className="ymap-wrapper__button"
          >
            ОК
          </Button>
        )}
      </Container>
    </div>
  );
};

export default YandexMap;
