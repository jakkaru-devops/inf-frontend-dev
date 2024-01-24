import { TextArea } from 'components/common';
import { IEmoji } from 'components/complex/Messenger/interfaces';
import { ReactNode, RefObject, useMemo, useRef, useState } from 'react';
import { generateRandomCode, renderHtml } from 'utils/common.utils';

interface IProps {
  suffix?: ReactNode;
  onSubmit?: () => void;
}

export const useTextArea = ({ suffix, onSubmit }: IProps) => {
  // const [stateCounter, setStateCounter] = useState(0);
  const editorRef: RefObject<HTMLDivElement> = useRef();
  const key = useMemo(
    () => `textarea-${generateRandomCode({ length: 10, symbols: false })}`,
    [],
  );
  const [isEmpty, setIsEmpty] = useState(true);
  const Editor = (
    <TextArea
      editorRef={editorRef}
      className={`textarea-test`}
      placeholder="Текст сообщения..."
      isEmpty={isEmpty}
      setIsEmpty={setIsEmpty}
      suffix={suffix}
      onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          if (!!onSubmit) onSubmit();
        }
      }}
    />
  );

  const pasteHtmlAtCaret = (html: string) => {
    var sel, range;
    if (window.getSelection) {
      // IE9 and non-IE
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();

        // Range.createContextualFragment() would be useful here but is
        // non-standard and not supported in all browsers (IE9, for one)
        var el = document.createElement('div');
        el.innerHTML = html;
        var frag = document.createDocumentFragment(),
          node,
          lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);

        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  };

  const pasteEmoji = (emoji: IEmoji) => {
    const editor: HTMLDivElement = editorRef?.current;
    if (!editor) return;
    editor.focus();
    console.log(emoji);
    pasteHtmlAtCaret(
      `<img src="/img/emojis/${emoji.name}.png" alt="${emoji.emoji}" class="emoji-img">`,
    );
    setIsEmpty(false);
  };

  const getValueHtml = () => {
    const editor: HTMLDivElement = editorRef?.current;
    if (!editor) return;

    interface IReactNode {
      type: string;
      props: {
        alt: string;
        children: (IReactNode | string)[];
      };
    }
    function transformNode(el: IReactNode | string, nestingLevel: number) {
      if (typeof el === 'string') return el;
      if (typeof el === 'object') {
        // console.log('ALT', el.props.alt);
        if (el.type === 'img') return el.props.alt;
        if (!!el?.props?.children?.length) {
          return `<${el.type}>${el.props.children
            .map(child => transformNode(child, nestingLevel + 1))
            .join('')}</${el.type}>`;
        } else {
          return `<${el.type}>`;
        }
        // if (el.type === 'div' && !el?.props?.children) {
        //   return `<div><br></div>`;
        // }
      }
      return '';
    }

    const nodes: (IReactNode | string)[] = [].concat(
      renderHtml(editor.innerHTML),
    );
    const result = nodes.map(el => transformNode(el, 0)).join('');
    // console.log('HTML', editor.innerHTML);
    // console.log('NODES', nodes);
    // console.log('RESULT', result);
    return result;
  };

  const clear = () => {
    const editor: HTMLDivElement = editorRef?.current;
    if (!editor) return;

    editor.innerHTML = null;
    setIsEmpty(true);
  };

  return {
    Editor: { ...Editor, className: '' },
    editorRef,
    key,
    isEmpty,
    setIsEmpty,
    pasteEmoji,
    getValueHtml,
    clear,
  };
};
