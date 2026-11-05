// Design tokens from the Beautify design canvas. Plain JS so tailwind.config.js can require it.
// Change tokens here only; never hardcode hex values in components.

const colors = {
  primary: { DEFAULT: '#6247E8', pressed: '#4C36C4', soft: '#EDE9FF', deep: '#2E1F8F' },
  ground: '#F4F2FF',
  sheet: '#FFFFFF',
  ink: '#1E1A33',
  muted: '#6B6585',
  hairline: '#E6E1F7',
  status: {
    pending: { fg: '#8A5200', bg: '#FFF3DC' },
    confirmed: { fg: '#0C6A5E', bg: '#DFF5F0' },
    cancelled: { fg: '#B0304F', bg: '#FFE7EC' },
    noshow: { fg: '#4A4A5C', bg: '#ECECF2' },
  },
  accent: {
    rose: { fg: '#A32A66', bg: '#FFE9F3' },
    amber: { fg: '#8A5200', bg: '#FFF2DC' },
    mint: { fg: '#0C6A5E', bg: '#E4F6F1' },
    sky: { fg: '#1F4FA8', bg: '#E6F0FF' },
  },
  dark: {
    ground: '#15121F',
    sheet: '#211D30',
    ink: '#EEEBF8',
    muted: '#A9A3C2',
    hairline: '#352F4A',
    primary: '#9C8BFF',
  },
};

const radius = {
  pill: '999px',
  card: '20px',
  sheet: '28px',
  frame: '36px',
  input: '14px',
};

const fontFamily = {
  sans: ['Nunito_400Regular'],
  semibold: ['Nunito_600SemiBold'],
  bold: ['Nunito_700Bold'],
  extrabold: ['Nunito_800ExtraBold'],
};

const spacing = { gutter: 20, tapTarget: 44 };

module.exports = { colors, radius, fontFamily, spacing };
