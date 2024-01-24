import { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'components/common';
import { useRouter } from 'next/router';
import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { APP_PATHS } from 'data/paths.data';
import { Container } from '..';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl } from 'utils/common.utils';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import _ from 'lodash';
import { IAutoType } from 'sections/Catalog/interfaces/categories.interfaces';
import classNames from 'classnames';

interface IProps {
  list: {
    link: string;
    text?: string;
  }[];
  showPersonalAreaLink?: boolean;
  rightContent?: JSX.Element;
  useHistory?: boolean;
  autoTypes?: IRowsWithCount<IAutoType[]>;
  backgroundWhite?: boolean;
  size?: 'default' | 'small';
}

const BreadCrumbs: FC<IProps> = ({
  list,
  showPersonalAreaLink = true,
  rightContent,
  useHistory = true,
  autoTypes,
  backgroundWhite,
  size,
}) => {
  const { locale } = useLocale();
  const router = useRouter();

  const history: string[] = useMemo(
    () => [].concat(router?.query?.history).filter(Boolean),
    [router?.query],
  );

  const [isAbleToGoBack, setIsAbleToGoBack] = useState(false);

  useEffect(() => {
    if (window.history.length > 2) setIsAbleToGoBack(true);
  }, [router, router.asPath]);

  const defineToRemoveCurrentParams = (item: string) =>
    item === 'personal-area' ||
    (item === 'catalog' && router.pathname === '/catalog/product/[productId]');

  const defineToClearAutoBrand = (item: string) => {
    if (!autoTypes) return false;
    for (const autoType of autoTypes?.rows || []) {
      if (item?.toLowerCase()?.includes(autoType?.name?.toLowerCase())) {
        return true;
      }
    }
  };

  return (
    <div
      className={classNames('bread-crumbs', {
        'bg-white': backgroundWhite,
        'size-small': size === 'small',
      })}
    >
      <Container className="bread-crumbs__container">
        <div className="row">
          <div className="col">
            <ul className="bread-crumbs__list null">
              {isAbleToGoBack && (
                <li className="bread-crumbs__item item-back">
                  <Button
                    shape="circle"
                    size="small"
                    onClick={() => router.back()}
                  >
                    <LeftOutlined />
                  </Button>
                </li>
              )}
              <li className="bread-crumbs__item">
                <Link href={APP_PATHS.HOME} className="bread-crumbs__link">
                  <img
                    src="/img/home.svg"
                    alt=""
                    className="svg bread-crumbs__icon"
                  />
                </Link>
              </li>
              {history.length > 0 && useHistory ? (
                _.uniq(history).map((item, i) => {
                  let text: string =
                    item?.[0] !== '['
                      ? locale?.navigation?.[item.replace('/', '')] ||
                        item.replace('/', '')
                      : JSON.parse(item)?.[1] || item;
                  if (item?.[0] === '[' && text.indexOf(' 7') === 0) {
                    text = text.replace('7', '+7');
                  }
                  if (item?.[0] === '/') {
                    item = item.replace('/', '');
                  }
                  const isLastItem = i === history.length - 1;

                  return (
                    <li key={i} className="bread-crumbs__item">
                      <Link
                        href={
                          !isLastItem
                            ? generateInnerUrl(
                                item?.[0] !== '['
                                  ? '/' + item
                                  : JSON.parse(item)?.[0] || item,
                                {
                                  searchParams: {
                                    history: history.filter((el, j) => j <= i),
                                    autoBrand: defineToClearAutoBrand(item)
                                      ? null
                                      : router?.query?.autoBrand,
                                  },
                                  removeCurrentParams:
                                    defineToRemoveCurrentParams(item),
                                },
                              )
                            : router.asPath
                        }
                        className="bread-crumbs__link active text_12"
                      >
                        {text}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <>
                  {showPersonalAreaLink && (
                    <li className="bread-crumbs__item">
                      <Link
                        href={generateInnerUrl(APP_PATHS.PERSONAL_AREA)}
                        className="bread-crumbs__link active text_12"
                      >
                        {locale.common.personalArea}
                      </Link>
                    </li>
                  )}
                  {list.map((item, i) => (
                    <li key={i} className="bread-crumbs__item">
                      <Link
                        href={item.link}
                        className="bread-crumbs__link active text_12"
                      >
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          <div className="col d-flex">{rightContent}</div>
        </div>
      </Container>
    </div>
  );
};

export default BreadCrumbs;
