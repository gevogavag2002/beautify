import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import FormScreen from '@/components/common/FormScreen';
import ListState from '@/components/common/ListState';
import ProviderAvatar from '@/components/common/ProviderAvatar';
import { tintFor, typeIcon } from '@/components/common/ProviderTypeCard';
import RatingValue from '@/components/common/RatingValue';
import Toast, { useToast } from '@/components/common/Toast';
import { Icon, Text, type IconName } from '@/components/ui';
import { useTopProviders } from '@/hooks/useProviders';
import { useSearchStore } from '@/store/searchStore';
import { useProviderTypes } from '@/hooks/useCatalog';
import { useSessionStore } from '@/store/sessionStore';
import { colors } from '@/theme';
import type { EventCard, ProviderCard, ProviderType } from '@/types';
import { hhmm, initials, monthShort, weekdayShort } from '@/utils/format';

import { useUpcomingEvents } from '../hooks/useEvents';

const GUTTER = 20;
const TILE_GAP = 8;
const TILES_PER_ROW = 5;

// The Home tile for nails shows two sparkles; everywhere else the type icon is the same.
const tileIcon = (slug: string): IconName => (slug === 'nails' ? 'nailsDuo' : typeIcon(slug));

const SectionHead = ({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) => (
  <View className="flex-row items-center justify-between" style={{ marginBottom: 10 }}>
    <Text weight={800} className="flex-1 text-[17px] leading-[24px] text-ink" numberOfLines={1}>
      {title}
    </Text>
    {action ? (
      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        hitSlop={8}
        style={{ paddingVertical: 10, paddingLeft: 12 }}
      >
        <Text weight={700} className="text-[14px] text-primary-pressed">
          {action}
        </Text>
      </Pressable>
    ) : null}
  </View>
);

const TypeTile = ({
  type,
  width,
  onPress,
}: {
  type: ProviderType;
  width: number;
  onPress: () => void;
}) => {
  const tint = tintFor(type.slug);
  const circle = Math.min(60, width);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={type.name}
      onPress={onPress}
      className="items-center active:opacity-70"
      style={{ width, gap: 6 }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{ width: circle, height: circle, backgroundColor: tint.bg }}
      >
        <Icon name={tileIcon(type.slug)} size={26} color={tint.fg} strokeWidth={2} />
      </View>
      <Text weight={700} className="text-[13px] text-ink" numberOfLines={1}>
        {type.shortName}
      </Text>
    </Pressable>
  );
};

const EventRow = ({ event, onPress }: { event: EventCard; onPress: () => void }) => {
  const start = new Date(event.startsAt);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center rounded-card bg-sheet active:opacity-80"
      style={{ padding: 12, gap: 14 }}
    >
      <View
        className="items-center justify-center bg-primary"
        style={{ width: 72, height: 72, borderRadius: 16, flexShrink: 0 }}
      >
        <Text weight={700} className="text-[12px] text-sheet" style={{ letterSpacing: 0.72 }}>
          {monthShort(start).toUpperCase()}
        </Text>
        <Text weight={800} className="text-[26px] leading-[28px] text-sheet">
          {start.getDate()}
        </Text>
      </View>
      <View className="flex-1" style={{ gap: 3 }}>
        <Text weight={800} className="text-[16px] text-ink" numberOfLines={2}>
          {event.title}
        </Text>
        <Text weight={600} className="text-[13px] text-muted" numberOfLines={1}>
          {`${weekdayShort(start)} ${hhmm(start)} – ${hhmm(event.endsAt)} · ${event.venueName}`}
        </Text>
        {event.tag ? (
          <View
            className="self-start rounded-pill bg-primary-soft"
            style={{ marginTop: 3, paddingVertical: 3, paddingHorizontal: 10 }}
          >
            <Text weight={700} className="text-[12px] text-primary-pressed">
              {event.tag}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const TopCard = ({ provider, onPress }: { provider: ProviderCard; onPress: () => void }) => {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center rounded-card bg-sheet active:opacity-80"
      style={{ minHeight: 80, padding: 12, gap: 12 }}
    >
      <ProviderAvatar name={provider.businessName} id={provider.id} size={56} fontSize={17} />
      <View className="flex-1" style={{ gap: 2 }}>
        <Text weight={800} className="text-[16px] text-ink" numberOfLines={1}>
          {provider.businessName}
        </Text>
        <Text weight={600} className="text-[13px] text-muted" numberOfLines={1}>
          {`${provider.typeName} · ${t('common.km', { value: provider.distanceKm })}`}
        </Text>
      </View>
      <RatingValue value={provider.rating} pill />
    </Pressable>
  );
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const user = useSessionStore((s) => s.user);
  const setSearch = useSearchStore((s) => s.set);
  const types = useProviderTypes();
  const events = useUpcomingEvents(1);
  const top = useTopProviders(3);
  const toast = useToast();
  const [q, setQ] = useState('');

  const openSearch = (patch: Parameters<typeof setSearch>[0]) => {
    setSearch({ typeId: null, q: '', sort: 'distance', ...patch });
    router.navigate('/(client)/(tabs)/map');
  };
  const submitSearch = () => {
    const text = q.trim();
    if (!text) return;
    openSearch({ q: text, radius: 10 });
    setQ('');
  };

  const tileWidth = (width - GUTTER * 2 - TILE_GAP * (TILES_PER_ROW - 1)) / TILES_PER_ROW;
  const typeList = types.data ?? [];
  // More than five types: narrower tiles so the sixth one peeks in and hints at the scroll.
  const tile = typeList.length > TILES_PER_ROW ? tileWidth * 0.9 : tileWidth;
  const event = events.data?.[0];

  const header = (
    <View
      className="bg-primary"
      style={{ paddingTop: insets.top + 22, paddingHorizontal: GUTTER, paddingBottom: 44 }}
    >
      <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
        <View className="flex-1">
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Icon name="pin" size={16} color={colors.primary.soft} strokeWidth={2.2} />
            <Text weight={700} className="flex-1 text-[13px] text-primary-soft" numberOfLines={1}>
              {t('home.defaultLocation')}
            </Text>
          </View>
          <Text
            weight={800}
            className="text-[24px] leading-[30px] text-sheet"
            style={{ marginTop: 4 }}
          >
            {t('home.title')}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.profile')}
          onPress={() => router.navigate('/(client)/(tabs)/profile')}
          className="items-center justify-center rounded-full bg-sheet active:opacity-80"
          style={{ width: 46, height: 46, flexShrink: 0 }}
        >
          <Text weight={800} className="text-[15px] text-primary">
            {user ? initials(user.fullName) : ''}
          </Text>
        </Pressable>
      </View>

      <View
        className="flex-row items-center rounded-pill bg-sheet"
        style={{ marginTop: 16, height: 52, paddingLeft: 18, paddingRight: 6, gap: 10 }}
      >
        <Icon name="search" size={20} color={colors.muted} strokeWidth={2.2} />
        <TextInput
          value={q}
          onChangeText={setQ}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel={t('home.searchLabel')}
          placeholder={t('home.searchPlaceholder')}
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.filters')}
          onPress={() => (q.trim() ? submitSearch() : router.navigate('/(client)/(tabs)/map'))}
          className="items-center justify-center rounded-full bg-primary active:bg-primary-pressed"
          style={{ width: 42, height: 42, flexShrink: 0 }}
        >
          <Icon name="filters" size={18} color={colors.sheet} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-ground">
      <FormScreen
        header={header}
        sheet="ground"
        contentStyle={{ paddingTop: 20, paddingBottom: 24, gap: 22 }}
      >
        <View>
          <View style={{ paddingHorizontal: GUTTER }}>
            <SectionHead title={t('home.types')} />
          </View>
          <ListState loading={types.isPending} error={types.isError} onRetry={types.refetch}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={typeList.length > TILES_PER_ROW}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{ paddingHorizontal: GUTTER, gap: TILE_GAP }}
            >
              {typeList.map((type) => (
                <TypeTile
                  key={type.id}
                  type={type}
                  width={tile}
                  onPress={() => openSearch({ typeId: type.id })}
                />
              ))}
            </ScrollView>
          </ListState>
        </View>

        {event ? (
          <View style={{ paddingHorizontal: GUTTER }}>
            {/* Events list and event page are not designed yet (docs/BACKLOG.md). */}
            <SectionHead
              title={t('home.events')}
              action={t('home.seeAll')}
              onAction={() => toast.show(t('home.eventsSoon'))}
            />
            <EventRow event={event} onPress={() => toast.show(t('home.eventsSoon'))} />
          </View>
        ) : null}

        <View style={{ paddingHorizontal: GUTTER }}>
          <SectionHead
            title={t('home.top')}
            action={t('home.seeAll')}
            onAction={() => openSearch({ sort: 'rating', radius: 10 })}
          />
          <ListState
            loading={top.isPending}
            error={top.isError}
            onRetry={top.refetch}
            empty={top.data?.length === 0}
            emptyTitle={t('home.topEmpty')}
          >
            <View style={{ gap: 10 }}>
              {(top.data ?? []).map((p) => (
                <TopCard
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
      </FormScreen>
      <Toast message={toast.message} />
    </View>
  );
}
