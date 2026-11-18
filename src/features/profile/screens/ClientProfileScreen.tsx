import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Toast, { useToast } from '@/components/common/Toast';
import StatusBarBand from '@/components/common/StatusBarBand';
import { Icon, Text } from '@/components/ui';
import { useSessionStore } from '@/store/sessionStore';
import { colors } from '@/theme';
import { initials, monthName, monthYear, prettyPhone } from '@/utils/format';

import Group from '../components/Group';
import LanguageSheet from '../components/LanguageSheet';
import ProfileRow from '../components/ProfileRow';
import { ContactSheet, DetailsSheet, PasswordSheet, SignOutSheet } from '../components/sheets';
import { useClientStats, useLogout } from '../hooks/useProfile';

type SheetName = 'details' | 'phone' | 'email' | 'password' | 'language' | 'signout' | null;

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

export default function ClientProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useSessionStore((s) => s.user);
  const stats = useClientStats();
  const logout = useLogout();
  const toast = useToast();
  const [sheet, setSheet] = useState<SheetName>(null);
  if (!user) return null;

  const close = () => setSheet(null);
  const done = (message: string) => {
    setSheet(null);
    toast.show(message);
  };
  const s = stats.data;

  return (
    <View className="flex-1 bg-ground">
      <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
        <View
          className="bg-primary"
          style={{ paddingTop: insets.top + 22, paddingHorizontal: 20, paddingBottom: 46 }}
        >
          <Text weight={800} className="text-[24px] leading-[30px] text-sheet">
            {t('profile.title')}
          </Text>
          <View className="flex-row items-center" style={{ marginTop: 16, gap: 14 }}>
            <View style={{ flexShrink: 0 }}>
              <View
                className="items-center justify-center rounded-full bg-sheet"
                style={{ width: 72, height: 72 }}
              >
                <Text weight={800} className="text-[24px] text-primary-pressed">
                  {initials(user.fullName)}
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
                {user.fullName}
              </Text>
              <Text weight={700} className="text-[14px] text-primary-soft" style={{ marginTop: 2 }}>
                {t('profile.joined', {
                  role: t('profile.roleClient'),
                  date: monthYear(user.createdAt),
                })}
              </Text>
            </View>
          </View>
          <View className="flex-row" style={{ marginTop: 16, gap: 8 }}>
            <StatTile
              label={t('profile.stats.rating')}
              value={s ? s.rating.toFixed(1) : '–'}
              sub={s ? `(${s.ratingCount})` : undefined}
            />
            <StatTile label={t('profile.stats.visits')} value={s ? String(s.visits) : '–'} />
            <StatTile label={t('profile.stats.noShows')} value={s ? String(s.noShows) : '–'} />
          </View>
        </View>

        <View
          className="rounded-t-sheet bg-ground"
          style={{ marginTop: -24, padding: 20, paddingBottom: 24, gap: 18 }}
        >
          <Group title={t('profile.personal')}>
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
              layout="account"
              icon="lock"
              iconBg={colors.status.noshow.bg}
              iconFg={colors.status.noshow.fg}
              label={t('profile.changePassword')}
              value={
                user.passwordChangedAt
                  ? t('profile.lastChanged', { month: monthName(user.passwordChangedAt) })
                  : t('profile.neverChanged')
              }
              onPress={() => setSheet('password')}
            />
            {/* Ratings screen is not designed yet (docs/BACKLOG.md); row is informational. */}
            <ProfileRow
              divider
              layout="account"
              icon="star"
              iconBg={colors.accent.amber.bg}
              iconFg={colors.accent.amber.fg}
              label={t('profile.myRatings')}
              value={
                s
                  ? t('profile.ratingsSummary', { received: s.ratingCount, given: s.ratingsGiven })
                  : '–'
              }
            />
            <ProfileRow
              divider
              layout="account"
              icon="globe"
              iconBg={colors.accent.sky.bg}
              iconFg={colors.accent.sky.fg}
              label={t('profile.language')}
              value={t(`language.${i18n.language}`)}
              onPress={() => setSheet('language')}
            />
          </Group>

          <Group title={t('profile.help')}>
            <ProfileRow
              layout="account"
              icon="help"
              iconBg={colors.accent.sky.bg}
              iconFg={colors.accent.sky.fg}
              label={t('profile.faq')}
              value=""
              onPress={() => router.push('/(client)/faq')}
            />
            <ProfileRow
              divider
              layout="account"
              icon="shield"
              iconBg={colors.accent.mint.bg}
              iconFg={colors.accent.mint.fg}
              label={t('profile.privacy')}
              value=""
              onPress={() => router.push('/(client)/privacy')}
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

      <DetailsSheet open={sheet === 'details'} onClose={close} onDone={done} user={user} />
      <ContactSheet
        open={sheet === 'phone'}
        kind="phone"
        onClose={close}
        onDone={done}
        user={user}
      />
      <ContactSheet
        open={sheet === 'email'}
        kind="email"
        onClose={close}
        onDone={done}
        user={user}
      />
      <PasswordSheet open={sheet === 'password'} onClose={close} onDone={done} />
      <LanguageSheet open={sheet === 'language'} onClose={close} />
      <SignOutSheet
        open={sheet === 'signout'}
        onClose={close}
        pending={logout.isPending}
        onConfirm={() =>
          logout.mutate(undefined, { onSettled: () => router.replace('/(auth)/login') })
        }
      />
    </View>
  );
}
