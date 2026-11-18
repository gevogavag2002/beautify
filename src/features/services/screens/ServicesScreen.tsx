import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ListState from '@/components/common/ListState';
import Toast, { useToast } from '@/components/common/Toast';
import StatusBarBand from '@/components/common/StatusBarBand';
import { Icon, Switch, Text } from '@/components/ui';
import { useMyProvider, useUpdateMyProvider } from '@/hooks/useMyProvider';
import { colors } from '@/theme';
import type { ProviderService } from '@/types';
import { errorMessage } from '@/utils/apiError';
import { hoursSummary } from '@/utils/hoursSummary';

import HoursSheet from '../components/HoursSheet';
import { AddServiceSheet, EditServiceSheet } from '../components/ServiceSheets';

export default function ServicesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const provider = useMyProvider();
  const update = useUpdateMyProvider();
  const [editing, setEditing] = useState<ProviderService | null>(null);
  const [adding, setAdding] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const p = provider.data;

  const done = (close: () => void) => (message: string) => {
    close();
    toast.show(message);
  };
  const toggleAuto = (value: boolean) =>
    update.mutate(
      { autoAccept: value },
      {
        onSuccess: () => toast.show(t(value ? 'services.autoOnToast' : 'services.autoOffToast')),
        onError: (e) => toast.show(errorMessage(e, t('schedule.failed'))),
      },
    );
  const active = p ? p.services.filter((s) => !s.hidden).length : 0;
  const hours = p ? hoursSummary(p.workingHours, t) : null;

  return (
    <View className="flex-1 bg-ground">
      <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
        <View
          className="bg-primary"
          style={{ paddingTop: insets.top + 22, paddingHorizontal: 20, paddingBottom: 46 }}
        >
          <Text weight={700} className="text-[13px] text-primary-soft" numberOfLines={1}>
            {p?.businessName ?? ' '}
          </Text>
          <Text
            weight={800}
            className="text-[24px] leading-[30px] text-sheet"
            style={{ marginTop: 2 }}
          >
            {t('services.title')}
          </Text>
        </View>

        <View
          className="rounded-t-sheet bg-ground"
          style={{ marginTop: -24, padding: 20, paddingBottom: 24 }}
        >
          <ListState
            loading={provider.isPending}
            error={provider.isError}
            onRetry={provider.refetch}
          >
            {p && hours ? (
              <View style={{ gap: 14 }}>
                <View
                  className="flex-row items-center bg-sheet"
                  style={{ borderRadius: 22, padding: 16, gap: 14 }}
                >
                  <View
                    className="items-center justify-center rounded-full"
                    style={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      backgroundColor: colors.accent.amber.bg,
                    }}
                  >
                    <Icon name="bolt" size={24} color={colors.accent.amber.fg} strokeWidth={2.2} />
                  </View>
                  <View className="flex-1">
                    <Text weight={800} className="text-[16px] text-ink">
                      {t('services.auto')}
                    </Text>
                    <Text
                      weight={600}
                      className="text-[13px] leading-[18px] text-muted"
                      style={{ marginTop: 2 }}
                    >
                      {p.autoAccept ? t('services.autoOn') : t('services.autoOff')}
                    </Text>
                  </View>
                  <Switch
                    value={p.autoAccept}
                    onChange={toggleAuto}
                    disabled={update.isPending}
                    label={t('services.auto')}
                  />
                </View>

                <View>
                  <View
                    className="flex-row items-center justify-between"
                    style={{ marginHorizontal: 2, marginBottom: 8, gap: 8 }}
                  >
                    <Text weight={800} className="text-[17px] text-ink">
                      {t('services.yours')}
                    </Text>
                    <Text weight={700} className="text-[13px] text-muted">
                      {t('services.active', { count: active })}
                    </Text>
                  </View>
                  <View style={{ gap: 8 }}>
                    {p.services.map((s) => (
                      <View
                        key={s.id}
                        className="flex-row items-center bg-sheet"
                        style={{
                          minHeight: 60,
                          borderRadius: 18,
                          paddingVertical: 8,
                          paddingRight: 8,
                          paddingLeft: 16,
                          gap: 12,
                        }}
                      >
                        <View className="flex-1">
                          <Text
                            weight={800}
                            className={`text-[16px] ${s.hidden ? 'text-muted' : 'text-ink'}`}
                            numberOfLines={1}
                          >
                            {s.name}
                          </Text>
                          {s.hidden ? (
                            <Text weight={700} className="text-[12px] text-muted">
                              {t('services.hidden')}
                            </Text>
                          ) : null}
                        </View>
                        <View
                          className="rounded-pill"
                          style={{
                            flexShrink: 0,
                            paddingVertical: 4,
                            paddingHorizontal: 10,
                            backgroundColor: s.hidden
                              ? colors.status.noshow.bg
                              : colors.primary.soft,
                          }}
                        >
                          <Text
                            weight={800}
                            className="text-[13px]"
                            style={{
                              color: s.hidden ? colors.status.noshow.fg : colors.primary.pressed,
                            }}
                          >
                            {t('common.min', { value: s.durationMin })}
                          </Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t('services.edit', { name: s.name })}
                          onPress={() => setEditing(s)}
                          className="items-center justify-center rounded-full bg-ground active:bg-primary-soft"
                          style={{ width: 44, height: 44, flexShrink: 0 }}
                        >
                          <Icon
                            name="pencil"
                            size={18}
                            color={colors.primary.pressed}
                            strokeWidth={2.2}
                          />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setAdding(true)}
                    className="flex-row items-center justify-center active:opacity-70"
                    style={{
                      marginTop: p.services.length ? 10 : 0,
                      height: 52,
                      borderRadius: 26,
                      borderWidth: 2,
                      borderStyle: 'dashed',
                      borderColor: colors.dash.strong,
                      gap: 8,
                    }}
                  >
                    <Icon
                      name="plusWide"
                      size={18}
                      color={colors.primary.pressed}
                      strokeWidth={2.6}
                    />
                    <Text weight={800} className="text-[15px] text-primary-pressed">
                      {t('services.addButton')}
                    </Text>
                  </Pressable>
                </View>

                <View>
                  <Text
                    weight={800}
                    className="text-[17px] text-ink"
                    style={{ marginHorizontal: 2, marginBottom: 8 }}
                  >
                    {t('services.hours.title')}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setHoursOpen(true)}
                    className="flex-row items-center bg-sheet active:opacity-80"
                    style={{
                      borderRadius: 18,
                      paddingVertical: 12,
                      paddingRight: 12,
                      paddingLeft: 14,
                      gap: 12,
                    }}
                  >
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        backgroundColor: colors.accent.mint.bg,
                      }}
                    >
                      <Icon
                        name="clock"
                        size={20}
                        color={colors.accent.mint.fg}
                        strokeWidth={2.2}
                      />
                    </View>
                    <View className="flex-1">
                      <Text weight={800} className="text-[15px] text-ink" numberOfLines={1}>
                        {hours.title}
                      </Text>
                      <Text weight={600} className="text-[13px] text-muted" numberOfLines={2}>
                        {hours.sub}
                      </Text>
                    </View>
                    <Icon name="chevronRight" size={18} color={colors.muted} strokeWidth={2.4} />
                  </Pressable>
                </View>
              </View>
            ) : null}
          </ListState>
        </View>
      </ScrollView>
      <StatusBarBand />

      <Toast message={toast.message} />

      <EditServiceSheet
        service={editing}
        onClose={() => setEditing(null)}
        onDone={done(() => setEditing(null))}
      />
      {p ? (
        <>
          <AddServiceSheet
            open={adding}
            onClose={() => setAdding(false)}
            onDone={done(() => setAdding(false))}
            provider={p}
          />
          <HoursSheet
            open={hoursOpen}
            onClose={() => setHoursOpen(false)}
            onDone={done(() => setHoursOpen(false))}
            provider={p}
          />
        </>
      ) : null}
    </View>
  );
}
