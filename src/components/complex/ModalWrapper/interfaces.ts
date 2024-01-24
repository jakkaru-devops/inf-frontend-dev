export type ModalType =
  | 'editEmail'
  | 'connectEmail'
  | 'editPhone'
  | 'setRating'
  | 'registrationJuristicSubject'
  | 'registrationIndividual'
  | 'registrationPersonalData'
  | 'transportCompanies'
  | 'image'
  | 'attachments'
  | 'document'
  | 'complain'
  | 'punish'
  | 'alertMessage'
  | 'deleteAgree'
  | 'organizationCard'
  | 'refundExchangeRequest'
  | 'requestRefundExchange';

export interface IModalState {
  stateCount: number;
  type: ModalType | null;
  isVisible: boolean;
}
