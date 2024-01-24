import { Modal } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { useLocale } from 'hooks/locale.hook';
import { FC, Fragment, useEffect, useState } from 'react';
import {
  FOOTER_MODAL_DATA,
  FOOTER_MODAL_DATA_MAIN_TEXT,
  FOOTER_SERVICE_DOCS,
} from './data';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { IServiceDoc } from 'interfaces/files.interfaces';
import { ISetState } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { getCurrentLanguage } from 'store/reducers/locales.reducer';
import { renderHtml } from 'utils/common.utils';

interface IProps {
  open: boolean;
  onCancel: () => void;
  infoItems?: Array<{
    isCollapsed: boolean;
  }>;
  setInfoItems?: ISetState<
    Array<{
      isCollapsed: boolean;
    }>
  >;
}

const AppInfoModal: FC<IProps> = ({
  open,
  onCancel,
  infoItems,
  setInfoItems,
}) => {
  const { locale } = useLocale();
  const router = useRouter();
  const currentLanguage = useSelector(getCurrentLanguage);
  const [activeDoc, setActiveDoc] = useState<IServiceDoc>(null);
  const [openHtmlDocs, setOpenHtmlDocs] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);
  if (!infoItems) {
    const itemsState = useState(
      FOOTER_MODAL_DATA.map(() => ({
        isCollapsed: false,
      })),
    );
    infoItems = itemsState[0];
    setInfoItems = itemsState[1];
  }

  useEffect(() => {
    const openDocLabel = router.query?.['open-doc'];
    if (!openDocLabel) return;

    const doc: IServiceDoc = FOOTER_SERVICE_DOCS.find(
      el => el.label === openDocLabel,
    );
    if (!doc) return;

    setOpenHtmlDocs(true);
    setActiveDoc(doc);
  }, [router.query['open-doc']]);

  const handleItemTitleClick = (i: number) => {
    infoItems[i].isCollapsed = !infoItems[i].isCollapsed;
    setInfoItems(infoItems);
    setStateCounter(stateCounter + 1);
  };

  const handleDocClick = (doc: IServiceDoc) => setActiveDoc(doc);

  return (
    <Fragment>
      <Modal
        open={open}
        onCancel={onCancel}
        centered
        title={locale.common.information}
        footer={null}
        wrapClassName="app-info__modal-wrapper"
        className="app-info__modal"
        width="auto"
      >
        <div className="app-info">
          <p className="app-info__main-text">
            {FOOTER_MODAL_DATA_MAIN_TEXT[currentLanguage]}
          </p>

          {FOOTER_MODAL_DATA.map((infoItem, i) => (
            <div
              key={i}
              className={classNames('app-info__item', {
                'is-collapsed': infoItems[i].isCollapsed,
              })}
            >
              <div className="app-info__item__title-wrapper">
                <div
                  className="app-info__item__title"
                  onClick={() => handleItemTitleClick(i)}
                >
                  <CaretDownOutlined />
                  <h2>{infoItem.title[currentLanguage]}</h2>
                </div>
              </div>
              <div className="app-info__item__text">
                {infoItem.label === 'documents'
                  ? FOOTER_SERVICE_DOCS.map((doc, j) => (
                      <div key={j}>
                        <a
                          href={doc.url}
                          target="_blank"
                          className="color-white text-underline"
                          onClick={e => {
                            e.preventDefault();
                            handleDocClick(doc);
                          }}
                        >
                          {doc.name}
                        </a>
                      </div>
                    ))
                  : infoItem.text[currentLanguage]}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={!!activeDoc}
        onCancel={() => setActiveDoc(null)}
        centered
        width={'1000px'}
        footer={null}
        title={activeDoc?.name}
        destroyOnClose
        children={
          openHtmlDocs && !!activeDoc?.html ? (
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              {renderHtml(activeDoc.html)}
            </div>
          ) : (
            <object>
              <embed
                src={activeDoc?.url}
                width="100%"
                style={{ height: '90vh' }}
                type="application/pdf"
              />
            </object>
          )
        }
      />
    </Fragment>
  );
};

export default AppInfoModal;
