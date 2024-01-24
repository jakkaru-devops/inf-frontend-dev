import { Button } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { Container } from 'components/common';
import {
  IUser,
  IUserRole,
  IUserRoleLabelsDefault,
} from 'sections/Users/interfaces';
import useHandlers from '../handlers/punish.handler';
import { IComplainReason } from 'sections/Users/interfaces';
import { FC } from 'react';

export const Punish: FC<{
  user: IUser;
  userRole: IUserRole;
  roleLabel: IUserRoleLabelsDefault;
}> = ({ user, userRole, roleLabel }) => {
  const {
    locale,
    minusRating,
    requestsBanWeeks,
    banWeeks,
    reasonList,
    handlers,
    punishUser,
  } = useHandlers({ user, userRole, roleLabel });

  return (
    <Container size="small">
      {roleLabel === 'seller' && (
        <div className="mb-20">
          <span className="block text_14 mb-10">Уменьшения рейтинга</span>
          {[
            { value: 1, label: 'Лишение 1-й звезды рейтинга' },
            { value: 2, label: 'Лишение 2-х звезд рейтинга' },
            { value: 3, label: 'Лишение 3-х звезд рейтинга' },
          ].map((item, i) => (
            <Checkbox
              key={i}
              checked={item.value === minusRating}
              onChange={e =>
                handlers.handleRatingDowngrade(
                  e.target.checked ? item.value : 0,
                )
              }
              className="flex align-items-center ml-0 mb-10"
            >
              {item.label}
            </Checkbox>
          ))}
        </div>
      )}

      <div className="mb-20">
        <span className="block text_14 mb-10">Блокировка запросов</span>
        {[
          { weeks: 1, label: '1 неделя' },
          { weeks: 4, label: '1 месяц' },
          { weeks: 12, label: '3 месяца' },
          { weeks: 24, label: '6 месяцев' },
        ].map((requestBanData, i) => (
          <Checkbox
            key={i}
            className="flex align-items-center ml-0 mb-10"
            checked={requestsBanWeeks === requestBanData.weeks}
            onChange={e =>
              handlers.handleRequestsBanWeeksChange(
                e.target.checked ? requestBanData.weeks : null,
              )
            }
          >
            {requestBanData.label}
          </Checkbox>
        ))}
      </div>

      <Checkbox
        className="flex align-items-center ml-0 mb-20"
        checked={banWeeks === 4200}
        onChange={e =>
          handlers.handleBanWeeksChange(e.target.checked ? 4200 : null)
        }
      >
        <span className="text_14">Блокировка аккаунта</span>
      </Checkbox>

      <div className="mb-15">
        <span className="block text_14 mb-10">Причина</span>

        {['spam', 'behaviour', 'fraud', 'nonobservance'].map(
          (reason: IComplainReason, i) => (
            <Checkbox
              key={i}
              className="flex align-items-center ml-0 mb-10"
              disabled={
                requestsBanWeeks === null && banWeeks === null && !minusRating
              }
              checked={reasonList && reasonList.includes(reason)}
              onChange={() => handlers.handleReasonListChange(reason)}
            >
              {locale.complaint.reasons[reason]}
            </Checkbox>
          ),
        )}
      </div>

      <Button type="primary" className="color-white mt-20" onClick={punishUser}>
        Сохранить
      </Button>
    </Container>
  );
};
