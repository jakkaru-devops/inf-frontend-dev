import { Button } from 'antd';
import classNames from 'classnames';
import { createRef, FC, KeyboardEvent, RefObject, useCallback } from 'react';
import { Descendant, Editor, Transforms, Node, Text } from 'slate';
import { Slate, Editable } from 'slate-react';
import { IRichTextEditorProps } from './interfaces';

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = (Editor as any).nodes(editor, {
      match: n => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = (Editor as any).nodes(editor, {
      match: n => n.type === 'code',
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    (Transforms as any).setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: n => Text.isText(n), split: true },
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Editor.isBlock(editor, n) },
    );
  },
};

// Define a serializing function that takes a value and returns a string.
export const serializeTextEditorValue = (value: Descendant[]) => {
  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map(n => `<p>${Node.string(n)}</p>`)
      // Join them all with line breaks denoting paragraphs.
      // .join('\n')
      .join('')
  );
};

// Define a deserializing function that takes a string and returns a value.
const deserialize = (value: string) => {
  // Return a value array of children derived by splitting the string.
  return value.split('\n').map(line => {
    return {
      children: [{ text: line }],
    };
  });
};

const RichTextEditor: FC<IRichTextEditorProps> = ({
  editor,
  value,
  setValue,
  onSubmit,
  placeholder,
  showToolbar = true,
  className,
  noBorder,
  suffix,
  editableWrapperClassName,
  autoFocus,
}) => {
  const editableWrapperRef: RefObject<HTMLDivElement> = createRef();

  // useEffect(() => {
  //   setValue(deserialize(localStorage.getItem('content')) || '');
  // }, []);

  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // Define a leaf rendering function that is memoized with `useCallback`.
  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />;
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Handle enter pressed
      if (event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) {
          editor.insertBreak();
          if (!editableWrapperRef.current) return;
          editableWrapperRef.current
            .querySelector('.text-editor__editable')
            .scrollTo(0, 0);
        } else {
          onSubmit(value);
        }
      }

      if (!event.ctrlKey) {
        return;
      }

      switch (event.key) {
        case '`': {
          event.preventDefault();
          CustomEditor.toggleCodeBlock(editor);
          break;
        }

        case 'b': {
          event.preventDefault();
          CustomEditor.toggleBoldMark(editor);
          break;
        }
      }
    },
    [value],
  );

  return (
    <div
      className={classNames(['text-editor', className], {
        'editable-no-border': noBorder,
      })}
    >
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        {showToolbar && (
          <div className="text-editor__toolbar">
            <Button
              onMouseDown={event => {
                event.preventDefault();
                CustomEditor.toggleBoldMark(editor);
              }}
            >
              Bold
            </Button>
            <Button
              onMouseDown={event => {
                event.preventDefault();
                CustomEditor.toggleCodeBlock(editor);
              }}
            >
              Code Block
            </Button>
          </div>
        )}
        {/* <Scrollbars
          autoHeightMin={0}
          autoHeightMax={94}
          autoHeight={true}
          universal={true}
          renderTrackHorizontal={props => (
            <div
              {...props}
              style={{ display: 'none' }}
              className="track-horizontal"
            />
          )}
          renderView={props => (
            <div {...props} style={{ ...props.style, overflowX: 'hidden' }} />
          )}
          className="text-editor__editable-wrapper"
        > */}
        <div
          className={classNames([
            'text-editor__editable-wrapper',
            editableWrapperClassName,
          ])}
          ref={editableWrapperRef}
          onClick={() => {
            if (!editableWrapperRef.current) return;
            (
              editableWrapperRef.current.querySelector(
                '.text-editor__editable',
              ) as HTMLDivElement
            ).focus();
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              position: 'relative',
            }}
          >
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              className="text-editor__editable"
              placeholder={placeholder}
              tabIndex={-1}
              autoFocus={autoFocus}
              onKeyDown={handleKeyDown}
            />
            {!!suffix && <div className="text-editor__suffix">{suffix}</div>}
          </div>
        </div>
        {/* </Scrollbars> */}
      </Slate>
    </div>
  );
};

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>;
};

// Define a React component to render leaves with bold text.
const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  );
};

export default RichTextEditor;
