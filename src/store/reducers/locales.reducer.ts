import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_LANGUAGE_LABEL } from 'locales/data';
import { ILanguage, ILanguageLabel } from 'locales/interfaces';
import { HYDRATE } from 'next-redux-wrapper';
import { IAppState } from 'store';

export interface ILocalesState {
  languageList: ILanguage[];
  defaultLanguage: ILanguage;
  currentLanguage: ILanguageLabel;
}

const initialState: ILocalesState = {
  languageList: [],
  defaultLanguage: null,
  currentLanguage: DEFAULT_LANGUAGE_LABEL,
};
const reducerName = 'locales';

export const localesSlice = createSlice({
  name: reducerName,
  initialState,
  reducers: {
    setLanguageList(state, action) {
      state.languageList = action.payload;
    },
    setDefaultLanguage(state, action) {
      state.defaultLanguage = action.payload;
    },
    setCurrentLanguage(state, action) {
      state.currentLanguage = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(HYDRATE, (state, action: any) => {
      return {
        ...state,
        ...action.payload[reducerName],
      };
    });
  },
});

export const { setLanguageList, setDefaultLanguage } = localesSlice.actions;

export const setCurrentLanguage = (label: ILanguageLabel) =>
  localesSlice.actions.setCurrentLanguage(label || DEFAULT_LANGUAGE_LABEL);

export const getLocalesState = (state: IAppState) => state.locales;
export const getCurrentLanguage = (state: IAppState) =>
  state.locales.currentLanguage;
