import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ListState from '@/components/common/ListState';
import Toast, { useToast } from '@/components/common/Toast';
import StatusBarBand from '@/components/common/StatusBarBand';
import { Button, Segmented, Sheet, Text } from '@/components/ui';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import type { Booking } from '@/types';
import { errorMessage } from '@/utils/apiError';
import { whenLabel } from '@/utils/when';

import RateCard from '../components/RateCard';
import ReservationCard from '../components/ReservationCard';
import { useMyBookings, useRateBooking, useSetBookingStatus } from '@/hooks/useBookings';

type Scope = 'upcoming' | 'past';

export default function ReservationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [scope, setScope] = useState<Scope>('upcoming');
  const [cancelling, setCancelling] = useState<Booking | null>(null);
  const upcoming = useMyBookings('upcoming');
  const past = useMyBookings('past');
  const setStatus = useSetBookingStatus();
  const rate = useRateBooking();
  useRefetchOnFocus(upcoming.refetch);
  useRefetchOnFocus(past.refetch);

  const upcomingList = upcoming.data ?? [];
  const pastList = past.data ?? [];
  const unrated = pastList.filter((b) => b.status === 'completed' && b.rating == null);
  const openProvider = (b: Booking) =>
    router.push({ pathname: '/(client)/provider/[id]', params: { id: b.providerId } });

  const confirmCancel = () => {
    if (!cancelling) return;
    setStatus.mutate(
      { id: cancelling.id, status: 'cancelled' },
      {
        onSuccess: () => toast.show(t('reservations.cancelled')),
        onError: (e) => toast.show(errorMessage(e, t('reservations.cancelFailed'))),
        onSettled: () => setCancelling(null),
      },
    );
  };

  const tabs: { key: Scope; label: string }[] = [
    {
      key: 'upcoming',
      label: upcoming.isSuccess
        ? t('reservations.upcomingCount', { count: upcomingList.length })
        : t('reservations.upcoming'),
    },
    { key: 'past', label: t('reservations.past') },
  ];

  return (
    <View className="flex-1 bg-ground">
      <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
        <View
          className="bg-primary"
          style={{ paddingTop: insets.top + 22, paddingHorizontal: 20, paddingBottom: 46 }}
        >
          <Text weight={800} className="text-[26px] leading-[32px] text-sheet">
            {t('reservations.title')}
          </Text>
          <View style={{ marginTop: 16 }}>
            <Segmented
              tone="violet"
              fontSize={15}
              options={tabs}
              value={scope}
              onChange={setScope}
            />
          </View>
        </View>

        <View
          className="rounded-t-sheet bg-ground"
          style={{ marginTop: -24, padding: 20, paddingBottom: 24, gap: 12 }}
        >
          {scope === 'upcoming' ? (
            <>
              <ListState
                loading={upcoming.isPending}
                error={upcoming.isError}
                onRetry={upcoming.refetch}
                empty={upcomingList.length === 0}
                emptyTitle={t('reservations.emptyUpcoming')}
                emptyBody={t('reservations.emptyUpcomingBody')}
              >
                {upcomingList.map((b) => (
                  <ReservationCard
                    key={b.id}
                    booking={b}
                    onCancel={() => setCancelling(b)}
                    onOpenProvider={() => openProvider(b)}
                  />
                ))}
              </ListState>
              {upcoming.isSuccess && upcomingList.length === 0 ? (
                <Button
                  label={t('reservations.find')}
                  height={54}
                  onPress={() => router.navigate('/(client)/(tabs)/map')}
                />
              ) : null}
              {unrated.length > 0 ? (
                <>
                  <Text
                    weight={800}
                    className="text-[15px] text-muted"
                    style={{ marginTop: 6, marginHorizontal: 2 }}
                  >
                    {t('reservations.waitingRating')}
                  </Text>
                  {unrated.map((b) => (
                    <RateCard
                      key={b.id}
                      booking={b}
                      pending={rate.isPending}
                      onRate={(stars) =>
                        rate.mutate(
                          { id: b.id, stars },
                          {
                            onSuccess: () => toast.show(t('reservations.rated')),
                            onError: (e) =>
                              toast.show(errorMessage(e, t('reservations.rateFailed'))),
                          },
                        )
                      }
                    />
                  ))}
                </>
              ) : null}
            </>
          ) : (
            <ListState
              loading={past.isPending}
              error={past.isError}
              onRetry={past.refetch}
              empty={pastList.length === 0}
              emptyTitle={t('reservations.emptyPast')}
              emptyBody={t('reservations.emptyPastBody')}
            >
              {pastList.map((b) => (
                <ReservationCard key={b.id} booking={b} onOpenProvider={() => openProvider(b)} />
              ))}
            </ListState>
          )}
        </View>
      </ScrollView>
      <StatusBarBand />

      <Toast message={toast.message} />

      <Sheet
        open={cancelling != null}
        title={t('reservations.cancelSheet.title')}
        onClose={() => setCancelling(null)}
      >
        {cancelling ? (
          <>
            <Text weight={600} className="text-[15px] leading-[22px] text-inkSoft">
              {t('reservations.cancelSheet.text', {
                name: cancelling.providerName,
                when: whenLabel(cancelling.startsAt, t),
              })}
            </Text>
            <Button
              label={t('reservations.cancelSheet.cta')}
              onPress={confirmCancel}
              disabled={setStatus.isPending}
              className="bg-status-cancelled-fg active:bg-status-cancelled-fg"
            />
            <Button
              label={t('reservations.cancelSheet.keep')}
              variant="secondary"
              height={54}
              onPress={() => setCancelling(null)}
              className="border-hairline"
            />
          </>
        ) : null}
      </Sheet>
    </View>
  );
}
