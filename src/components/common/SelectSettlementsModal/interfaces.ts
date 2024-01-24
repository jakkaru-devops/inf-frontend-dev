/**
 * @description Region types from database (fias).
 * @interface IRegion
 */
interface IRegion {
  name: string;
  type: string;
  name_with_type: string;
  federal_district?: string;
  fias_id: string;
  okato?: string;
  oktmo?: string;
  tax_office?: string;
  postal_code?: string;
  iso_code?: string;
  timezone?: string;
  geoname_code?: string;
  geoname_id?: number;
  geoname_name?: string;
  isSelect?: boolean;
  isRegionPartSelected?: boolean;
  organizationBranchCount: number;
}
/**
 * @description Settlements (cities, willages etc.) from database (fias).
 * @interface ISettlement
 */
interface ISettlement {
  areacode?: string;
  autocode?: string;
  aoguid?: string;
  citycode?: string;
  code?: string;
  enddate?: Date;
  formalname: string;
  ifnsfl?: string;
  ifnsul?: string;
  offname?: string;
  okato?: string;
  oktmo?: string;
  placecode?: string;
  plaincode?: string;
  postalcode?: string;
  regioncode?: string;
  shortname?: string;
  startdate?: Date;
  streetcode?: string;
  terrifnsfl?: string;
  terrifnsul?: string;
  updatedate?: Date;
  ctarcode?: string;
  extrcode?: string;
  sextcode?: string;
  plancode?: string;
  cadnum?: string;
  divtype?: string;
  actstatus?: number;
  aoid: string;
  aolevel?: number;
  centstatus?: number;
  currstatus?: number;
  livestatus?: number;
  nextid?: string;
  normdoc?: string;
  operstatus?: number;
  parentguid: string;
  previd?: string;
  isSelect?: boolean;
  regionId?: string;
}

type TRegion = IRegion & ISettlement;
type TSetSavedRegions = (savedRegions: TRegion[]) => any;
type TSelectedSettlement = {
  fiasId: string;
  regionId?: string;
  fias: {
    id: string;
    parentguid?: string;
  };
};

interface IRegions {
  savedRegions: TRegion[];
  regions: TRegion[];
  selectedSettlements: TSelectedSettlement[];
}

interface IChildItem {
  region: TRegion;
  savedRegions: TRegion[];
  setSavedRegions: TSetSavedRegions;
  isRegion: boolean;
  selectedSettlements: TSelectedSettlement[];
  regionId: string;
  mode?: 'sale';
}

interface IChildItems {
  regions: IRegions['regions'];
  savedRegions: TRegion[];
  setSavedRegions: TSetSavedRegions;
  isRegions?: boolean;
  selectedSettlements: IRegions['selectedSettlements'];
  regionId: string;
  mode?: 'sale';
}

interface IRightControls {
  onSubmit: () => void;
  handleReset: () => void;
  disabled: boolean;
}

interface ISelectSettlementsModal {
  open: boolean;
  onCancel: () => void;
  orderRequestId?: string;
  regionsInit: any[];
  onSubmit?: (settlements: any) => void;
  mode?: 'sale';
}

export type {
  ISelectSettlementsModal,
  IRegions,
  TRegion,
  IRegion,
  ISettlement,
  IChildItem,
  IChildItems,
  IRightControls,
  TSelectedSettlement,
};
