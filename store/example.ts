import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

export const exampleSlice = createSlice({
  name: 'example',

  initialState: {} as any,

  reducers: {},

  extraReducers: {
    [HYDRATE]: (state, action) => {
      console.log('HYDRATE', state, action.payload);
      return {
        ...state,
        ...action.payload.example,
      };
    },
  },
});

export default exampleSlice.reducer;
