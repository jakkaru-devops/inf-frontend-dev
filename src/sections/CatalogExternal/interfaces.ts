export interface IAcatBreadCrumbsItem {
  name: string;
  url: string;
}

export interface IAcatType {
  id: string;
  name: string;
}

export interface IAcatMark {
  id: string;
  name: string;
  image: string;
  archival: boolean;
  engine: boolean;
  hasModifications: boolean;
  searchParts: boolean;
  vin: boolean;
}

export interface IAcatModel {
  id: string;
  name: string;
  image: string;
  archival: boolean;
  hasModifications: boolean;
  modification: string;
  relevance: string;
}

export interface IAcatModification {
  id: string;
  name: string;
  description: string;
  criteria: any;
  frame: any;
  vin: any;
  parameters: Array<{
    idx: string;
    key:
      | 'grade_code'
      | 'engine_code'
      | 'engine'
      | 'grade'
      | 'transmission'
      | 'year'
      | 'sales_region'
      | 'steering'
      | 'trans_type';
    name: string;
    sortOrder: number;
    value: string;
  }>;
}

export interface IAcatProductGroup {
  id: string | number;
  name: string;
  image: string;
  description: string;
  hasParts: boolean;
  hasSubgroups: boolean;
  hasSubGroups: boolean;
  needLoadSubGroups: boolean;
  parentId: string;
  parent_full_name: string;
  subGroups: IAcatProductGroup[];
  isExpanded?: boolean;
}

export interface IAcatLabel {
  id: string;
  name: string;
  number: string;
  coordinate: {
    top: { x: number; y: number };
    bottom: { x: number; y: number };
    width: number;
    height: number;
  };
}

export interface IAcatNumber {
  id: string | number;
  name: string;
  description: string;
  labelId: string;
  number: string;
  groupId: string | null;
  quantity?: number;
}

export type IAcatProduct = IAcatNumber;

export interface IAcatProductGroupPageProps {
  type: IAcatType;
  mark: IAcatMark;
  model: IAcatModel;
  modification: any;
  group: IAcatProductGroup;
  labels: IAcatLabel[];
  numbers: IAcatNumber[];
  image: string;
  imageBuffer: { type: 'Buffer'; data: ArrayBuffer };
}

export interface IAcatMarkOld {
  value?: string;
  name?: string;
  short_name?: string;
  full_name?: string;
  description: string;
  type: string;
  url: string;
  image: string;
  engine: boolean;
  SKD: boolean;
  archival: boolean;
}

export interface IAcatModelOld {
  id: string;
  name: string;
  name_with_mark?: string;
  short_name?: string;
  relevance?: string;
  type: string;
  mark_short_name: string;
}

export interface IAcatProductGroupOld {
  id: string;
  name: string;
  short_name?: string;
  img?: string;
  image?: string;
  imageBuffer?: { type: 'Buffer'; data: ArrayBuffer };
  hasSubgroups: boolean;
  childs: IAcatProductGroup[];
}

// export interface IAcatProduct {
//   id?: string;
//   name: string;
//   description: string;
//   relevance?: string;
//   modification?: string;
//   number?: string;
//   index?: string;
//   positionNumber?: string;
//   notice?: string;
//   url?: string;
//   parts?: IAcatProduct[];
//   coordinates: Array<{
//     top: { x: number; y: number };
//     bottom: { x: number; y: number };
//   }>;
// }

export interface IBreadCrumbsItem {
  name: string;
  url: string;
}

export enum LaximoFeaturesEnum {
  VIN_SEARCH = 'vinsearch',
  WIZARD_SEARCH = 'wizardsearch2',
  QUICK_GROUPS = 'quickgroups',
  DETAIL_APPLICABILITY = 'detailapplicability',
  SEARCH_BY_CHASSIS = 'searchByChassis',
}

export interface ILaximoCatalogInfo {
  brand: string;
  code: string;
  features?: Array<{ name: LaximoFeaturesEnum; example?: string }>;
  name: string;
  operations?: Array<ILaximoCatalogInfoOperations>;
  urlType?: LaximoUrlType;
}

export interface ILaximoCatalogInfoOperations {
  description: string;
  name: string;
  fields: Array<{
    description: string;
    name?: string;
    patter?: string;
  }>;
}

interface VehicleAttributes {
  key: string;
  name: string;
  value: string;
}

export interface ILaximoVehicle {
  brand: string;
  name: string;
  ssd: string;
  catalog: string;
  vehicleid: string;
  attributes: {
    family: VehicleAttributes;
    model: VehicleAttributes;
    modelyearfrom: VehicleAttributes;
    modelyearto: VehicleAttributes;
    options: VehicleAttributes;
    vehicleCategory: VehicleAttributes;
  };
  urlType?: LaximoUrlType;
}

export interface ILaximoCarsList {
  commonColumns: any;
  groupedByName: any;
  tableColumns: any;
  tableHeaders: any;
  vehicles: Array<ILaximoVehicle>;
  onVehicleClick: (car: ILaximoVehicle) => Promise<void>;
}

export interface ILaximoGroupsTree {
  contains: string;
  link: number;
  name: string;
  quickgroupid: string;
  synonyms: string;
  childGroups: ILaximoGroupsTree[] | null;
  urlType?: LaximoUrlType;
  isExpanded?: boolean;
}

export interface ILaximoQuickDetailsInUnitList {
  categoryid: string;
  childrens: string | null;
  name: string;
  parentcategoryid: string;
  selected: boolean;
  ssd: string;
  units: Array<ILaximoQuickUnitsWithDetails>;
}

export interface ILaximoQuickUnitsWithDetails {
  code: string;
  imageurl: string;
  largeimageurl: string;
  name: string;
  ssd: string;
  unitid: string;
  attributes: Array<{ key: string; name: string; value: string }>;
  details: Array<ILaximoQuickListDetail>;
}

export interface ILaximoQuickListDetail {
  attributes: Array<{ key: string; name: string; value: string }>;
  codeonimage: string;
  filter: string;
  match: number;
  name: string;
  oem: string;
  ssd: string;
  quantity?: number;
}

export interface ILaximoCartProductDTO {
  id: string;
  name: string;
  article: string;
  autoType: string;
  autoBrand: string;
  autoModel: string;
  group: string;
}

export type LaximoUrlType = 'cars' | 'trucks';

export enum ICatalogExternalPageEnum {
  groups = 'groups',
  units = 'units',
}
