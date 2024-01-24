import classNames from 'classnames';
import { ISetState } from 'interfaces/common.interfaces';
import { FC, KeyboardEvent, ReactNode, RefObject, useEffect } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { simplifyHtml } from 'utils/common.utils';

interface IProps {
  className?: string;
  editorRef: RefObject<HTMLDivElement>;
  suffix?: ReactNode;
  placeholder?: ReactNode;
  isEmpty: boolean;
  setIsEmpty: ISetState<boolean>;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  children?: ReactNode;
}

const TextArea: FC<IProps> = ({
  className,
  editorRef,
  suffix,
  placeholder,
  isEmpty,
  setIsEmpty,
  onKeyDown,
  children,
}) => {
  useEffect(() => {
    const editor = editorRef?.current as HTMLDivElement;
    if (!editor) return;

    editor.addEventListener('input', e => {
      const target = e.target as HTMLDivElement;
      const value = target?.innerHTML || null;
      setIsEmpty(!value?.length || value === '<div><br></div>');
    });

    editor.addEventListener('paste', e => {
      // cancel paste
      e.preventDefault();

      // get text representation of clipboard
      const html = e.clipboardData.getData('text/html');

      // insert text manually
      document.execCommand('insertHTML', false, simplifyHtml(html));
    });
  }, []);

  return (
    <Scrollbars
      width="100%"
      autoHeightMin={0}
      autoHeightMax={92}
      autoHeight={true}
      universal={true}
      renderTrackHorizontal={props => (
        <div
          {...props}
          style={{ display: 'none' }}
          className="track-horizontal"
        />
      )}
      className="textarea-scrollbars"
    >
      <div className="textarea-wrapper">
        <div
          ref={editorRef}
          className={classNames(['textarea', className])}
          contentEditable={true}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              const editor = editorRef?.current as HTMLDivElement;
              if (!editor) return;
              e.preventDefault();
              e.stopPropagation();
            }
            onKeyDown(e);
          }}
        >
          {children}
        </div>
        {!!placeholder && isEmpty && (
          <div className="textarea-placeholder">{placeholder}</div>
        )}
        {!!suffix && <div className="textarea-suffix">{suffix}</div>}
      </div>
    </Scrollbars>
  );
};

export default TextArea;
