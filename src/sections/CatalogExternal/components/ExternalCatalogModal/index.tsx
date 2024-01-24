import { Modal, Preloader } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { FC, Fragment, useEffect, useState } from 'react';
import {
  IAutoBrandExternal,
  IAutoTypeExternal,
} from 'sections/Catalog/interfaces/categories.interfaces';
import {
  IAcatModel,
  ILaximoVehicle,
  LaximoUrlType,
} from 'sections/CatalogExternal/interfaces';
import ExternalCatalogCategories from 'sections/CatalogExternal/pages/CatalogExternal.page/Categories';
import ExternalCatalogAcatAutoModels from 'sections/CatalogExternal/pages/CatalogExternalAutoModelList.page/AutoModels';
import ExternalCatalogAcatGroupList from 'sections/CatalogExternal/pages/CatalogExternalGroupList.page/GroupList';
import LaximoGroupsWrapper from 'sections/CatalogExternal/pages/CatalogExternalLaximoCar.page/Groups';
import CatalogExternalLaximoFilters from 'sections/CatalogExternal/pages/CatalogExternalLaximoCommon.page/Filters';
import { getAcatModelFullName } from 'sections/CatalogExternal/utils';
import { APIRequest } from 'utils/api.utils';

interface IProps extends IModalPropsBasic {}

const ExternalCatalogModal: FC<IProps> = ({ ...modalProps }) => {
  const router = useRouter();
  const [autoTypes, setAutoTypes] = useState<IAutoTypeExternal[]>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [state, setState] = useState<{
    step: 'models' | 'groups' | 'vehicles';
    catalog?: 'acat' | 'laximo';
    data: any;
  }>({ step: null, catalog: null, data: null });

  const fetchAutoTypes = async () => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ACAT_ROOT,
      params: {
        path: '',
      },
    });
    if (!res.isSucceed) return;
    setAutoTypes(res.data);
    setDataLoaded(true);
  };

  useEffect(() => {
    fetchAutoTypes();
  }, []);

  const fetchAcatAutoModels = async (
    autoTypeId: string,
    autoBrandId: string,
  ) => {
    setDataLoaded(false);
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ACAT_MODEL_LIST,
      params: {
        autoType: autoTypeId,
        autoBrand: autoBrandId,
      },
    });
    setDataLoaded(true);

    if (!res.isSucceed) return;

    setState({
      step: 'models',
      catalog: 'acat',
      data: res.data,
    });
  };

  const handleAcatAutoBrandClick = async (
    autoBrand: IAutoBrandExternal,
    autoTypeId: string,
  ) => {
    await fetchAcatAutoModels(autoTypeId, autoBrand.value);
  };

  const fetchAcatGroups = async (
    autoTypeId: string,
    autoBrandId: string,
    autoModelId: string,
    modificationId?: string,
  ) => {
    setDataLoaded(false);
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ACAT_GROUP_LIST,
      params: {
        autoType: autoTypeId,
        autoBrand: autoBrandId,
        autoModel: autoModelId,
        modification: modificationId,
      },
    });
    setDataLoaded(true);

    if (!res.isSucceed) return;

    setState({
      step: 'groups',
      catalog: 'acat',
      data: res.data,
    });
  };

  const handleAcatAutoModelClick = async (autoModel: IAcatModel) => {
    await fetchAcatGroups(
      state.data?.type?.id,
      state.data?.mark?.id,
      autoModel.id,
    );
  };

  const fetchLaximoVehicles = async (autoBrand: IAutoBrandExternal) => {
    console.log('autoBrand', autoBrand);

    setDataLoaded(false);
    const res = await APIRequest({
      url: API_ENDPOINTS.LAXIMO_CATALOG_INFO(
        autoBrand.urlType as LaximoUrlType,
      ),
      params: {
        catalogCode: autoBrand?.code || autoBrand?.catalog,
      },
    });
    setDataLoaded(true);

    if (!res.isSucceed) return;

    console.log('VEHICLE', res.data);

    setState({
      step: 'vehicles',
      catalog: 'laximo',
      data: res.data,
    });
  };

  const handleLaximoAutoBrandClick = async (autoBrand: IAutoBrandExternal) => {
    await fetchLaximoVehicles(autoBrand);
  };

  const handleLaximoVehicleClick = async (car: ILaximoVehicle) => {
    setDataLoaded(false);
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_CAR_INFO(state.data.urlType),
      params: {
        catalogCode: car.catalog,
        ssd: car.ssd,
        vehicleId: car.vehicleid,
      },
    });
    setDataLoaded(true);

    if (!res.isSucceed) return;

    console.log('GROUPS RES', res.data);
    console.log('TEST', res.data.quickList);

    setState({
      step: 'groups',
      catalog: 'laximo',
      data: res.data,
    });
  };

  return (
    <Modal
      {...modalProps}
      hideHeader
      hideFooter
      width="auto"
      style={{ minWidth: 1000 }}
      className="external-catalog-modal"
    >
      {!!state?.data ? (
        <Fragment>
          {state.catalog === 'acat' && (
            <Fragment>
              {state.step === 'models' && (
                <div>
                  <div className="external-catalog-modal__top">
                    <button
                      onClick={() =>
                        setState({ step: null, catalog: null, data: null })
                      }
                      className="external-catalog-modal__back"
                    >
                      ← Назад
                    </button>
                    <div className="external-catalog-modal__title">
                      {state.data?.mark?.name}
                    </div>
                  </div>

                  <ExternalCatalogAcatAutoModels
                    {...state.data}
                    onAutoModelClick={handleAcatAutoModelClick}
                  />
                </div>
              )}
              {state.step === 'groups' && (
                <div>
                  <div className="external-catalog-modal__top">
                    <button
                      onClick={() =>
                        fetchAcatAutoModels(
                          state?.data?.type?.id,
                          state?.data?.mark?.id,
                        )
                      }
                      className="external-catalog-modal__back"
                    >
                      ← Назад
                    </button>
                    <div className="external-catalog-modal__title">
                      {getAcatModelFullName(
                        state?.data?.mark,
                        state?.data?.model,
                      )}
                    </div>
                  </div>

                  <div className="pl-15">
                    Модель: {state?.data?.model?.name}
                  </div>
                  {!!state?.data?.model?.relevance && (
                    <div className="pl-15">
                      Актуальность: {state?.data?.model?.relevance}
                    </div>
                  )}
                  <br />

                  <ExternalCatalogAcatGroupList
                    {...state.data}
                    preventRouting
                  />
                </div>
              )}
            </Fragment>
          )}
          {state.catalog === 'laximo' && (
            <Fragment>
              {state.step === 'vehicles' && (
                <div>
                  <div className="external-catalog-modal__top">
                    <button
                      onClick={() =>
                        setState({ step: null, catalog: null, data: null })
                      }
                      className="external-catalog-modal__back"
                    >
                      ← Назад
                    </button>
                    <div className="external-catalog-modal__title">
                      {state.data?.brand}
                    </div>
                  </div>
                  <CatalogExternalLaximoFilters
                    catalogInfo={state.data}
                    onVehicleClick={handleLaximoVehicleClick}
                  />
                </div>
              )}
              {state.step === 'groups' && (
                <div>
                  <div className="external-catalog-modal__top">
                    <button
                      onClick={() => fetchLaximoVehicles(state.data.carInfo)}
                      className="external-catalog-modal__back"
                    >
                      ← Назад
                    </button>
                    <div className="external-catalog-modal__title">
                      {state.data?.carInfo?.brand} {state.data?.carInfo?.name}
                    </div>
                  </div>
                  <LaximoGroupsWrapper
                    carInfo={state.data.carInfo}
                    groups={state.data.quickList}
                    currentSsd={state.data.carInfo.ssd}
                    onUnitClick={unit => {
                      router.push(
                        APP_PATHS.LAXIMO_UNIT(
                          state.data.carInfo.catalog,
                          unit.unitid,
                          state.data.carInfo.urlType,
                          unit.ssd,
                        ),
                      );
                    }}
                    preventRouting
                  />
                </div>
              )}
            </Fragment>
          )}
        </Fragment>
      ) : (
        <Fragment>
          <div className="external-catalog-modal__top">
            <div className="external-catalog-modal__title">
              Поиск по каталогам
            </div>
          </div>
          {!!autoTypes && (
            <ExternalCatalogCategories
              autoTypes={autoTypes}
              onLaximoAutoBrandClick={handleLaximoAutoBrandClick}
              onAcatAutoBrandClick={handleAcatAutoBrandClick}
            />
          )}
        </Fragment>
      )}
      {!dataLoaded && (
        <div className="preloader-wrapper">
          <Preloader />
        </div>
      )}
    </Modal>
  );
};

export default ExternalCatalogModal;
