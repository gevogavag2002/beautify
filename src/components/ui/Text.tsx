import { Text as RNText, type TextProps } from 'react-native';

export type Weight = 400 | 600 | 700 | 800;

const families: Record<Weight, string> = {
  400: 'Nunito_400Regular',
  600: 'Nunito_600SemiBold',
  700: 'Nunito_700Bold',
  800: 'Nunito_800ExtraBold',
};

type Props = TextProps & { weight?: Weight; className?: string };

// The only way to render text. Font family is picked by weight; size/color via className.
export default function Text({ weight = 400, style, ...rest }: Props) {
  return (
    <RNText
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[{ fontFamily: families[weight], includeFontPadding: false }, style]}
    />
  );
}
