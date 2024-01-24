import { EXTERNAL_PATHS } from 'data/paths.data';
import { IAddress } from 'interfaces/common.interfaces';
import { getInitialAddress } from 'utils/common.utils';
import { YANDEX_MAP_SCRIPT_CLASS_NAME } from './data';

export const loadYandexMapScript = (): Promise<typeof window.ymaps> => {
  return new Promise(resolve => {
    const existingScript = document.querySelector(
      `.${YANDEX_MAP_SCRIPT_CLASS_NAME}`,
    );
    if (existingScript) {
      existingScript.remove();
    }
    const existingYmaps = document.querySelectorAll('ymaps');
    if (existingYmaps) {
      existingYmaps.forEach(ymaps => {
        ymaps.remove();
      });
    }

    const script = document.createElement('script');
    script.src = EXTERNAL_PATHS.YANDEX_MAPS_API('ru_RU');
    script.async = true;
    script.classList.add(YANDEX_MAP_SCRIPT_CLASS_NAME);
    document.body.appendChild(script);
    script.onload = () => {
      window.ymaps.ready(() => resolve(window.ymaps));
    };
  });
};

/**
 * Creates new placemark on the map
 * @param coords
 */
export const createPlacemark = (ymaps: any, coords: number[]) => {
  return new ymaps.Placemark(coords, null, {
    preset: 'islands#violetDotIconWithCaption',
    draggable: true,
  });
};

/**
 * Sets placemark to new position
 */
export const setPlacemark = ({
  ymaps,
  placemark,
  map,
  coords,
}: {
  ymaps: any;
  placemark: any;
  map: any;
  coords: number[];
}) => {
  if (placemark) {
    // move placemark if it is already exists
    placemark.geometry.setCoordinates(coords);
  } else {
    // create placemark if it not exists
    placemark = createPlacemark(ymaps, coords);
    map.geoObjects.add(placemark);
  }
  return placemark;
};

export const getAddressByCoords = (
  ymaps: any,
  coords: [number, number],
  callback: (geoObject: any) => void,
) => {
  // placemark.properties.set('iconCaption', 'поиск...')
  ymaps.geocode(coords).then((res: any) => {
    const firstGeoObject = res.geoObjects.get(0);
    callback(firstGeoObject);
  });
};

/**
 * Creates map
 */
export const createMap = ({
  mapState,
  caption,
  placemark,
  ymaps,
  map,
  coords,
}: {
  mapState: any;
  caption: any;
  placemark: any;
  ymaps: any;
  map: any;
  coords?: [number, number];
}) => {
  // Если карта еще не была создана, то создадим ее и добавим метку с адресом.
  if (!placemark) {
    placemark = new ymaps.Placemark(coords || map.getCenter(), null, {
      preset: 'islands#redDotIconWithCaption',
    });
    map.geoObjects.add(placemark);
    map.setCenter(coords, 17);
    // Если карта есть, то выставляем новый центр карты и меняем данные и позицию метки в соответствии с найденным адресом.
  } else {
    map.setCenter(coords || mapState.center, 17);
    placemark.geometry.setCoordinates(mapState.center);
    // placemark.properties.set({iconCaption: caption, balloonContent: caption})
  }
  return {
    map,
    placemark,
  };
};

export const preciseGeoObjectAddress = (geoObject: any, locale: any) => {
  const result = {
    error: null,
    hint: null,
  };
  if (geoObject) {
    // About geocoder response accuracy evaluation: https://tech.yandex.ru/maps/doc/geocoder/desc/reference/precision-docpage/
    // switch (geoObject.properties.get('metaDataProperty.GeocoderMetaData.precision')) {
    // 	case 'exact':
    // 		break;
    // 	case 'number':
    // 	case 'near':
    // 	case 'range':
    // 		result.error = 'Неточный адрес'
    // 		result.hint = 'Уточните номер дома'
    // 		break;
    // 	case 'street':
    // 		result.error = 'Неполный адрес'
    // 		result.hint = 'Уточните улицу'
    // 		break;
    // 	default:
    // 		result.error = 'Неточный адрес'
    // 		result.hint = 'Уточните адрес'
    // }
  } else {
    result.error = locale.address.addressNotFound;
    result.hint = locale.address.specifyAddress;
  }

  return result;
};

/**
 * Returns address as string
 */
export const convertAddressToString = (
  address: IAddress,
  format: 'full' | 'region/city' = 'full',
) => {
  if (!address) {
    return convertAddressToString(getInitialAddress());
  }

  address = {
    country: address.country,
    region: address.region,
    area: address.area,
    city: address?.city === address?.settlement ? null : address.city,
    settlement: address.settlement,
    street: address.street,
    building: address.building,
    apartment: address.apartment,
  };

  const addressArr: string[] = [];

  if (!validateAddress(address)) {
    return null;
    // return 'Указан некорректный адрес'
  }

  if (format === 'full') {
    Object.keys(address).forEach(key => {
      const value = address[key] as string;
      if (value && !value.toString().isEmpty()) {
        if (key === 'settlement') {
          addressArr.push(value);
        } else {
          if (!address.settlement || !address.settlement.includes(value)) {
            addressArr.push(value);
          }
        }
      }
    });
  }
  if (format === 'region/city') {
    if (!!address?.region && !address?.settlement?.includes(address?.region)) {
      addressArr.push(address?.region);
    }
    if (
      !!address?.city &&
      !address?.region?.includes(address?.city) &&
      !address?.settlement?.includes(address?.city)
    ) {
      addressArr.push(address?.region);
    }
    if (!!address.settlement) {
      addressArr.push(address.settlement);
    }
  }

  return addressArr.join(', ');
};

/**
 * Validateds provided address
 */
export const validateAddress = (address: IAddress) => {
  address = {
    country: address.country,
    region: address.region,
    area: address.area,
    city: address.city,
    settlement: address.settlement,
    street: address.street,
    building: address.building,
    apartment: address.apartment,
    postcode: address.postcode,
  };
  let isValid = true;
  const requiredFields = ['country', 'region', ['city', 'settlement']];

  for (const requiredFieldKey of requiredFields) {
    if (typeof requiredFieldKey === 'string') {
      if (
        !address[requiredFieldKey] ||
        (address[requiredFieldKey] as string).isEmpty()
      ) {
        isValid = false;
      }
    } else {
      let isValidOr = false;
      for (let i = 0; i < requiredFieldKey.length; i++) {
        if (
          !!address[requiredFieldKey[i]] &&
          address[requiredFieldKey[i]].length > 0
        ) {
          isValidOr = true;
        }
      }
      if (!isValidOr) {
        isValid = isValidOr;
      }
    }
  }
  return isValid;
};
