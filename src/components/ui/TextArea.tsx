import { useState } from 'react';
import { View, type TextInputProps } from 'react-native';

import { useSheetInput } from './sheetContext';

import { colors } from '@/theme';

import Text from './Text';

type Props = TextInputProps & {
  label: string;
  labelRight?: string;
  counter?: { value: number; max: number };
  hint?: string;
  error?: string;
  rows?: number;
};

// Multi-line field from the canvas: radius 16, hairline border on ground, 12/16 padding,
// 16/23 semibold text; focused = primary border, white bg, soft halo. Counter top-right.
export default function TextArea({
  label,
  labelRight,
  counter,
  hint,
  error,
  rows = 4,
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  // Stable component from context (TextInput or BottomSheetTextInput), not created here.
  const Field = useSheetInput();
  const border = error
    ? colors.status.cancelled.fg
    : focused
      ? colors.primary.DEFAULT
      : colors.hairline;
  return (
    <View>
      <View className="flex-row items-baseline justify-between" style={{ marginBottom: 6 }}>
        <Text weight={800} className="text-[14px] text-ink">
          {label}
          {labelRight ? (
            <Text weight={600} className="text-[14px] text-muted">
              {' '}
              · {labelRight}
            </Text>
          ) : null}
        </Text>
        {counter && (
          <Text
            weight={700}
            className="text-[13px]"
            style={{
              color: counter.value > counter.max ? colors.status.cancelled.fg : colors.muted,
            }}
          >
            {counter.value} / {counter.max}
          </Text>
        )}
      </View>
      <View style={{ padding: 4, margin: -4 }}>
        {focused && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: 20,
              backgroundColor: colors.primary.soft,
            }}
          />
        )}
        {/* eslint-disable-next-line react-hooks/static-components -- stable component from context */}
        <Field
          multiline
          maxFontSizeMultiplier={1.3}
          placeholderTextColor={colors.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            {
              minHeight: rows * 23 + 24,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: border,
              backgroundColor: focused ? colors.sheet : colors.ground,
              paddingVertical: 12,
              paddingHorizontal: 16,
              fontFamily: 'Nunito_600SemiBold',
              fontSize: 16,
              lineHeight: 23,
              color: colors.ink,
              textAlignVertical: 'top',
              includeFontPadding: false,
            },
            style,
          ]}
          {...rest}
        />
      </View>
      {(error || hint) && (
        <Text
          weight={error ? 700 : 600}
          className={`text-[13px] ${error ? 'text-status-cancelled-fg' : 'text-muted'}`}
          style={{ marginTop: 6 }}
        >
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}
