import { Input } from 'antd';
import { FC, Fragment } from 'react';

interface IProps {
  value: string;
  handleSearch: (value: string) => void;
}

const SearchInput: FC<IProps> = ({ value, handleSearch }) => {
  return (
    <Fragment>
      {/* {!!activeSection && (
        <button
          className="messenger-window__back no-bg no-border"
          onClick={() => dispatch(goToMessengerRoot())}
        >
          <img src="/img/icons/arrow-left.svg" alt="arrow-left" />
        </button>
      )} */}
      <Input
        suffix={<img src="/img/icons/chat-search.svg" alt="Поиск" />}
        placeholder="Поиск"
        value={value}
        onChange={({ target: { value } }) => handleSearch(value)}
        className="messenger-window__chat-search"
      />
    </Fragment>
  );
};

export default SearchInput;
