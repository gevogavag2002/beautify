import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { typeIcon } from '@/components/common/ProviderTypeCard';
import Toast, { useToast } from '@/components/common/Toast';
import StatusBarBand from '@/components/common/StatusBarBand';
import { Icon, Text } from '@/components/ui';
import { useProviderTypes } from '@/hooks/useCatalog';
import { useSessionStore } from '@/store/sessionStore';
import { colors } from '@/theme';
import { businessInitials, initials, monthName, prettyPhone } from '@/utils/format';

import Group from '../components/Group';
import { hoursSummary } from '@/utils/hoursSummary';

import LanguageSheet from '../components/LanguageSheet';
import ProfileRow from '../components/ProfileRow';
import { AddressSheet, BusinessSheet, TypeSheet } from '../components/providerSheets';
import { ContactSheet, DetailsSheet, PasswordSheet, SignOutSheet } from '../components/sheets';
import { useMyProvider } from '@/hooks/useMyProvider';

import { useLogout } from '../hooks/useProfile';

type SheetName =
  | 'business'
  | 'type'
  | 'address'
  | 'details'
  | 'phone'
  | 'email'
  | 'password'
  | 'language'
  | 'signout'
  | null;

const StatTile = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <View
    className="flex-1 rounded-[16px]"
    style={{ backgroundColor: colors.primary.tint, paddingVertical: 8, paddingHorizontal: 10 }}
  >
    <Text weight={700} className="text-[12px] text-primary-soft" numberOfLines={1}>
      {label}
    </Text>
    <Text weight={800} className="text-[17px] text-sheet" numberOfLines={1}>
      {value}
      {sub ? (
        <Text weight={700} className="text-[12px] text-primary-soft">
          {' '}
          {sub}
        </Text>
      ) : null}
    </Text>
  </View>
);

export default function ProviderProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useSessionStore((s) => s.user);
  const provider = useMyProvider();
  const types = useProviderTypes();
  const logout = useLogout();
  const toast = useToast();
  const [sheet, setSheet] = useState<SheetName>(null);
  if (!user) return null;

  const close = () => setSheet(null);
  const done = (message: string) => {
    setSheet(null);
    toast.show(message);
  };
  const p = provider.data;
  const slug = types.data?.find((x) => x.id === p?.typeId)?.slug ?? 'barber';
  const hours = p ? hoursSummary(p.workingHours, t, false) : null;

  return (
    <View className="flex-1 bg-ground">
      <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
        <View
          className="bg-primary"
          style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 46 }}
        >
          <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
            <Text weight={800} className="text-[24px] leading-[30px] text-sheet">
              {t('profile.title')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(provider)/public')}
              className="flex-row items-center rounded-pill bg-sheet active:bg-primary-soft"
              style={{ height: 40, paddingHorizontal: 14, gap: 6 }}
            >
              <Icon name="eyeOpen" size={16} color={colors.primary.pressed} strokeWidth={2.2} />
              <Text weight={800} className="text-[14px] text-primary-pressed">
                {t('profile.publicPage')}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row items-center" style={{ marginTop: 14, gap: 14 }}>
            <View style={{ flexShrink: 0 }}>
              <View
                className="items-center justify-center rounded-full bg-sheet"
                style={{ width: 72, height: 72 }}
              >
                <Text weight={800} className="text-[24px] text-primary-pressed">
                  {p ? businessInitials(p.businessName) : initials(user.fullName)}
                </Text>
              </View>
              {/* Photo upload is in docs/BACKLOG.md (needs expo-image-picker). */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('profile.changePhoto')}
                className="absolute items-center justify-center"
                style={{ right: -10, bottom: -10, width: 44, height: 44 }}
              >
                <View
                  className="items-center justify-center rounded-full bg-ink"
                  style={{
                    width: 30,
                    height: 30,
                    borderWidth: 2,
                    borderColor: colors.primary.DEFAULT,
                  }}
                >
                  <Icon name="cameraSmall" size={15} color={colors.sheet} strokeWidth={2.2} />
                </View>
              </Pressable>
            </View>
            <View className="flex-1">
              <Text
                weight={800}
                className="text-[21px] leading-[27px] text-sheet"
                numberOfLines={1}
              >
                {p?.businessName ?? ' '}
              </Text>
              <Text weight={700} className="text-[14px] text-primary-soft" style={{ marginTop: 2 }}>
                {p
                  ? p.district
                    ? t('profile.typeAndDistrict', { type: p.typeName, district: p.district })
                    : p.typeName
                  : ' '}
              </Text>
              {p && (
                <View
                  className={`flex-row items-center self-start rounded-pill ${p.listed ? 'bg-status-confirmed-bg' : 'bg-status-pending-bg'}`}
                  style={{ marginTop: 6, gap: 6, paddingVertical: 3, paddingHorizontal: 10 }}
                >
                  <Icon
                    name={p.listed ? 'check' : 'info'}
                    size={11}
                    color={p.listed ? colors.status.confirmed.fg : colors.status.pending.fg}
                    strokeWidth={3.4}
                  />
                  <Text
                    weight={800}
                    className={`text-[12px] ${p.listed ? 'text-status-confirmed-fg' : 'text-status-pending-fg'}`}
                  >
                    {p.listed ? t('profile.shownInSearch') : t('profile.notListed')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="flex-row" style={{ marginTop: 16, gap: 8 }}>
            <StatTile
              label={t('profile.statsProvider.rating')}
              value={p ? p.rating.toFixed(1) : '–'}
              sub={p ? `(${p.ratingCount})` : undefined}
            />
            <StatTile
              label={t('profile.statsProvider.visits')}
              value={p ? String(p.visits) : '–'}
            />
            <StatTile
              label={t('profile.statsProvider.photos')}
              value={p ? String(p.portfolio.length) : '–'}
            />
          </View>
        </View>

        <View
          className="rounded-t-sheet bg-ground"
          style={{ marginTop: -24, padding: 20, paddingBottom: 24, gap: 18 }}
        >
          {provider.isPending && (
            <ActivityIndicator color={colors.primary.DEFAULT} style={{ marginTop: 8 }} />
          )}
          {provider.isError && (
            <Text weight={700} className="text-[13px] text-status-cancelled-fg">
              {t('common.loadError')}{' '}
              <Text
                weight={800}
                className="text-[13px] text-primary-pressed"
                onPress={() => provider.refetch()}
              >
                {t('common.retry')}
              </Text>
            </Text>
          )}

          {p && hours && (
            <Group title={t('profile.business')}>
              <ProfileRow
                icon="store"
                iconBg={colors.primary.soft}
                iconFg={colors.primary.pressed}
                label={t('profile.businessName')}
                value={p.businessName}
                onPress={() => setSheet('business')}
              />
              <ProfileRow
                divider
                icon={typeIcon(slug)}
                iconBg={colors.accent.rose.bg}
                iconFg={colors.accent.rose.fg}
                label={t('profile.providerType')}
                value={p.typeName}
                onPress={() => setSheet('type')}
              />
              <ProfileRow
                divider
                icon="pin"
                iconBg={colors.accent.sky.bg}
                iconFg={colors.accent.sky.fg}
                label={t('profile.addressPin')}
                value={p.address}
                onPress={() => setSheet('address')}
              />
              <ProfileRow
                divider
                icon="textLines"
                iconBg={colors.accent.amber.bg}
                iconFg={colors.accent.amber.fg}
                label={t('profile.about')}
                value={p.about ?? '–'}
                onPress={() => setSheet('business')}
              />
              <ProfileRow
                divider
                icon="clockRow"
                iconBg={colors.accent.mint.bg}
                iconFg={colors.accent.mint.fg}
                label={t('profile.workingHours')}
                value={hours.title}
                sub={hours.sub}
                onPress={() => router.navigate('/(provider)/(tabs)/services')}
              />
            </Group>
          )}

          <Group title={t('profile.yourDetails')}>
            <ProfileRow
              icon="userRow"
              iconBg={colors.primary.soft}
              iconFg={colors.primary.pressed}
              label={t('profile.fullName')}
              value={user.fullName}
              onPress={() => setSheet('details')}
            />
            <ProfileRow
              divider
              icon="gender"
              iconBg={colors.accent.rose.bg}
              iconFg={colors.accent.rose.fg}
              label={t('profile.gender')}
              value={t(`auth.details.${user.gender}`)}
              onPress={() => setSheet('details')}
            />
            <ProfileRow
              divider
              icon="phoneRow"
              iconBg={colors.accent.mint.bg}
              iconFg={colors.accent.mint.fg}
              label={t('profile.phone')}
              value={prettyPhone(user.phone)}
              confirmed={user.phoneConfirmed}
              onPress={() => setSheet('phone')}
            />
            <ProfileRow
              divider
              icon="mailRow"
              iconBg={colors.accent.sky.bg}
              iconFg={colors.accent.sky.fg}
              label={t('profile.email')}
              value={user.email}
              confirmed={user.emailConfirmed}
              onPress={() => setSheet('email')}
            />
          </Group>

          <Group title={t('profile.account')}>
            <ProfileRow
              icon="lock"
              iconBg={colors.status.noshow.bg}
              iconFg={colors.status.noshow.fg}
              label={t('profile.password')}
              value={
                user.passwordChangedAt
                  ? t('profile.lastChanged', { month: monthName(user.passwordChangedAt) })
                  : t('profile.changePassword')
              }
              onPress={() => setSheet('password')}
            />
            {/* Ratings screen is not designed yet (docs/BACKLOG.md); row is informational. */}
            <ProfileRow
              divider
              icon="star"
              iconBg={colors.accent.amber.bg}
              iconFg={colors.accent.amber.fg}
              label={t('profile.ratings')}
              value={
                p
                  ? t('profile.ratingsDetailProvider', {
                      received: p.ratingCount,
                      given: p.ratingsGiven,
                    })
                  : '–'
              }
            />
            <ProfileRow
              divider
              icon="globe"
              iconBg={colors.accent.sky.bg}
              iconFg={colors.accent.sky.fg}
              label={t('profile.language')}
              value={t(`language.${i18n.language}`)}
              onPress={() => setSheet('language')}
            />
          </Group>

          <Pressable
            accessibilityRole="button"
            onPress={() => setSheet('signout')}
            className="flex-row items-center justify-center rounded-pill bg-sheet active:bg-status-cancelled-bg"
            style={{ height: 54, gap: 8, borderWidth: 2, borderColor: colors.status.cancelled.bg }}
          >
            <Icon name="signout" size={18} color={colors.status.cancelled.fg} strokeWidth={2.4} />
            <Text weight={800} className="text-[16px] text-status-cancelled-fg">
              {t('profile.signOut')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <StatusBarBand />

      <Toast message={toast.message} />

      {p && (
        <>
          <BusinessSheet open={sheet === 'business'} onClose={close} onDone={done} provider={p} />
          <TypeSheet open={sheet === 'type'} onClose={close} onDone={done} provider={p} />
          <AddressSheet open={sheet === 'address'} onClose={close} onDone={done} provider={p} />
        </>
      )}
      <DetailsSheet open={sheet === 'details'} onClose={close} onDone={done} user={user} provider />
      <ContactSheet
        open={sheet === 'phone'}
        kind="phone"
        onClose={close}
        onDone={done}
        user={user}
        provider
      />
      <ContactSheet
        open={sheet === 'email'}
        kind="email"
        onClose={close}
        onDone={done}
        user={user}
        provider
      />
      <PasswordSheet open={sheet === 'password'} onClose={close} onDone={done} />
      <LanguageSheet open={sheet === 'language'} onClose={close} />
      <SignOutSheet
        open={sheet === 'signout'}
        onClose={close}
        pending={logout.isPending}
        provider
        onConfirm={() =>
          logout.mutate(undefined, { onSettled: () => router.replace('/(auth)/login') })
        }
      />
    </View>
  );
}
