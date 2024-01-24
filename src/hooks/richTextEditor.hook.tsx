import { RichTextEditor } from 'components/common';
import { useMemo } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';

export const useRichTextEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), []);

  const clearValue = () => {
    editor.deleteBackward('block');
    editor.deleteForward('block');
  };

  const insertText = (value: string) => {
    editor.insertText(value);
  };

  return {
    Editor: RichTextEditor,
    editor,
    clearValue,
    insertText,
  };
};
