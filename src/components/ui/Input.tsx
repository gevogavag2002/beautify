import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme';

import Icon from './Icon';
import Text from './Text';

type Props = TextInputProps & {
  label?: string;
  labelRight?: React.ReactNode;
  hint?: string;
  /** Shown in red under the field; also turns the border red. */
  error?: string;
  secure?: boolean;
  /** 'ok' = green border + white bg (passwords match), 'focus' = violet border + halo */
  tone?: 'default' | 'ok';
  height?: 54 | 48;
  className?: string;
};

// Text field from the canvas: label 14/800, field radius 16 (h54) or 14 (h48),
// border 2 hairline on ground; focused: primary border, white bg, 4px soft halo.
export default function Input({
  label,
  labelRight,
  hint,
  error,
  secure,
  tone = 'default',
  height = 54,
  className = '',
  style,
  ...rest
}: Props) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const radius = height === 54 ? 16 : 14;
  const border = focused
    ? colors.primary.DEFAULT
    : tone === 'ok'
      ? colors.status.confirmed.fg
      : colors.hairline;
  const bg = focused || tone === 'ok' ? colors.sheet : colors.ground;

  return (
    <View className={className}>
      {(label || labelRight) && (
        <View
          className="flex-row items-center justify-between"
          style={{ marginBottom: height === 54 ? 6 : 4 }}
        >
          {label && (
            <Text weight={800} className="text-[14px] leading-[18px] text-ink">
              {label}
            </Text>
          )}
          {labelRight}
        </View>
      )}
      <View
        style={[
          { borderRadius: radius + 4, padding: 4, margin: -4 },
          focused && { backgroundColor: colors.primary.soft },
        ]}
      >
        <View
          style={{
            height,
            borderRadius: radius,
            borderWidth: 2,
            borderColor: border,
            backgroundColor: bg,
          }}
        >
          <TextInput
            maxFontSizeMultiplier={1.3}
            placeholderTextColor={colors.muted}
            secureTextEntry={secure && !show}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[
              {
                flex: 1,
                paddingLeft: height === 54 ? 16 : 14,
                paddingRight: secure ? (height === 54 ? 56 : 52) : height === 54 ? 16 : 14,
                fontFamily: 'Nunito_700Bold',
                fontSize: height === 54 ? 17 : 16,
                color: colors.ink,
                paddingVertical: 0,
                textAlignVertical: 'center',
                includeFontPadding: false,
              },
              style,
            ]}
            {...rest}
          />
          {secure && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={show ? t('common.hidePassword') : t('common.showPassword')}
              onPress={() => setShow((s) => !s)}
              className="absolute items-center justify-center rounded-[12px]"
              style={{
                top: height === 54 ? 3 : 0,
                right: height === 54 ? 3 : 0,
                width: 44,
                height: 44,
              }}
            >
              <Icon
                name={show ? 'eyeOff' : 'eyeOpen'}
                size={height === 54 ? 22 : 20}
                color={colors.muted}
                strokeWidth={2.2}
              />
            </Pressable>
          )}
        </View>
      </View>
      {error ? (
        <Text weight={700} className="mt-1 text-[13px] leading-[17px] text-status-cancelled-fg">
          {error}
        </Text>
      ) : hint ? (
        <Text weight={600} className="mt-1 text-[13px] leading-[17px] text-muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
