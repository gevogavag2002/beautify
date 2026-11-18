import { useRef, type ComponentRef } from 'react';
import { TextInput, View } from 'react-native';

import { colors } from '@/theme';

type Props = {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  onComplete?: (code: string) => void;
};

// Six 58px cells, radius 16. One hidden-value-per-cell approach: each cell holds one digit,
// typing moves forward, backspace moves back.
export default function OtpInput({ value, onChange, error, onComplete }: Props) {
  const refs = useRef<(ComponentRef<typeof TextInput> | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');
  const active = Math.min(value.length, 5);

  const setAt = (i: number, ch: string) => {
    const clean = ch.replace(/\D/g, '');
    if (!clean) return;
    // Paste of a whole code into any cell
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6);
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
      if (pasted.length === 6) onComplete?.(pasted);
      return;
    }
    const next = (value.slice(0, i) + clean + value.slice(i + 1)).slice(0, 6);
    onChange(next);
    if (i < 5) refs.current[i + 1]?.focus();
    if (next.length === 6) onComplete?.(next);
  };

  return (
    <View className="flex-row" style={{ gap: 8 }}>
      {digits.map((d, i) => {
        const isActive = i === active && !error;
        return (
          <View
            key={i}
            className="flex-1"
            style={[
              { borderRadius: 20, padding: 4, margin: -4 },
              isActive && { backgroundColor: colors.primary.soft },
            ]}
          >
            <TextInput
              ref={(r) => {
                refs.current[i] = r;
              }}
              accessibilityLabel={`Digit ${i + 1}`}
              autoFocus={i === 0}
              maxFontSizeMultiplier={1.2}
              value={d}
              onChangeText={(ch) => setAt(i, ch)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  if (d) onChange(value.slice(0, i) + value.slice(i + 1));
                  else if (i > 0) {
                    onChange(value.slice(0, i - 1) + value.slice(i));
                    refs.current[i - 1]?.focus();
                  }
                }
              }}
              onFocus={() => {
                // keep cursor at the first empty cell
                if (i > value.length) refs.current[value.length]?.focus();
              }}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              style={{
                height: 58,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: error
                  ? colors.status.cancelled.fg
                  : isActive
                    ? colors.primary.DEFAULT
                    : colors.hairline,
                backgroundColor: isActive ? colors.sheet : colors.ground,
                fontFamily: 'Nunito_800ExtraBold',
                fontSize: 24,
                color: colors.ink,
                padding: 0,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
