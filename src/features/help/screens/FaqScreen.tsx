import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import FormScreen from '@/components/common/FormScreen';
import ListState from '@/components/common/ListState';
import RoundButton from '@/components/common/RoundButton';
import { Icon, Segmented, Text } from '@/components/ui';
import { useSessionStore } from '@/store/sessionStore';
import { colors } from '@/theme';

import { useFaq } from '../hooks/useContent';

type Audience = 'client' | 'provider';

// The web FAQ page (Faq.dc.html) on a phone: violet header with a search field, a
// clients / providers switch and one-at-a-time accordion cards.
export default function FaqScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useSessionStore((s) => s.user?.role);
  const faq = useFaq();
  const [audience, setAudience] = useState<Audience>(role === 'provider' ? 'provider' : 'client');
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const all = faq.data?.[audience] ?? [];
  const text = q.trim().toLowerCase();
  const items = text
    ? all.filter(
        (x) => x.question.toLowerCase().includes(text) || x.answer.toLowerCase().includes(text),
      )
    : all;
  // First question open by default, as on the canvas; a search opens nothing by itself.
  const expanded = openId ?? (text ? null : (items[0]?.id ?? null));
  const email = faq.data?.supportEmail;

  const header = (
    <View
      className="bg-primary"
      style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 44 }}
    >
      <RoundButton icon="chevronLeft" label={t('common.back')} onPress={() => router.back()} />
      <Text
        weight={800}
        className="text-[24px] leading-[30px] text-sheet"
        style={{ marginTop: 14 }}
      >
        {t('help.faq.title')}
      </Text>
      <Text weight={700} className="text-[14px] text-primary-soft" style={{ marginTop: 4 }}>
        {t('help.faq.subtitle')}
      </Text>
      <View
        className="flex-row items-center rounded-pill bg-sheet"
        style={{ marginTop: 16, height: 52, paddingHorizontal: 18, gap: 10 }}
      >
        <Icon name="search" size={20} color={colors.muted} strokeWidth={2.2} />
        <TextInput
          value={q}
          onChangeText={(value) => {
            setQ(value);
            setOpenId(null);
          }}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel={t('help.faq.searchLabel')}
          placeholder={t('help.faq.searchPlaceholder')}
          placeholderTextColor={colors.muted}
          maxFontSizeMultiplier={1.3}
          className="flex-1 text-ink"
          style={{
            fontFamily: 'Nunito_600SemiBold',
            fontSize: 15,
            paddingVertical: 0,
            minWidth: 0,
          }}
        />
      </View>
    </View>
  );

  return (
    <FormScreen
      header={header}
      sheet="ground"
      contentStyle={{ padding: 20, paddingBottom: Math.max(insets.bottom, 24), gap: 14 }}
    >
      <Segmented
        tone="sheet"
        options={[
          { key: 'client', label: t('help.faq.forClients') },
          { key: 'provider', label: t('help.faq.forProviders') },
        ]}
        value={audience}
        onChange={(key) => {
          setAudience(key);
          setOpenId(null);
        }}
      />

      <ListState
        loading={faq.isPending}
        error={faq.isError}
        onRetry={faq.refetch}
        empty={items.length === 0}
        emptyTitle={t('help.faq.emptyTitle')}
        emptyBody={t('help.faq.emptyBody')}
      >
        <View style={{ gap: 8 }}>
          {items.map((item) => {
            const isOpen = item.id === expanded;
            return (
              <View key={item.id} className="bg-sheet" style={{ borderRadius: 18 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  onPress={() => setOpenId(isOpen ? '' : item.id)}
                  className="flex-row items-center"
                  style={{
                    minHeight: 60,
                    paddingVertical: 10,
                    paddingRight: 10,
                    paddingLeft: 16,
                    gap: 12,
                  }}
                >
                  <Text weight={800} className="flex-1 text-[16px] leading-[22px] text-ink">
                    {item.question}
                  </Text>
                  <View
                    className="items-center justify-center rounded-full"
                    style={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      backgroundColor: isOpen ? colors.primary.DEFAULT : colors.ground,
                    }}
                  >
                    <Icon
                      name={isOpen ? 'minus' : 'plus'}
                      size={18}
                      color={isOpen ? colors.sheet : colors.primary.pressed}
                      strokeWidth={2.6}
                    />
                  </View>
                </Pressable>
                {isOpen ? (
                  <Text
                    weight={600}
                    className="text-[15px] leading-[23px] text-inkSoft"
                    style={{ paddingHorizontal: 16, paddingBottom: 16 }}
                  >
                    {item.answer}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </ListState>

      {email ? (
        <View
          className="flex-row items-center bg-sheet"
          style={{ borderRadius: 22, padding: 16, gap: 14 }}
        >
          <View
            className="items-center justify-center rounded-full bg-primary-soft"
            style={{ width: 48, height: 48, flexShrink: 0 }}
          >
            <Icon name="mail" size={22} color={colors.primary.pressed} strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text weight={800} className="text-[16px] text-ink">
              {t('help.faq.contactTitle')}
            </Text>
            <Text
              weight={800}
              className="text-[14px] text-primary-pressed"
              style={{ marginTop: 2 }}
              onPress={() => Linking.openURL(`mailto:${email}`).catch(() => undefined)}
            >
              {email}
            </Text>
          </View>
        </View>
      ) : null}
    </FormScreen>
  );
}
