import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import FormScreen from '@/components/common/FormScreen';
import { Button, Icon, Text } from '@/components/ui';
import { colors } from '@/theme';

import InfoNote from '../components/InfoNote';
import OtpInput from '../components/OtpInput';
import RegisterHeader from '../components/RegisterHeader';
import { useCountdown } from '../components/useCountdown';
import { errorMessage, useResend, useVerifyPhone } from '../hooks/useAuth';
import { totalSteps, useRegisterStore } from '../store';

const prettyPhone = (cc: string, local: string) =>
  `${cc} ${local.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3')}`;

export default function VerifyPhoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useRegisterStore();
  const verify = useVerifyPhone();
  const resend = useResend('phone');
  const [code, setCode] = useState('');
  const [sentAt, setSentAt] = useState(0);
  const timer = useCountdown(60, sentAt);
  const headerTitle =
    d.role === 'provider' && d.providerTypeName
      ? t('auth.register.headerTitleWithType', { type: d.providerTypeName })
      : t('auth.register.headerTitle');

  const submit = () =>
    verify.mutate(
      { userId: d.userId ?? '', code },
      { onSuccess: () => router.push('/(auth)/register/email') },
    );

  return (
    <FormScreen
      header={
        <RegisterHeader
          title={headerTitle}
          heading={t('auth.phone.title')}
          step={3}
          total={totalSteps(d.role)}
          padBottom={44}
        />
      }
      contentStyle={{
        paddingTop: 28,
        paddingHorizontal: 24,
        paddingBottom: Math.max(insets.bottom, 24),
      }}
    >
      <View
        className="items-center justify-center rounded-full bg-primary-soft"
        style={{ width: 64, height: 64 }}
      >
        <Icon name="phone" size={30} color={colors.primary.pressed} />
      </View>
      <Text
        weight={600}
        className="text-[16px] leading-[23px] text-[#4A4562]"
        style={{ marginTop: 16 }}
      >
        {t('auth.phone.sent')}{' '}
        <Text weight={800} className="text-[16px] text-ink">
          {prettyPhone(d.countryCode, d.phone)}
        </Text>
      </Text>

      <View style={{ marginTop: 22 }}>
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
          onPress={() => router.back()}
          style={{ paddingVertical: 12 }}
        >
          <Text weight={800} className="text-[14px] text-primary-pressed">
            {t('auth.phone.change')}
          </Text>
        </Pressable>
      </View>

      <View className="flex-1" style={{ minHeight: 24 }} />
      <InfoNote text={t('auth.phone.note')} className="mb-4" />
      <Button
        label={t('auth.phone.cta')}
        onPress={submit}
        disabled={code.length < 6 || verify.isPending}
      />
    </FormScreen>
  );
}
