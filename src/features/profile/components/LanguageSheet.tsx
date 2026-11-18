import { useQueryClient } from '@tanstack/react-query';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon, Sheet, Text } from '@/components/ui';
import { LANGUAGES, type Language } from '@/i18n';
import { colors } from '@/theme';

type Props = { open: boolean; onClose: () => void };

// App language picker (no mockup: built from the radio rows used in other sheets). Texts
// the server writes are refetched in the new language.
export default function LanguageSheet({ open, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const pick = (language: Language) => {
    if (language !== i18n.language) {
      i18n.changeLanguage(language).then(() => qc.invalidateQueries());
    }
    onClose();
  };
  return (
    <Sheet open={open} title={t('profile.sheet.language.title')} onClose={onClose}>
      <Text weight={600} className="text-[14px] leading-[20px] text-inkSoft">
        {t('profile.sheet.language.note')}
      </Text>
      <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
        {LANGUAGES.map((language) => {
          const sel = language === i18n.language;
          return (
            <Pressable
              key={language}
              accessibilityRole="radio"
              accessibilityState={{ checked: sel }}
              onPress={() => pick(language)}
              className="flex-row items-center"
              style={{
                minHeight: 56,
                borderRadius: 16,
                borderWidth: 2,
                paddingHorizontal: 14,
                gap: 10,
                borderColor: sel ? colors.primary.DEFAULT : colors.hairline,
                backgroundColor: sel ? colors.primary.faint : colors.sheet,
              }}
            >
              <Text weight={800} className="flex-1 text-[16px] text-ink">
                {t(`language.${language}`)}
              </Text>
              {sel ? (
                <Icon name="checkWide" size={18} color={colors.primary.DEFAULT} strokeWidth={3} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
