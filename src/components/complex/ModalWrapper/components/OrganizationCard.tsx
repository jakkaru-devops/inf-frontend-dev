import { Container } from 'components/common';
import { FC } from 'react';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';

export const OrganizationCard: FC<{
  jurSubject: IJuristicSubject;
}> = ({ jurSubject }) => (
  <Container>
    <h2 className="text_38">Карточка предприятия покупателя</h2>

    <div className="mb-20">
      <span className="block text_18_bold text-left mb-5">ИНН</span>
      <span className="block">{jurSubject.inn}</span>
    </div>

    <div className="row row--content">
      <div className="col col--content">
        <div className="mb-20">
          <span className="block text_18_bold text-left mb-5">
            Наименование организации
          </span>
          <span className="block">{jurSubject.name}</span>
        </div>

        <div className="mb-20">
          <span className="block text_18_bold text-left mb-5">
            Юридический адрес
          </span>
          {[
            'country',
            'region',
            'area',
            'city',
            'settlement',
            'street',
            'building',
            'apartment',
            'postcode',
          ].map(
            target =>
              jurSubject.juristicAddress[target] && (
                <span className="block">
                  {jurSubject.juristicAddress[target]}
                </span>
              ),
          )}
        </div>

        {jurSubject.entityType !== 'ИП' && (
          <div className="mb-20">
            <span className="block text_18_bold text-left mb-5">КПП</span>
            <span className="block">{jurSubject.kpp}</span>
          </div>
        )}

        <div className="mb-20">
          <span className="block text_18_bold text-left mb-5">
            {jurSubject.entityType === 'ИП' ? 'ОГРНИП' : 'ОГРН'}
          </span>
          <span className="block">{jurSubject.ogrn}</span>
        </div>

        <div className="mb-20">
          <span className="block text_18_bold text-left mb-5">
            E-mail организации
          </span>
          <span className="block">{jurSubject.email || 'отсутствует'}</span>
        </div>
        <div className="mb-20">
          <span className="block text_18_bold text-left mb-5">
            Банковские реквизиты
          </span>
          <span className="block">
            Наименование банка: {jurSubject.bankName}
          </span>
          <span className="block">БИК банка: {jurSubject.bankBik}</span>
          <span className="block">К/с банка: {jurSubject.bankKs}</span>
          <span className="block">Р/с банка: {jurSubject.bankRs}</span>
        </div>
      </div>

      <div className="col col--content">
        <div className="mb-20">
          <span className="block text_18_bold text-left mb-5">
            Почтовый адрес
          </span>
          {[
            'country',
            'region',
            'area',
            'city',
            'settlement',
            'street',
            'building',
            'apartment',
            'postcode',
          ].map(
            target =>
              jurSubject.mailingAddress[target] && (
                <span className="block">
                  {jurSubject.mailingAddress[target]}
                </span>
              ),
          )}
        </div>
        <div className="mb-20">
          <span className="block text_18_bold text-left mb-5">
            Компания работает
          </span>
          <span className="block">
            {jurSubject.hasNds ? 'с НДС' : 'без НДС'}
          </span>
        </div>
      </div>
    </div>
  </Container>
);
