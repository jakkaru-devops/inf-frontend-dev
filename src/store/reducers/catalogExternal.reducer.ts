import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { ICatalogExternalPageEnum } from 'sections/CatalogExternal/interfaces';
import { IAppState } from 'store';

export interface ICatalogExternalState {
  pageType: ICatalogExternalPageEnum;
  stateCount: number;
}

const initialState: ICatalogExternalState = {
  pageType: ICatalogExternalPageEnum.groups,
  stateCount: 0,
};
const reducerName = 'catalogExternal';

export const catalogExternalSlice = createSlice({
  name: reducerName,
  initialState,
  reducers: {
    setCatalogExternalPageType(state, action) {
      state.pageType = action.payload;
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

export const { setCatalogExternalPageType } = catalogExternalSlice.actions;

export const getCatalogExternalState = (state: IAppState) =>
  state.catalogExternal;
