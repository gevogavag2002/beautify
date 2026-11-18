import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ListState from '@/components/common/ListState';
import Toast, { useToast } from '@/components/common/Toast';
import StatusBarBand from '@/components/common/StatusBarBand';
import { Button, Icon, Sheet, Text } from '@/components/ui';
import {
  useAddPhoto,
  useMyProvider,
  useRemovePhoto,
  useReorderPhotos,
} from '@/hooks/useMyProvider';
import { colors } from '@/theme';
import type { PortfolioPhoto } from '@/types';
import { errorMessage } from '@/utils/apiError';

const GUTTER = 20;
const GAP = 8;
const TILE_HEIGHT = 112;
/** Clients see this many photos on the provider page before "See all". */
export const VISIBLE_TO_CLIENTS = 9;

// "Processing…" tile: the bar fills while the upload request runs.
function ProcessingTile({ size }: { size: number }) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(12);
  useEffect(() => {
    const id = setInterval(() => setProgress((v) => Math.min(92, v + 14)), 120);
    return () => clearInterval(id);
  }, []);
  return (
    <View
      className="items-center justify-center bg-sheet"
      style={{
        width: size,
        height: TILE_HEIGHT,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: colors.hairline,
        gap: 8,
        paddingHorizontal: 14,
      }}
    >
      <Text weight={800} className="text-[12px] text-primary-pressed" numberOfLines={1}>
        {t('portfolio.processing')}
      </Text>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: progress }}
        className="self-stretch overflow-hidden bg-primary-soft"
        style={{ height: 6, borderRadius: 3 }}
      >
        <View
          className="bg-primary"
          style={{ width: `${progress}%`, height: 6, borderRadius: 3 }}
        />
      </View>
    </View>
  );
}

export default function PortfolioScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const toast = useToast();
  const provider = useMyProvider();
  const add = useAddPhoto();
  const remove = useRemovePhoto();
  const reorder = useReorderPhotos();
  const [deleting, setDeleting] = useState<PortfolioPhoto | null>(null);
  // Reorder mode: a local copy of the order; tap a photo, then tap where it should go.
  const [order, setOrder] = useState<string[] | null>(null);
  const [moving, setMoving] = useState<string | null>(null);

  const p = provider.data;
  const saved = p ? [...p.portfolio].sort((a, b) => a.order - b.order) : [];
  const photos = order
    ? order.map((id) => saved.find((x) => x.id === id)).filter((x): x is PortfolioPhoto => !!x)
    : saved;
  const size = Math.floor((width - GUTTER * 2 - GAP * 2) / 3);
  const reordering = order != null;
  const fail = (e: unknown) => toast.show(errorMessage(e, t('schedule.failed')));

  const startReorder = () => {
    setOrder(saved.map((x) => x.id));
    setMoving(null);
  };
  const finishReorder = () => {
    if (!order) return;
    const changed = order.some((id, i) => saved[i]?.id !== id);
    if (!changed) {
      setOrder(null);
      return;
    }
    reorder.mutate(order, {
      onSuccess: () => toast.show(t('portfolio.reordered')),
      onError: fail,
      onSettled: () => setOrder(null),
    });
  };
  const tapInReorder = (id: string) => {
    if (!order) return;
    if (!moving) {
      setMoving(id);
      return;
    }
    if (moving !== id) {
      const next = order.filter((x) => x !== moving);
      next.splice(order.indexOf(id), 0, moving);
      setOrder(next);
    }
    setMoving(null);
  };
  // Image picker and real upload are not wired yet (docs/BACKLOG.md): the request adds an
  // empty photo so the whole flow (processing, grid, cover, delete) can be used.
  const addPhoto = () =>
    add.mutate(undefined, { onSuccess: () => toast.show(t('portfolio.added')), onError: fail });

  return (
    <View className="flex-1 bg-ground">
      <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
        <View
          className="flex-row items-end justify-between bg-primary"
          style={{
            paddingTop: insets.top + 22,
            paddingHorizontal: GUTTER,
            paddingBottom: 46,
            gap: 12,
          }}
        >
          <View className="flex-1">
            <Text weight={700} className="text-[13px] text-primary-soft" numberOfLines={2}>
              {p
                ? t('portfolio.summary', { count: saved.length, visible: VISIBLE_TO_CLIENTS })
                : ' '}
            </Text>
            <Text
              weight={800}
              className="text-[24px] leading-[30px] text-sheet"
              style={{ marginTop: 2 }}
            >
              {t('portfolio.title')}
            </Text>
          </View>
          {saved.length > 1 ? (
            <Pressable
              accessibilityRole="button"
              disabled={reorder.isPending}
              onPress={reordering ? finishReorder : startReorder}
              className="flex-row items-center rounded-pill bg-sheet active:opacity-80"
              style={{ height: 40, paddingHorizontal: 14, gap: 6, flexShrink: 0 }}
            >
              <Icon
                name={reordering ? 'checkWide' : 'reorder'}
                size={16}
                color={colors.primary.pressed}
                strokeWidth={2.4}
              />
              <Text weight={800} className="text-[14px] text-primary-pressed">
                {reordering ? t('portfolio.done') : t('portfolio.reorder')}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View
          className="rounded-t-sheet bg-ground"
          style={{ marginTop: -24, padding: GUTTER, paddingBottom: 24, gap: 14 }}
        >
          <ListState
            loading={provider.isPending}
            error={provider.isError}
            onRetry={provider.refetch}
          >
            {reordering ? (
              <View className="bg-primary-soft" style={{ borderRadius: 18, padding: 14 }}>
                <Text weight={700} className="text-[14px] leading-[20px] text-primary-pressed">
                  {moving ? t('portfolio.reorderHintPlace') : t('portfolio.reorderHint')}
                </Text>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={add.isPending}
                onPress={addPhoto}
                className="flex-row items-center bg-sheet active:opacity-80"
                style={{
                  borderRadius: 22,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: colors.dash.strong,
                  padding: 16,
                  gap: 14,
                }}
              >
                <View
                  className="items-center justify-center rounded-full bg-primary"
                  style={{ width: 56, height: 56, flexShrink: 0 }}
                >
                  <Icon name="camera" size={26} color={colors.sheet} strokeWidth={2.2} />
                </View>
                <View className="flex-1">
                  <Text weight={800} className="text-[16px] text-ink">
                    {t('portfolio.add')}
                  </Text>
                  <Text weight={600} className="text-[13px] text-muted" style={{ marginTop: 2 }}>
                    {t('portfolio.addHint')}
                  </Text>
                </View>
              </Pressable>
            )}

            <View className="flex-row flex-wrap" style={{ gap: GAP }}>
              {add.isPending ? <ProcessingTile size={size} /> : null}
              {photos.map((photo, i) => {
                const tint = colors.photo[i % colors.photo.length];
                const selected = moving === photo.id;
                return (
                  <Pressable
                    key={photo.id}
                    accessibilityRole={reordering ? 'button' : 'image'}
                    accessibilityLabel={t('portfolio.photo', { n: i + 1 })}
                    disabled={!reordering}
                    onPress={() => tapInReorder(photo.id)}
                    className="items-center justify-center overflow-hidden"
                    style={{
                      width: size,
                      height: TILE_HEIGHT,
                      borderRadius: 18,
                      backgroundColor: tint.bg,
                      borderWidth: selected ? 3 : 0,
                      borderColor: colors.primary.DEFAULT,
                    }}
                  >
                    <Icon name="image" size={28} color={tint.fg} strokeWidth={1.8} />
                    {photo.url ? (
                      <Image
                        source={{ uri: photo.url }}
                        resizeMode="cover"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: size,
                          height: TILE_HEIGHT,
                        }}
                      />
                    ) : null}
                    {i === 0 ? (
                      <View
                        className="rounded-pill bg-primary"
                        style={{
                          position: 'absolute',
                          left: 8,
                          bottom: 8,
                          paddingVertical: 2,
                          paddingHorizontal: 8,
                        }}
                      >
                        <Text weight={800} className="text-[11px] text-sheet">
                          {t('portfolio.cover')}
                        </Text>
                      </View>
                    ) : null}
                    {reordering ? (
                      <View
                        className="items-center justify-center rounded-full"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 28,
                          height: 28,
                          backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        }}
                      >
                        <Text weight={800} className="text-[13px] text-primary-pressed">
                          {i + 1}
                        </Text>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('portfolio.delete', { n: i + 1 })}
                        onPress={() => setDeleting(photo)}
                        className="items-center justify-center"
                        style={{ position: 'absolute', top: 0, right: 0, width: 44, height: 44 }}
                      >
                        <View
                          className="items-center justify-center rounded-full"
                          style={{
                            width: 28,
                            height: 28,
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                          }}
                        >
                          <Icon
                            name="close"
                            size={14}
                            color={colors.status.cancelled.fg}
                            strokeWidth={2.8}
                          />
                        </View>
                      </Pressable>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {p && saved.length === 0 && !add.isPending ? (
              <View className="items-center rounded-card bg-sheet" style={{ padding: 22 }}>
                <Text weight={800} className="text-center text-[16px] text-ink">
                  {t('portfolio.emptyTitle')}
                </Text>
                <Text
                  weight={600}
                  className="text-center text-[14px] text-muted"
                  style={{ marginTop: 6 }}
                >
                  {t('portfolio.emptyBody')}
                </Text>
              </View>
            ) : null}
          </ListState>
        </View>
      </ScrollView>
      <StatusBarBand />

      <Toast message={toast.message} />

      <Sheet
        open={deleting != null}
        title={t('portfolio.deleteSheet.title')}
        onClose={() => setDeleting(null)}
      >
        <Text weight={600} className="text-[15px] leading-[22px] text-inkSoft">
          {t('portfolio.deleteSheet.text')}
        </Text>
        <Button
          label={t('portfolio.deleteSheet.cta')}
          disabled={remove.isPending}
          onPress={() =>
            deleting &&
            remove.mutate(deleting.id, {
              onSuccess: () => toast.show(t('portfolio.deleted')),
              onError: fail,
              onSettled: () => setDeleting(null),
            })
          }
          className="bg-status-cancelled-fg active:bg-status-cancelled-fg"
        />
        <Button
          label={t('portfolio.deleteSheet.keep')}
          variant="secondary"
          height={54}
          onPress={() => setDeleting(null)}
          className="border-hairline"
        />
      </Sheet>
    </View>
  );
}
