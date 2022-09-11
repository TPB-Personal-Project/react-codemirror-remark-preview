import * as themes from '@uiw/codemirror-themes-all'
export type Theme =
    'abcdef'
    | 'githubLight'
    | 'githubDark'
    | 'xcodeLight'
    | 'xcodeDark'
    | 'duotoneLight'
    | 'duotoneDark'
    | 'dracula'
    | 'darcula'
    | 'okaidia'
    | 'eclipse'
    | 'sublime'
    | 'bespin'
    | 'androidstudio'
    | 'atomone'
    | 'bbedit'

export const getTheme = (theme: Theme) => {
    return themes[theme];
}