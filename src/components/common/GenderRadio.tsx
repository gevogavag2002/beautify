import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import type { Gender } from '@/types';

type Props = { value: Gender; onChange: (g: Gender) => void };

// Two-column radio: h48, radius 14, selected = primary border, #F7F5FF bg, violet text.
export default function GenderRadio({ value, onChange }: Props) {
  const { t } = useTranslation();
  const options: Gender[] = ['male', 'female'];
  return (
    <View>
      <Text
        weight={800}
        className="text-[14px] leading-[18px] text-ink"
        style={{ marginBottom: 4 }}
      >
        {t('auth.details.gender')}
      </Text>
      <View className="flex-row" style={{ gap: 8 }}>
        {options.map((g) => {
          const sel = g === value;
          return (
            <Pressable
              key={g}
              accessibilityRole="radio"
              accessibilityState={{ checked: sel }}
              onPress={() => onChange(g)}
              className="flex-1 flex-row items-center justify-center rounded-input"
              style={{
                height: 48,
                borderWidth: 2,
                gap: 8,
                borderColor: sel ? colors.primary.DEFAULT : colors.hairline,
                backgroundColor: sel ? '#F7F5FF' : colors.ground,
              }}
            >
              <View
                className="items-center justify-center rounded-full bg-sheet"
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderColor: sel ? colors.primary.DEFAULT : '#B9B3CC',
                }}
              >
                <View
                  className="rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: sel ? colors.primary.DEFAULT : 'transparent',
                  }}
                />
              </View>
              <Text
                weight={800}
                className="text-[16px]"
                style={{ color: sel ? colors.primary.pressed : colors.ink }}
              >
                {t(`auth.details.${g}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
