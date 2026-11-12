import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button, Icon, Text } from '@/components/ui';
import { colors } from '@/theme';

import RegisterHeader from '../components/RegisterHeader';
import { useSetMyServices } from '../hooks/useAuth';
import { useServiceCategories } from '../hooks/useCatalog';
import { totalSteps, useRegisterStore } from '../store';

export default function PickServicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useRegisterStore();
  const catalog = useServiceCategories();
  const save = useSetMyServices();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const headerTitle = d.providerTypeName
    ? t('auth.register.headerTitleWithType', { type: d.providerTypeName })
    : t('auth.register.headerTitle');

  const isOpen = (id: string, i: number) => open[id] ?? i < 2; // first two groups open by default, as in the canvas
  const names = useMemo(() => {
    const m: Record<string, string> = {};
    catalog.data?.forEach((c) => c.services.forEach((s) => (m[s.id] = s.name)));
    return m;
  }, [catalog.data]);

  const ids = Object.keys(d.services);
  const missing = ids.filter((id) => d.services[id] == null);
  const ready = ids.length > 0 && missing.length === 0;
  const blocker =
    missing.length === 1
      ? t('auth.services.setMinutesFor', { name: names[missing[0]] ?? '' })
      : missing.length > 1
        ? t('auth.services.setMinutesCount', { count: missing.length })
        : t('auth.services.pickOne');
  const summary =
    ids.length === 0
      ? t('auth.services.none')
      : `${t('auth.services.summary', { count: ids.length })} · ${missing.length ? t('auth.services.withoutMinutes', { count: missing.length }) : t('auth.services.allSet')}`;

  const q = query.trim().toLowerCase();

  const finish = () =>
    save.mutate(
      ids.map((id) => ({ catalogServiceId: id, durationMin: d.services[id] ?? 0 })),
      {
        onSuccess: () => {
          d.reset();
          router.replace('/(provider)/schedule');
        },
      },
    );

  return (
    <KeyboardAvoidingView className="flex-1 bg-ground" behavior="padding">
      <RegisterHeader
        title={headerTitle}
        heading={t('auth.services.title')}
        step={5}
        total={totalSteps('provider')}
        last
      />
      <View
        className="flex-1 rounded-t-sheet bg-ground"
        style={{ marginTop: -24, paddingTop: 18, paddingHorizontal: 20, gap: 12 }}
      >
        <Text weight={600} className="text-[14px] leading-[20px] text-[#4A4562]">
          {t('auth.services.intro')}
        </Text>
        <View
          className="flex-row items-center rounded-pill bg-sheet"
          style={{
            height: 48,
            paddingHorizontal: 16,
            gap: 10,
            borderWidth: 2,
            borderColor: colors.hairline,
          }}
        >
          <Icon name="search" size={18} color={colors.muted} strokeWidth={2.4} />
          <TextInput
            accessibilityLabel={t('auth.services.search')}
            placeholder={t('auth.services.search')}
            placeholderTextColor={colors.muted}
            maxFontSizeMultiplier={1.3}
            returnKeyType="search"
            clearButtonMode="while-editing"
            value={query}
            onChangeText={setQuery}
            style={{
              flex: 1,
              fontFamily: 'Nunito_600SemiBold',
              fontSize: 15,
              color: colors.ink,
              padding: 0,
            }}
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16, gap: 6 }}
          keyboardShouldPersistTaps="always"
        >
          {q &&
            !(catalog.data ?? []).some((c) =>
              c.services.some((sv) => sv.name.toLowerCase().includes(q)),
            ) && (
              <Text
                weight={600}
                className="text-center text-[14px] text-muted"
                style={{ paddingVertical: 24 }}
              >
                {t('auth.services.noResults')}
              </Text>
            )}
          {(catalog.data ?? []).map((cat, i) => {
            const items = cat.services.filter((s) => !q || s.name.toLowerCase().includes(q));
            if (q && items.length === 0) return null;
            const count = cat.services.filter((s) => s.id in d.services).length;
            const expanded = q ? true : isOpen(cat.id, i);
            return (
              <View key={cat.id} style={{ gap: 6 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  onPress={() => setOpen((o) => ({ ...o, [cat.id]: !expanded }))}
                  className="flex-row items-center"
                  style={{ height: 48, marginTop: 6, paddingHorizontal: 4, gap: 8 }}
                >
                  <Text weight={800} className="flex-1 text-[16px] text-ink">
                    {cat.name}
                  </Text>
                  {count > 0 && (
                    <View
                      className="rounded-pill bg-primary-soft"
                      style={{ paddingVertical: 3, paddingHorizontal: 10 }}
                    >
                      <Text weight={800} className="text-[12px] text-primary-pressed">
                        {t('auth.services.picked', { count })}
                      </Text>
                    </View>
                  )}
                  <Icon
                    name="chevronDown"
                    size={18}
                    color={colors.muted}
                    strokeWidth={2.6}
                    style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                  />
                </Pressable>
                {expanded &&
                  items.map((s) => {
                    const sel = s.id in d.services;
                    const min = sel ? d.services[s.id] : null;
                    const miss = sel && min == null;
                    const lessOff = miss || (min ?? 0) <= 5;
                    return (
                      <View
                        key={s.id}
                        className="overflow-hidden bg-sheet"
                        style={{
                          borderRadius: 18,
                          borderWidth: 2,
                          borderColor: miss
                            ? colors.status.cancelled.fg
                            : sel
                              ? colors.primary.DEFAULT
                              : colors.sheet,
                        }}
                      >
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: sel }}
                          onPress={() => d.toggleService(s.id)}
                          className="flex-row items-center"
                          style={{ minHeight: 52, paddingHorizontal: 14, gap: 12 }}
                        >
                          <View
                            className="items-center justify-center"
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 8,
                              borderWidth: 2,
                              borderColor: sel ? colors.primary.DEFAULT : '#B9B3CC',
                              backgroundColor: sel ? colors.primary.DEFAULT : colors.sheet,
                            }}
                          >
                            {sel && (
                              <Icon name="check" size={14} color={colors.sheet} strokeWidth={3.4} />
                            )}
                          </View>
                          <Text
                            weight={700}
                            className="flex-1 text-[16px] text-ink"
                            numberOfLines={2}
                          >
                            {s.name}
                          </Text>
                          {sel && !miss && (
                            <Text
                              weight={800}
                              className="text-[14px] text-primary-pressed"
                              style={{ flexShrink: 0 }}
                            >
                              {t('auth.services.min', { count: min ?? 0 })}
                            </Text>
                          )}
                        </Pressable>
                        {sel && (
                          <View
                            className="flex-row items-center justify-between"
                            style={{ paddingLeft: 50, paddingRight: 14, paddingBottom: 12, gap: 8 }}
                          >
                            <Text
                              weight={700}
                              className="text-[13px]"
                              style={{ color: miss ? colors.status.cancelled.fg : colors.muted }}
                            >
                              {miss ? t('auth.services.howLong') : t('auth.services.stepHint')}
                            </Text>
                            <View className="flex-row items-center" style={{ gap: 4 }}>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t('auth.services.fewer', { name: s.name })}
                                disabled={lessOff}
                                onPress={() =>
                                  min != null && min > 5 && d.setMinutes(s.id, min - 5)
                                }
                                className="items-center justify-center rounded-full bg-ground"
                                style={{ width: 44, height: 44 }}
                              >
                                <Icon
                                  name="minus"
                                  size={18}
                                  color={lessOff ? '#B9B3CC' : colors.primary.pressed}
                                  strokeWidth={2.6}
                                />
                              </Pressable>
                              <Text
                                weight={800}
                                className="text-center text-[16px]"
                                style={{ minWidth: 64, color: miss ? colors.muted : colors.ink }}
                              >
                                {miss
                                  ? t('auth.services.noMin')
                                  : t('auth.services.min', { count: min ?? 0 })}
                              </Text>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t('auth.services.more', { name: s.name })}
                                onPress={() =>
                                  d.setMinutes(s.id, min == null ? 15 : Math.min(min + 5, 240))
                                }
                                className="items-center justify-center rounded-full bg-primary"
                                style={{ width: 44, height: 44 }}
                              >
                                <Icon
                                  name="plus"
                                  size={18}
                                  color={colors.sheet}
                                  strokeWidth={2.6}
                                />
                              </Pressable>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View
        className="bg-sheet"
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.hairline,
          paddingTop: 12,
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 20),
          gap: 10,
        }}
      >
        <Text weight={700} className="text-center text-[14px] text-[#4A4562]">
          {summary}
        </Text>
        {ready ? (
          <Button label={t('auth.services.cta')} onPress={finish} disabled={save.isPending} />
        ) : (
          <Button label={blocker} disabled />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
