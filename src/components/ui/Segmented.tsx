import { Pressable, View } from 'react-native';

import { colors } from '@/theme';

import Text from './Text';

type Option<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (key: T) => void;
  /**
   * ground: grey track on a white sheet, active = white with a shadow (provider page tabs)
   * sheet: white track on ground, active = soft violet (sort)
   * violet: dark violet track on the header, active = white (reservations)
   */
  tone: 'ground' | 'sheet' | 'violet';
  /** Segment height; text size follows the canvas (13 for 36, 14-15 for 40). */
  height?: 36 | 40;
  fontSize?: 13 | 14 | 15;
};

const tones = {
  ground: {
    track: colors.ground,
    on: colors.sheet,
    onText: colors.primary.pressed,
    text: colors.muted,
  },
  sheet: {
    track: colors.sheet,
    on: colors.primary.soft,
    onText: colors.primary.pressed,
    text: colors.muted,
  },
  violet: {
    track: colors.primary.dim,
    on: colors.sheet,
    onText: colors.primary.pressed,
    text: colors.sheet,
  },
};

// Pill segmented control. The active pill is a separate view mounted only for the selected
// segment: on Android a background added to an existing view later is drawn without radius.
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone,
  height = 40,
  fontSize = 14,
}: Props<T>) {
  const c = tones[tone];
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row"
      style={{ borderRadius: 999, padding: 4, gap: 4, backgroundColor: c.track }}
    >
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.key)}
            hitSlop={{ top: 4, bottom: 4 }}
            className="flex-1 items-center justify-center"
            style={{ height }}
          >
            {on && (
              <View
                pointerEvents="none"
                style={[
                  {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    borderRadius: height / 2,
                    backgroundColor: c.on,
                  },
                  tone === 'ground' && {
                    shadowColor: colors.primary.deep,
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  },
                ]}
              />
            )}
            <Text
              weight={on || tone === 'sheet' ? 800 : 700}
              numberOfLines={1}
              style={{ fontSize, color: on ? c.onText : c.text }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
