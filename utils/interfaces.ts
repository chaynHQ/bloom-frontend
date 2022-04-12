import { Dispatch, SetStateAction } from 'react';

export interface ScaleFieldItem {
  name: string;
  inputState: number;
  inputStateSetter: Dispatch<SetStateAction<number>>;
}
