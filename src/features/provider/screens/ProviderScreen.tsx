import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ListState from '@/components/common/ListState';
import PhotoTile from '@/components/common/PhotoTile';
import ProviderAvatar from '@/components/common/ProviderAvatar';
import RoundButton from '@/components/common/RoundButton';
import ScreenState from '@/components/common/ScreenState';
import StatTile from '@/components/common/StatTile';
import StatusBarBand from '@/components/common/StatusBarBand';
import { Segmented, Text } from '@/components/ui';
import { colors } from '@/theme';
import type { ProviderDetails, WorkingHours } from '@/types';
import { isNotFound } from '@/utils/apiError';
import { dayLabel, shortAddress } from '@/utils/format';
import { whenLabel } from '@/utils/when';

import Stars from '../components/Stars';
import { useMyProvider } from '@/hooks/useMyProvider';
import { useProvider, useProviderRatings } from '@/hooks/useProvider';

type Tab = 'services' | 'portfolio' | 'ratings';
const TABS: Tab[] = ['services', 'portfolio', 'ratings'];
const DOW: (keyof WorkingHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const GUTTER = 20;
const GAP = 8;

const ServiceRow = ({
  name,
  description,
  min,
}: {
  name: string;
  description: string | null;
  min: string;
}) => (
  <View
    className="flex-row items-center bg-ground"
    style={{
      minHeight: 64,
      borderRadius: 18,
      paddingVertical: 10,
      paddingRight: 10,
      paddingLeft: 14,
      gap: 12,
    }}
  >
    <View className="flex-1">
      <Text weight={800} className="text-[16px] text-ink" numberOfLines={2}>
        {name}
      </Text>
      {description ? (
        <Text weight={600} className="text-[13px] text-muted" numberOfLines={2}>
          {description}
        </Text>
      ) : null}
    </View>
    <View
      className="rounded-pill bg-sheet"
      style={{ paddingVertical: 4, paddingHorizontal: 10, flexShrink: 0 }}
    >
      <Text weight={800} className="text-[13px] text-primary-pressed">
        {min}
      </Text>
    </View>
  </View>
);

const PhotoGrid = ({
  provider,
  limit,
  size,
}: {
  provider: ProviderDetails;
  limit?: number;
  size: number;
}) => (
  <View className="flex-row flex-wrap" style={{ gap: GAP }}>
    {provider.portfolio.slice(0, limit).map((photo, i) => (
      <PhotoTile key={photo.id} url={photo.url} index={i} size={size} />
    ))}
  </View>
);

function Ratings({ provider }: { provider: ProviderDetails }) {
  const { t } = useTranslation();
  const ratings = useProviderRatings(provider.id, true);
  return (
    <View style={{ gap: 8 }}>
      <View
        className="flex-row items-center bg-ground"
        style={{ borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, gap: 14 }}
      >
        <Text weight={800} className="text-[32px] leading-[38px] text-ink">
          {provider.rating.toFixed(1)}
        </Text>
        <View style={{ gap: 4 }}>
          <Stars value={Math.round(provider.rating)} size={18} />
          <Text weight={600} className="text-[13px] text-muted">
            {t('provider.ratingsCount', { count: provider.ratingCount })}
          </Text>
        </View>
      </View>
      <ListState
        tone="ground"
        loading={ratings.isPending}
        error={ratings.isError}
        onRetry={ratings.refetch}
        empty={ratings.data?.length === 0}
        emptyTitle={t('provider.ratingsEmpty')}
        emptyBody={t('provider.ratingsEmptyBody')}
      >
        <View style={{ gap: 8 }}>
          {(ratings.data ?? []).map((r) => (
            <View
              key={r.id}
              className="flex-row items-center bg-ground"
              style={{
                minHeight: 56,
                borderRadius: 18,
                paddingVertical: 10,
                paddingHorizontal: 14,
                gap: 12,
              }}
            >
              <View className="flex-1">
                <Text weight={800} className="text-[15px] text-ink" numberOfLines={1}>
                  {r.clientName}
                </Text>
                <Text weight={600} className="text-[13px] text-muted">
                  {dayLabel(r.createdAt)}
                </Text>
              </View>
              <Stars value={r.stars} />
            </View>
          ))}
        </View>
      </ListState>
    </View>
  );
}

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProviderView id={id} />;
}

/** The provider's own public page, opened from their profile: same page, no Reserve. */
export function ProviderPreviewScreen() {
  const mine = useMyProvider();
  const router = useRouter();
  return (
    <ScreenState
      loading={mine.isPending}
      error={mine.isError}
      onRetry={mine.refetch}
      onBack={() => router.back()}
    >
      {mine.data ? <ProviderView id={mine.data.id} preview /> : null}
    </ScreenState>
  );
}

function ProviderView({ id, preview }: { id: string; preview?: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const query = useProvider(id);
  const [tab, setTab] = useState<Tab>('services');
  const p = query.data;

  const back = () =>
    router.canGoBack()
      ? router.back()
      : router.replace(preview ? '/(provider)/(tabs)/profile' : '/(client)/(tabs)');
  // Floored: a fractional width makes the third tile wrap on some screens.
  const photo = Math.floor((width - GUTTER * 2 - GAP * 2) / 3);

  const body = () => {
    if (!p) return null;
    const today = p.workingHours[DOW[new Date().getDay()]];
    const empty = (title: string, text: string) => (
      <View className="items-center rounded-card bg-ground" style={{ padding: 22 }}>
        <Text weight={800} className="text-center text-[16px] text-ink">
          {title}
        </Text>
        <Text weight={600} className="text-center text-[14px] text-muted" style={{ marginTop: 6 }}>
          {text}
        </Text>
      </View>
    );
    return (
      <View className="flex-1 bg-sheet">
        <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
          <View
            className="bg-primary"
            style={{ paddingTop: insets.top + 16, paddingHorizontal: GUTTER, paddingBottom: 44 }}
          >
            <View className="flex-row items-center justify-between">
              <RoundButton icon="chevronLeft" label={t('common.back')} onPress={back} />
              <RoundButton
                icon="share"
                label={t('provider.share')}
                strokeWidth={2.2}
                onPress={() => {
                  Share.share({
                    message: `${p.businessName} · ${p.typeName} · ${p.address}`,
                  }).catch(() => undefined);
                }}
              />
            </View>

            <View className="flex-row items-center" style={{ marginTop: 14, gap: 14 }}>
              <ProviderAvatar name={p.businessName} id={p.id} size={72} fontSize={24} onViolet />
              <View className="flex-1 items-start">
                <Text
                  weight={800}
                  className="text-[24px] leading-[30px] text-sheet"
                  numberOfLines={2}
                >
                  {p.businessName}
                </Text>
                <Text
                  weight={700}
                  className="text-[14px] text-primary-soft"
                  style={{ marginTop: 2 }}
                  numberOfLines={1}
                >
                  {`${p.typeName} · ${shortAddress(p.address)}`}
                </Text>
                <View
                  className="flex-row items-center rounded-pill"
                  style={{
                    marginTop: 6,
                    gap: 6,
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                    backgroundColor: today
                      ? colors.status.confirmed.bg
                      : colors.status.cancelled.bg,
                  }}
                >
                  <View
                    className="rounded-full"
                    style={{
                      width: 7,
                      height: 7,
                      backgroundColor: today
                        ? colors.status.confirmed.fg
                        : colors.status.cancelled.fg,
                    }}
                  />
                  <Text
                    weight={800}
                    className="text-[12px]"
                    style={{
                      color: today ? colors.status.confirmed.fg : colors.status.cancelled.fg,
                    }}
                  >
                    {today
                      ? t('provider.openToday', { open: today.open, close: today.close })
                      : t('provider.closedToday')}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row" style={{ marginTop: 16, gap: 8 }}>
              <StatTile
                label={t('provider.stats.rating')}
                value={p.rating.toFixed(1)}
                sub={`(${p.ratingCount})`}
              />
              <StatTile label={t('provider.stats.visits')} value={String(p.visits)} />
              <StatTile
                label={t('provider.stats.distance')}
                value={p.distanceKm != null ? t('common.km', { value: p.distanceKm }) : '–'}
              />
            </View>
          </View>

          <View
            className="rounded-t-sheet bg-sheet"
            style={{
              marginTop: -24,
              paddingTop: 18,
              paddingHorizontal: GUTTER,
              paddingBottom: 20,
              gap: 16,
            }}
          >
            <Segmented
              tone="ground"
              options={TABS.map((key) => ({ key, label: t(`provider.tabs.${key}`) }))}
              value={tab}
              onChange={setTab}
            />

            {tab === 'services' && (
              <>
                {p.services.length === 0 ? (
                  empty(t('provider.servicesEmpty'), t('provider.servicesEmptyBody'))
                ) : (
                  <View style={{ gap: 8 }}>
                    {p.services.map((s) => (
                      <ServiceRow
                        key={s.id}
                        name={s.name}
                        description={s.description}
                        min={t('common.min', { value: s.durationMin })}
                      />
                    ))}
                  </View>
                )}
                {p.portfolio.length > 0 && (
                  <View>
                    <View
                      className="flex-row items-center justify-between"
                      style={{ marginBottom: 8 }}
                    >
                      <Text weight={800} className="text-[17px] text-ink">
                        {t('provider.recentWork')}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setTab('portfolio')}
                        hitSlop={8}
                        style={{ paddingVertical: 10, paddingLeft: 12 }}
                      >
                        <Text weight={700} className="text-[14px] text-primary-pressed">
                          {t('provider.seeAll', { count: p.portfolio.length })}
                        </Text>
                      </Pressable>
                    </View>
                    <PhotoGrid provider={p} limit={3} size={photo} />
                  </View>
                )}
              </>
            )}

            {tab === 'portfolio' &&
              (p.portfolio.length === 0 ? (
                empty(t('provider.portfolioEmpty'), t('provider.portfolioEmptyBody'))
              ) : (
                <PhotoGrid provider={p} size={photo} />
              ))}

            {tab === 'ratings' && <Ratings provider={p} />}
          </View>
        </ScrollView>
        <StatusBarBand />

        {preview ? (
          <View
            className="bg-sheet"
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.hairline,
              paddingTop: 14,
              paddingHorizontal: GUTTER,
              paddingBottom: Math.max(insets.bottom, 22),
            }}
          >
            <Text weight={700} className="text-center text-[14px] leading-[20px] text-muted">
              {p.listed ? t('provider.previewNote') : t('provider.previewUnlisted')}
            </Text>
          </View>
        ) : (
          <View
            className="flex-row items-center bg-sheet"
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.hairline,
              paddingTop: 14,
              paddingHorizontal: GUTTER,
              paddingBottom: Math.max(insets.bottom, 22),
              gap: 12,
            }}
          >
            <View className="flex-1">
              <Text weight={700} className="text-[13px] text-muted">
                {t('provider.nextFree')}
              </Text>
              <Text weight={800} className="text-[17px] text-ink" numberOfLines={1}>
                {p.nextFreeAt ? whenLabel(p.nextFreeAt, t) : t('provider.noFreeTime')}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={p.services.length === 0}
              onPress={() =>
                router.push({ pathname: '/(client)/booking/[id]', params: { id: p.id } })
              }
              className={`items-center justify-center rounded-pill ${
                p.services.length === 0 ? 'bg-hairline' : 'bg-primary active:bg-primary-pressed'
              }`}
              style={{ height: 56, paddingHorizontal: 28, flexShrink: 0 }}
            >
              <Text
                weight={800}
                className="text-[17px]"
                style={{ color: p.services.length === 0 ? colors.disabled.fg : colors.sheet }}
              >
                {t('provider.reserve')}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenState
      loading={query.isPending}
      error={query.isError}
      notFound={isNotFound(query.error)}
      onRetry={query.refetch}
      onBack={back}
    >
      {body()}
    </ScreenState>
  );
}
