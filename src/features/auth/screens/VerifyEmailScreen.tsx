import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import FormScreen from '@/components/common/FormScreen';
import { Button, Icon, Text } from '@/components/ui';
import { colors } from '@/theme';

import InfoNote from '../components/InfoNote';
import OtpInput from '../components/OtpInput';
import RegisterHeader from '../components/RegisterHeader';
import { useCountdown } from '../components/useCountdown';
import { errorMessage, useResend, useVerifyEmail } from '../hooks/useAuth';
import { totalSteps, useRegisterStore } from '../store';

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useRegisterStore();
  const verify = useVerifyEmail();
  const resend = useResend('email');
  const [code, setCode] = useState('');
  const [sentAt, setSentAt] = useState(0);
  const timer = useCountdown(60, sentAt);
  const headerTitle =
    d.role === 'provider' && d.providerTypeName
      ? t('auth.register.headerTitleWithType', { type: d.providerTypeName })
      : t('auth.register.headerTitle');

  const submitWith = (c: string) => {
    if (c.length < 6 || verify.isPending) return;
    verify.mutate(
      { userId: d.userId ?? '', code: c },
      {
        onSuccess: () => {
          if (d.role === 'provider') router.push('/(auth)/register/services');
          else {
            d.reset();
            router.replace('/(client)');
          }
        },
      },
    );
  };
  const submit = () => submitWith(code);

  return (
    <FormScreen
      header={
        <RegisterHeader
          title={headerTitle}
          heading={t('auth.email.title')}
          step={4}
          total={totalSteps(d.role)}
          last={d.role === 'client'}
          padBottom={44}
        />
      }
      contentStyle={{
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: Math.max(insets.bottom, 24),
      }}
    >
      <View
        className="flex-row items-center self-start rounded-pill"
        style={{
          gap: 6,
          paddingVertical: 6,
          paddingHorizontal: 12,
          backgroundColor: colors.status.confirmed.bg,
          marginBottom: 16,
        }}
      >
        <Icon name="check" size={14} color={colors.status.confirmed.fg} strokeWidth={3} />
        <Text weight={800} className="text-[13px] text-status-confirmed-fg">
          {t('auth.email.phoneConfirmed')}
        </Text>
      </View>
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 64, height: 64, backgroundColor: colors.accent.rose.bg }}
      >
        <Icon name="mail" size={30} color={colors.accent.rose.fg} />
      </View>
      <Text
        weight={600}
        className="text-[16px] leading-[23px] text-[#4A4562]"
        style={{ marginTop: 16 }}
      >
        {t('auth.email.sent')}{' '}
        <Text weight={800} className="text-[16px] text-ink">
          {d.email}
        </Text>
      </Text>

      <View style={{ marginTop: 20 }}>
        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v);
            verify.reset();
          }}
          error={verify.isError}
        />
      </View>
      {verify.isError && (
        <Text
          weight={700}
          className="text-[13px] text-status-cancelled-fg"
          style={{ marginTop: 8 }}
        >
          {errorMessage(verify.error, t('auth.phone.wrongCode'))}
        </Text>
      )}

      <View className="flex-row items-center justify-between" style={{ marginTop: 14 }}>
        {timer.done ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              resend.mutate(d.userId ?? '');
              setSentAt(Date.now());
            }}
            style={{ paddingVertical: 12 }}
          >
            <Text weight={800} className="text-[14px] text-primary-pressed">
              {t('auth.phone.resend')}
            </Text>
          </Pressable>
        ) : (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Icon name="clock" size={16} color={colors.muted} strokeWidth={2.2} />
            <Text weight={700} className="text-[14px] text-muted">
              {t('auth.phone.resendIn', { time: timer.label })}
            </Text>
          </View>
        )}
        <Pressable
          accessibilityRole="link"
          onPress={() => router.replace('/(auth)/register/details')}
          style={{ paddingVertical: 12 }}
        >
          <Text weight={800} className="text-[14px] text-primary-pressed">
            {t('auth.email.change')}
          </Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => Linking.openURL('mailto:')}
        className="flex-row items-center justify-center rounded-pill bg-sheet"
        style={{ marginTop: 8, height: 48, gap: 8, borderWidth: 2, borderColor: colors.hairline }}
      >
        <Icon name="external" size={18} color={colors.primary.pressed} strokeWidth={2.2} />
        <Text weight={800} className="text-[15px] text-primary-pressed">
          {t('auth.email.openMail')}
        </Text>
      </Pressable>

      <View className="flex-1" style={{ minHeight: 24 }} />
      <InfoNote text={t('auth.email.note')} className="mb-4" />
      <Button
        label={t('auth.email.cta')}
        onPress={submit}
        disabled={code.length < 6 || verify.isPending}
      />
    </FormScreen>
  );
}
