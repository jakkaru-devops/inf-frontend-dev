import { APP_PATHS } from 'data/paths.data';
import { Page, Container, Link } from 'components/common';
import { useLocale } from 'hooks/locale.hook';
import { generateUrl, renderHtml } from 'utils/common.utils';
import CategoriesSelection from 'sections/Catalog/components/CategoriesSelection';
import { useRouter } from 'next/router';
import { Button } from 'antd';
import { ArrowRightIcon, CustomRequestMiniIcon } from 'components/icons';
import { FC } from 'react';
import { IProductCategoriesBasic } from 'sections/Catalog/interfaces/categories.interfaces';
import CategoriesSelectionGroups from 'sections/Catalog/components/CategoriesSelection/Groups';
import { ANDROID_APP_URL, IOS_APP_URL } from 'data/external.data';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';

interface IProps {
  categories: IProductCategoriesBasic;
}

const HomePageContent: FC<IProps> = ({ categories }) => {
  const router = useRouter();
  const { locale } = useLocale();

  return (
    <Page className="home-page">
      <div className="home-page__content h-100-flex">
        <div className="home-page__top-wrapper">
          <Container className="home-page__top">
            <div className="home-page__top-left">
              <h1 className="home-page__top-title">
                {renderHtml(locale.pages.home.title)}
              </h1>
              <p className="home-page__top-description">
                Помогаем найти товары
                <br /> и заключить договор поставки между
                <br /> Поставщиком и Покупателем.
              </p>
              <Link
                href={generateUrl(
                  {
                    history: DEFAULT_NAV_PATHS.CUSTOM_ORDER,
                  },
                  {
                    pathname: APP_PATHS.CUSTOM_ORDER,
                    removeCurrentParams: true,
                  },
                )}
                className="home-page__top-link"
              >
                <Button type="primary">
                  <CustomRequestMiniIcon />
                  Поиск по фото/описанию
                </Button>
              </Link>
            </div>
            <div className="home-page__top-right">
              <img src="/img/home-page-spare-parts.png" alt="" />
            </div>
          </Container>
        </div>

        <Container className="home-page__middle">
          <div className="home-page__middle-left">
            <CategoriesSelection
              initialData={{
                ...categories,
                groups: [],
              }}
              defaultValues={{
                autoTypeId: router.query?.autoType as string,
              }}
              generateAutoTypeHref={autoTypeId =>
                generateUrl({ search: null, autoType: autoTypeId })
              }
              generateAutoBrandHref={(autoBrandId, selectedAutoTypeId) =>
                generateUrl(
                  {
                    search: null,
                    autoType: selectedAutoTypeId,
                    autoBrand: autoBrandId,
                  },
                  { pathname: APP_PATHS.PRODUCT_LIST },
                )
              }
            />
          </div>
          <div className="home-page__middle-right">
            <div className="home-page__app">
              <div>
                <div className="home-page__app-title">
                  Искать и заказывать
                  <br /> удобнее в мобильном
                  <br /> приложении
                </div>

                <div className="home-page__app-links">
                  <Link href={ANDROID_APP_URL}>
                    Google Play <ArrowRightIcon />
                  </Link>
                  <Link href={IOS_APP_URL}>
                    App Store <ArrowRightIcon />
                  </Link>
                </div>
              </div>

              <img
                src="/img/home-page-qr.svg"
                alt=""
                className="home-page__app-qr"
              />

              <img
                src="/img/home-page-phone.png"
                alt=""
                className="home-page__app-phone-image"
              />
            </div>
          </div>
        </Container>

        <div className="home-page__bottom-wrapper">
          <Container className="home-page__bottom categories-selection">
            <CategoriesSelectionGroups
              groups={categories.groups}
              selectedGroupIds={[]}
              onGroupClick={() => {}}
              generateHref={groupId =>
                generateUrl(
                  {
                    search: null,
                    autoType: null,
                    autoBrand: null,
                    autoModel: null,
                    group: groupId,
                    subgroup: null,
                  },
                  {
                    pathname: APP_PATHS.PRODUCT_LIST,
                  },
                )
              }
            />
          </Container>
        </div>
      </div>
    </Page>
  );
};

export default HomePageContent;
