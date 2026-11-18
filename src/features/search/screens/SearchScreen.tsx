import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ListState from '@/components/common/ListState';
import ProviderAvatar from '@/components/common/ProviderAvatar';
import { typeIcon } from '@/components/common/ProviderTypeCard';
import RatingValue from '@/components/common/RatingValue';
import RoundButton from '@/components/common/RoundButton';
import { Icon, Segmented, Text } from '@/components/ui';
import { useProviderTypes } from '@/hooks/useCatalog';
import { useLocation } from '@/hooks/useLocation';
import { colors } from '@/theme';
import type { ProviderCard } from '@/types';

import MapMock from '../components/MapMock';
import TypeFilterSheet from '../components/TypeFilterSheet';
import { useNearbyProviders } from '@/hooks/useProviders';
import { useSearchStore, type Radius, type Sort } from '@/store/searchStore';

const RADII: Radius[] = [1, 3, 5, 10];
const SORTS: { key: Sort; labelKey: string }[] = [
  { key: 'distance', labelKey: 'search.sort.distance' },
  { key: 'rating', labelKey: 'search.sort.rating' },
  { key: 'visits', labelKey: 'search.sort.visits' },
];

const ResultCard = ({ provider, onPress }: { provider: ProviderCard; onPress: () => void }) => {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center rounded-card bg-sheet active:opacity-80"
      style={{ minHeight: 76, paddingVertical: 10, paddingHorizontal: 12, gap: 12 }}
    >
      <ProviderAvatar name={provider.businessName} id={provider.id} size={52} fontSize={16} />
      <View className="flex-1" style={{ gap: 3 }}>
        <Text weight={800} className="text-[16px] text-ink" numberOfLines={1}>
          {provider.businessName}
        </Text>
        <Text weight={600} className="text-[13px] text-muted" numberOfLines={1}>
          {`${t('search.visits', { count: provider.visits })} · ${
            provider.closesAt
              ? t('search.openTill', { time: provider.closesAt })
              : t('search.closedToday')
          }`}
        </Text>
      </View>
      <View className="items-end" style={{ gap: 3, flexShrink: 0 }}>
        <RatingValue value={provider.rating} />
        <Text weight={800} className="text-[13px] text-primary-pressed">
          {t('common.km', { value: provider.distanceKm })}
        </Text>
      </View>
    </Pressable>
  );
};

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const location = useLocation();
  const { typeId, radius, sort, q, set } = useSearchStore();
  const types = useProviderTypes();
  const [sheet, setSheet] = useState(false);
  const results = useNearbyProviders({
    radiusKm: radius,
    sort,
    typeId: typeId ?? undefined,
    q: q || undefined,
  });

  const type = types.data?.find((x) => x.id === typeId) ?? null;
  const list = results.data ?? [];
  const plural = (type?.pluralName ?? t('search.providers')).toLowerCase();
  const singular = (type?.name ?? t('search.provider')).toLowerCase();
  const title = t('search.title', { what: type?.pluralName ?? t('search.providersTitle') });
  const noun = list.length === 1 ? singular : plural;
  const summary = q
    ? t('search.summaryQuery', { count: list.length, noun, radius, q })
    : t('search.summary', { count: list.length, noun, radius });

  return (
    <View className="flex-1 bg-ground">
      <View
        className="flex-row items-center bg-primary"
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}
      >
        <RoundButton
          icon="chevronLeft"
          label={t('common.back')}
          onPress={() => router.navigate('/(client)/(tabs)')}
        />
        <Text weight={800} className="flex-1 text-[20px] text-sheet" numberOfLines={1}>
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('search.typeSheet')}
          onPress={() => setSheet(true)}
          className="flex-row items-center rounded-pill bg-sheet active:opacity-80"
          style={{ height: 40, paddingHorizontal: 14, gap: 6, flexShrink: 0, maxWidth: 150 }}
        >
          <Icon
            name={type ? typeIcon(type.slug) : 'sparkle'}
            size={16}
            color={colors.primary.pressed}
            strokeWidth={2.2}
          />
          <Text
            weight={800}
            className="text-[14px] text-primary-pressed"
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {type?.shortName ?? t('search.allShort')}
          </Text>
          <Icon name="chevronDown" size={14} color={colors.primary.pressed} strokeWidth={2.6} />
        </Pressable>
      </View>

      <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
        <MapMock width={width} radiusKm={radius} center={location} providers={list} />

        <View
          className="rounded-t-sheet bg-ground"
          style={{ marginTop: -24, padding: 18, paddingBottom: 24 }}
        >
          <View className="flex-row" style={{ gap: 8 }}>
            {RADII.map((r) => {
              const on = r === radius;
              return (
                <Pressable
                  key={r}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => set({ radius: r })}
                  className="flex-1 items-center justify-center rounded-pill"
                  style={{
                    height: 44,
                    borderWidth: 2,
                    borderColor: on ? colors.primary.DEFAULT : colors.hairline,
                    backgroundColor: on ? colors.primary.DEFAULT : colors.sheet,
                  }}
                >
                  <Text
                    weight={800}
                    className={`text-[15px] ${on ? 'text-sheet' : 'text-primary-pressed'}`}
                  >
                    {t('common.km', { value: r })}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 12 }}>
            <Segmented
              tone="sheet"
              height={36}
              fontSize={13}
              options={SORTS.map((x) => ({ key: x.key, label: t(x.labelKey) }))}
              value={sort}
              onChange={(key) => set({ sort: key })}
            />
          </View>

          <View
            className="flex-row items-center"
            style={{ marginTop: 14, marginHorizontal: 2, marginBottom: 10, gap: 8 }}
          >
            <Text weight={700} className="flex-1 text-[14px] text-muted" numberOfLines={2}>
              {results.isSuccess ? summary : ' '}
            </Text>
            {q ? (
              <Pressable accessibilityRole="button" onPress={() => set({ q: '' })} hitSlop={12}>
                <Text weight={800} className="text-[14px] text-primary-pressed">
                  {t('search.clear')}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <ListState
            loading={results.isPending}
            error={results.isError}
            onRetry={results.refetch}
            empty={list.length === 0}
            emptyTitle={t('search.emptyTitle', { what: plural })}
            emptyBody={radius === 10 ? t('search.emptyBodyMax') : t('search.emptyBody')}
          >
            <View style={{ gap: 10 }}>
              {list.map((p) => (
                <ResultCard
                  key={p.id}
                  provider={p}
                  onPress={() =>
                    router.push({ pathname: '/(client)/provider/[id]', params: { id: p.id } })
                  }
                />
              ))}
            </View>
          </ListState>
        </View>
      </ScrollView>

      <TypeFilterSheet
        open={sheet}
        onClose={() => setSheet(false)}
        types={types.data ?? []}
        selected={typeId}
        onPick={(id) => {
          set({ typeId: id });
          setSheet(false);
        }}
      />
    </View>
  );
}
