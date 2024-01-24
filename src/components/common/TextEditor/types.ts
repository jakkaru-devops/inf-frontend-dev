import { MouseEvent as ReactMouseEvent } from 'react';

export interface EditorEvent {
  isDefaultPrevented(): boolean;
  isImmediatePropagationStopped(): boolean;
  isPropagationStopped(): boolean;
  preventDefault(): void;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
  type: string;
}

export interface TextEditorProps {
  className?: string;
  hasSubmit?: boolean;
  id?: string;
  isInitialized: boolean;
  language?: string;
  onClose?: () => void;
  onEditorChange: (value: string) => void;
  onInit?: (e: EditorEvent) => void;
  onSubmit?: (e: ReactMouseEvent<HTMLElement, MouseEvent>) => void;
  submitButtonText?: string;
  type?: 'full' | 'limited';
  value: string;
  padding?: {
    left?: string;
    top?: string;
    right?: string;
    bottom?: string;
  };
  placeholder?: string;
}
