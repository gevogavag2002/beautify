import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import FormScreen from '@/components/common/FormScreen';
import { Button, Icon, Text, type IconName } from '@/components/ui';
import { icons } from '@/components/ui/Icon';
import { colors } from '@/theme';
import type { Role } from '@/types';

import InfoNote from '../components/InfoNote';
import RegisterHeader from '../components/RegisterHeader';
import { useProviderTypes } from '../hooks/useCatalog';
import { totalSteps, useRegisterStore } from '../store';

// Icon tint per provider type, keyed by slug (types themselves come from the backend).
const typeTint: Record<string, { bg: string; fg: string }> = {
  barber: { bg: colors.primary.soft, fg: colors.primary.pressed },
  hair: colors.accent.amber,
  nails: colors.accent.rose,
  lashes: colors.accent.mint,
  makeup: colors.accent.amber,
  cosmo: colors.accent.sky,
};
const typeIcon = (slug: string): IconName => (slug in icons ? (slug as IconName) : 'sparkle');

export default function RoleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role, providerTypeId, patch } = useRegisterStore();
  const types = useProviderTypes();
  const isProvider = role === 'provider';
  const ready = !isProvider || !!providerTypeId;

  const roles: {
    id: Role;
    title: string;
    body: string;
    icon: IconName;
    tint: { bg: string; fg: string };
  }[] = [
    {
      id: 'client',
      title: t('auth.role.client'),
      body: t('auth.role.clientBody'),
      icon: 'client',
      tint: { bg: colors.primary.soft, fg: colors.primary.pressed },
    },
    {
      id: 'provider',
      title: t('auth.role.provider'),
      body: t('auth.role.providerBody'),
      icon: 'barber',
      tint: colors.accent.rose,
    },
  ];

  return (
    <FormScreen
      header={
        <RegisterHeader
          title={t('auth.register.headerTitle')}
          heading={t('auth.role.title')}
          step={1}
          total={totalSteps(role)}
          backTo="/(auth)/login"
        />
      }
      sheet="ground"
      contentStyle={{
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: Math.max(insets.bottom, 16),
        gap: 16,
      }}
    >
      <View className="flex-row" style={{ gap: 10 }} accessibilityRole="radiogroup">
        {roles.map((r) => {
          const sel = r.id === role;
          return (
            <Pressable
              key={r.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: sel }}
              onPress={() => patch({ role: r.id })}
              className="flex-1 bg-sheet"
              style={[
                {
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: sel ? colors.primary.DEFAULT : colors.sheet,
                  paddingVertical: 16,
                  paddingHorizontal: 14,
                  gap: 10,
                },
                sel && {
                  shadowColor: '#E2DCFD',
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 0,
                },
              ]}
            >
              {sel && (
                <View
                  pointerEvents="none"
                  className="absolute rounded-[26px]"
                  style={{
                    top: -6,
                    left: -6,
                    right: -6,
                    bottom: -6,
                    borderWidth: 4,
                    borderColor: '#E2DCFD',
                  }}
                />
              )}
              <View
                className="items-center justify-center rounded-full"
                style={{ width: 48, height: 48, backgroundColor: r.tint.bg }}
              >
                <Icon name={r.icon} size={24} color={r.tint.fg} strokeWidth={2.2} />
              </View>
              <View>
                <Text weight={800} className="text-[17px] leading-[22px] text-ink">
                  {r.title}
                </Text>
                <Text
                  weight={600}
                  className="text-[13px] leading-[18px] text-muted"
                  style={{ marginTop: 2 }}
                >
                  {r.body}
                </Text>
              </View>
              <View
                className="absolute items-center justify-center rounded-full"
                style={{
                  top: 14,
                  right: 14,
                  width: 22,
                  height: 22,
                  borderWidth: 2,
                  borderColor: sel ? colors.primary.DEFAULT : '#B9B3CC',
                  backgroundColor: sel ? colors.primary.DEFAULT : colors.sheet,
                }}
              >
                {sel && <Icon name="check" size={12} color={colors.sheet} strokeWidth={3.4} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {isProvider && (
        <View style={{ gap: 10 }}>
          <View>
            <Text weight={800} className="text-[17px] leading-[24px] text-ink">
              {t('auth.role.typeTitle')}
            </Text>
            <Text
              weight={600}
              className="text-[13px] leading-[18px] text-muted"
              style={{ marginTop: 2 }}
            >
              {t('auth.role.typeSubtitle')}
            </Text>
          </View>
          {types.isLoading && (
            <View className="items-center justify-center" style={{ height: 128 }}>
              <ActivityIndicator color={colors.primary.DEFAULT} />
            </View>
          )}
          {types.isError && (
            <Text weight={700} className="text-[13px] text-status-cancelled-fg">
              {t('common.loadError')}{' '}
              <Text
                weight={800}
                className="text-[13px] text-primary-pressed"
                onPress={() => types.refetch()}
              >
                {t('common.retry')}
              </Text>
            </Text>
          )}
          <View className="flex-row flex-wrap" style={{ gap: 8 }} accessibilityRole="radiogroup">
            {(types.data ?? []).map((tp) => {
              const sel = tp.id === providerTypeId;
              const tint = typeTint[tp.slug] ?? typeTint.barber;
              return (
                <Pressable
                  key={tp.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: sel }}
                  onPress={() =>
                    patch({
                      providerTypeId: sel ? null : tp.id,
                      providerTypeName: sel ? null : tp.name,
                    })
                  }
                  className="flex-row items-center"
                  style={{
                    width: '48.5%',
                    height: 60,
                    borderRadius: 18,
                    borderWidth: 2,
                    paddingHorizontal: 10,
                    gap: 10,
                    borderColor: sel ? colors.primary.DEFAULT : colors.sheet,
                    backgroundColor: sel ? '#F7F5FF' : colors.sheet,
                  }}
                >
                  <View
                    className="items-center justify-center rounded-full"
                    style={{ width: 40, height: 40, backgroundColor: tint.bg }}
                  >
                    <Icon name={typeIcon(tp.slug)} size={20} color={tint.fg} strokeWidth={2.1} />
                  </View>
                  <Text weight={800} className="flex-1 text-[15px] leading-[19px] text-ink">
                    {tp.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {!isProvider && <InfoNote text={t('auth.role.clientNote')} bg="sheet" size={14} />}

      <View className="flex-1" />

      {ready ? (
        <Button
          label={isProvider ? t('auth.role.continueProvider') : t('auth.role.continueClient')}
          onPress={() => router.push('/(auth)/register/details')}
        />
      ) : (
        <Button label={t('auth.role.pickType')} disabled />
      )}
      <Text weight={600} className="text-center text-[14px] text-muted" style={{ marginTop: -8 }}>
        {t('auth.register.haveAccount')}{' '}
        <Text
          weight={800}
          className="text-[14px] text-primary-pressed"
          onPress={() => router.replace('/(auth)/login')}
        >
          {t('auth.register.signIn')}
        </Text>
      </Text>
    </FormScreen>
  );
}
