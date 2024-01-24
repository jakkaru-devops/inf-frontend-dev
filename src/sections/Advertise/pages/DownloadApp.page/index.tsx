import { Button } from 'antd';
import { Link } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { Fragment, useState } from 'react';
import { DOWNLOAD_APP_CLASSNAME } from './data';
import DownloadAppContentDesktop from './ContentDesktop';
import DownloadAppContentMobile from './ContentMobile';
import AppInfoModal from 'components/complex/Footer/AppInfoModal';
import AppContactsModal from 'components/complex/Footer/AppContactsModal';

const CLASSNAME = DOWNLOAD_APP_CLASSNAME;

const DownloadAppPage = () => {
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [isContactsModalVisible, setContactsModalVisible] = useState(false);

  const webLinks = (
    <div className={`${CLASSNAME}__web-links`}>
      <div className="button-wrapper">
        <Link
          href={APP_PATHS.HOME}
          onClick={e => {
            e.preventDefault();
            window.location.href = APP_PATHS.HOME;
          }}
        >
          <Button type="default" size="small">
            <span className="button-inner">Открыть web версию</span>
          </Button>
        </Link>
      </div>
      <div className="button-wrapper">
        <Button
          type="default"
          size="small"
          onClick={() => setInfoModalVisible(true)}
        >
          <span className="button-inner">Информация</span>
        </Button>
      </div>
      <div className="button-wrapper">
        <Button
          type="default"
          size="small"
          onClick={() => setContactsModalVisible(true)}
        >
          <span className="button-inner">Контакты</span>
        </Button>
      </div>
    </div>
  );

  return (
    <Fragment>
      <div className={CLASSNAME}>
        <DownloadAppContentDesktop webLinks={webLinks} />
        <DownloadAppContentMobile webLinks={webLinks} />
      </div>

      <AppInfoModal
        open={isInfoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
      />

      <AppContactsModal
        open={isContactsModalVisible}
        onCancel={() => setContactsModalVisible(false)}
        width="auto"
      />
    </Fragment>
  );
};

export default DownloadAppPage;
