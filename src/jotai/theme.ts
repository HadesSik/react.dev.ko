import {atom, useAtomValue, useSetAtom} from 'jotai';

export type Theme = 'dark' | 'light' | undefined;
const themeState = atom<Theme>(
  typeof window !== 'undefined'
    ? (localStorage.getItem('theme') as Theme)
    : undefined
);

const themeAtom = atom(
  null,
  (get, set, fn: Theme | ((prev: Theme) => Theme)) => {
    const prev = get(themeState);
    const res = typeof fn === 'function' ? fn(prev) : fn;
    const stored = localStorage.getItem('theme') as Theme;
    const media = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = res || stored || (media ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set(themeState, theme);
    localStorage.setItem('theme', theme);
  }
);

export const useTheme = () => useAtomValue(themeState);
export const useSetTheme = () => useSetAtom(themeAtom);
