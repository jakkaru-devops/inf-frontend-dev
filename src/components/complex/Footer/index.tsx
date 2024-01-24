import { useState, useEffect } from 'react';
import { FOOTER_MODAL_DATA } from './data';
import { useRouter } from 'next/router';
import { useLocale } from 'hooks/locale.hook';
import AppInfoModal from './AppInfoModal';
import AppContactsModal from './AppContactsModal';

const Footer = () => {
  const { locale } = useLocale();
  const router = useRouter();

  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [isContactsModalVisible, setContactsModalVisible] = useState(false);
  const [infoItems, setInfoItems] = useState(
    FOOTER_MODAL_DATA.map(() => ({
      isCollapsed: false,
    })),
  );

  useEffect(() => {
    if (router.query['app-info'] !== undefined) {
      const items: string[] = [].concat(router.query['app-info']);

      if (items.length === 1 && items[0] === 'contacts') {
        setContactsModalVisible(true);
        return;
      }

      setInfoModalVisible(true);
      setInfoItems(
        FOOTER_MODAL_DATA.map(item => ({
          isCollapsed: items.includes(item.label),
        })),
      );
      return;
    }
  }, [router.query['app-info']]);

  return (
    <footer className="main-footer">
      <div className="container">
        <a href="tel:83952717700" className="main-footer__phone link">
          8 (3952) 717-700
        </a>
        <div className="main-footer__items-wrapper">
          <div
            className="main-footer__item link"
            onClick={() => setInfoModalVisible(true)}
          >
            {locale.common.information}
          </div>
          <div
            className="main-footer__item link"
            onClick={() => setContactsModalVisible(true)}
          >
            {locale.common.contacts}
          </div>
        </div>

        <AppInfoModal
          open={isInfoModalVisible}
          onCancel={() => setInfoModalVisible(false)}
          infoItems={infoItems}
          setInfoItems={setInfoItems}
        />

        <AppContactsModal
          open={isContactsModalVisible}
          onCancel={() => setContactsModalVisible(false)}
        />
      </div>
    </footer>
  );
};

export default Footer;
