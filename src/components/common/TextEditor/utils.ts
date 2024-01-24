import { isClientSide } from 'utils/common.utils';

export const getTextEditorElement = (name: string) => {
  if (!isClientSide()) return null;
  const target = document
    .querySelector(`textarea[name=${name}]`)
    .parentElement.querySelector('div.se-wrapper-inner.sun-editor-editable');
  return target;
};

export const setTextEditorValue = (editorName: string, value: string) => {
  if (!isClientSide()) return;
  const target = getTextEditorElement(editorName);
  if (target) {
    target.innerHTML = value;
  }
};

export const getTextEditorContent = (editorName: string) => {
  if (!isClientSide()) return;
  const target = getTextEditorElement(editorName);
  const html = target.innerHTML;
  const text = target.textContent;
  return {
    html,
    text,
  };
};
