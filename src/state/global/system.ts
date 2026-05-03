import { atom } from 'jotai';

export type EnumTheme = 'LIGHT' | 'DARK';

export const themeAtom = atom<EnumTheme>('DARK');
