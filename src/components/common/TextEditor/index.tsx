import { ITextEditorProps } from './interfaces';
import { useSelector } from 'react-redux';
import SunEditor from 'suneditor-react';
import { RefObject, createRef, useCallback, LegacyRef, FC } from 'react';
import { getCurrentLanguage } from 'store/reducers/locales.reducer';

const TextEditor: FC<ITextEditorProps> = ({
  onChange,
  name,
  value,
  disabled,
  placeholder = '',
  maxHeight = 'auto',
  height,
  width,
  showToolbar = false,
  autoFocus,
}) => {
  const currentLanguage: any = useSelector(getCurrentLanguage);
  const wrapperRef: RefObject<HTMLDivElement> = createRef();
  const editorRef: LegacyRef<typeof SunEditor> = createRef();
  const Editor = SunEditor as any;

  const handleEnterPressed = useCallback(
    (e: KeyboardEvent) => {
      if (e.shiftKey) {
        if (!wrapperRef.current) return;
        wrapperRef.current.scroll({
          top: 2000,
        });
      }
      // if (e.shiftKey) return;
      // e.preventDefault();
      // const target = getTextEditorElement(name);

      // if (target && !(target.innerHTML === '<p>​<br></p>')) {
      //   if (onPostMessage) {
      //     onPostMessage();
      //   }

      //   if (onSubmit) {
      //     const { text } = getTextEditorContent(name);
      //     onSubmit(text);
      //   }
      // }
    },
    [wrapperRef, value],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
        }
        handleEnterPressed(e);
      }
    },
    [wrapperRef],
  );

  return (
    <Editor
      ref={editorRef}
      showToolbar={showToolbar}
      autoFocus={autoFocus}
      onChange={onChange}
      setContents={value}
      lang={currentLanguage}
      name={name}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      width={width}
      height={height}
      disable={disabled}
      setOptions={{
        resizingBar: false,
        buttonList: [
          ['undo', 'redo'],
          ['bold', 'underline', 'italic'],
          ['table'],
          ['fullScreen'],
        ],
      }}
      maxCharCount={30}
    />
  );
};

export default TextEditor;
