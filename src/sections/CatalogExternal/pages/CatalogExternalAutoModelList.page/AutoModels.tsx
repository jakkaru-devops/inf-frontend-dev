import { Link } from 'components/common';
import { FC } from 'react';
import {
  IAcatMark,
  IAcatModel,
  IAcatType,
} from 'sections/CatalogExternal/interfaces';

interface IProps {
  type: IAcatType;
  mark: IAcatMark;
  models: IAcatModel[];
  onAutoModelClick?: (autoModel: IAcatModel) => void;
}

const ExternalCatalogAcatAutoModels: FC<IProps> = ({
  type,
  mark,
  models,
  onAutoModelClick,
}) => {
  let autoModels = models || [];
  if (mark?.archival) autoModels = autoModels.filter(model => !model.archival);

  let rowsNumber = Math.ceil(autoModels.length / 3) || 1;
  if (rowsNumber < 15) rowsNumber = 15;
  const cols: number[][] = [];
  for (let i = 0; i < autoModels.length; i++) {
    if (i % rowsNumber === 0) {
      cols.push([]);
    }
    cols[cols.length - 1].push(i);
  }

  return (
    <ul className="catalog-external__auto-models">
      {cols.map((col, i) => (
        <div key={i} className="catalog-external__auto-models__col">
          {col.map((index, j) => {
            const item = autoModels[index];

            return (
              <li key={j} className="catalog-external__auto-models__item">
                <Link
                  href={
                    [window.location.pathname, item.id].join('/') +
                    window.location.search
                  }
                  onClick={e => {
                    if (!!onAutoModelClick) {
                      e.preventDefault();
                      onAutoModelClick(item);
                    }
                  }}
                >
                  {!item?.name?.includes(mark?.name) && mark?.name + ' '}
                  {item?.name}{' '}
                </Link>
                {item?.relevance && (
                  <span className="catalog-external__auto-models__item-relevance">
                    Актуальность: {item?.relevance}
                  </span>
                )}
              </li>
            );
          })}
        </div>
      ))}
    </ul>
  );
};

export default ExternalCatalogAcatAutoModels;
