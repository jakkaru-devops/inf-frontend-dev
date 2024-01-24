export interface ITextEditorProps {
  height?: string;
  maxHeight?: string;
  name?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  width?: string;
  showToolbar?: boolean;
  autoFocus?: boolean;
}
