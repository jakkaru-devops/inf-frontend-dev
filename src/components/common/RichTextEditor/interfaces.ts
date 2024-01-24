import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

export interface IRichTextEditorBasicProps {
  value: Descendant[];
  setValue: (value: Descendant[]) => void;
  onSubmit: (value: Descendant[]) => void;
  placeholder?: string;
  showToolbar?: boolean;
  className?: string;
  noBorder?: boolean;
  suffix?: JSX.Element;
  editableWrapperClassName?: string;
  autoFocus?: boolean;
}

export interface IRichTextEditorProps extends IRichTextEditorBasicProps {
  editor: BaseEditor & ReactEditor;
}

export interface IUseRichTextEditorProps {
  editor: BaseEditor & ReactEditor;
}
