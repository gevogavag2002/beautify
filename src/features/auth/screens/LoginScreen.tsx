import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trans, useTranslation } from 'react-i18next';

import FormScreen from '@/components/common/FormScreen';
import { Button, Icon, Input, Text } from '@/components/ui';
import { colors } from '@/theme';

import { errorMessage, useLogin } from '../hooks/useAuth';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () =>
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (r) =>
          router.replace(r.user.role === 'provider' ? '/(provider)/schedule' : '/(client)'),
      },
    );

  const header = (
    <View
      className="items-center"
      style={{ paddingTop: insets.top + 44, paddingHorizontal: 28, paddingBottom: 56, gap: 12 }}
    >
      <View
        className="items-center justify-center bg-sheet"
        style={{ width: 72, height: 72, borderRadius: 24 }}
      >
        <Icon name="sparkle" size={38} color={colors.primary.DEFAULT} />
      </View>
      <Text weight={800} className="text-[28px] leading-[34px] text-sheet">
        Beautify
      </Text>
      <Text weight={600} className="text-center text-[15px] leading-[22px] text-primary-soft">
        {t('auth.login.tagline')}
      </Text>
    </View>
  );

  return (
    <FormScreen
      header={header}
      bg="primary"
      overlap={0}
      contentStyle={{
        paddingTop: 28,
        paddingHorizontal: 24,
        paddingBottom: Math.max(insets.bottom, 24),
      }}
    >
      <Text weight={800} className="text-[26px] leading-[32px] text-ink">
        {t('auth.login.title')}
      </Text>
      <Text weight={600} className="text-[15px] leading-[22px] text-muted" style={{ marginTop: 6 }}>
        {t('auth.login.subtitle')}
      </Text>

      <Input
        label={t('auth.login.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        className="mt-[22px]"
      />
      <Input
        label={t('auth.login.password')}
        labelRight={
          <Pressable accessibilityRole="link" hitSlop={8} style={{ paddingVertical: 8 }}>
            <Text weight={800} className="text-[14px] text-primary-pressed">
              {t('auth.login.forgot')}
            </Text>
          </Pressable>
        }
        value={password}
        onChangeText={setPassword}
        secure
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={submit}
        returnKeyType="done"
        className="mt-4"
      />
      {login.isError && (
        <Text weight={700} className="mt-2 text-[13px] text-status-cancelled-fg">
          {errorMessage(login.error, t('auth.login.wrongCredentials'))}
        </Text>
      )}

      <View className="flex-1" style={{ minHeight: 24 }} />

      <Button label={t('auth.login.cta')} onPress={submit} disabled={login.isPending} />

      <View className="flex-row items-center" style={{ gap: 12, marginVertical: 20 }}>
        <View className="flex-1 bg-hairline" style={{ height: 1 }} />
        <Text weight={700} className="text-[13px] text-muted">
          {t('auth.login.newHere')}
        </Text>
        <View className="flex-1 bg-hairline" style={{ height: 1 }} />
      </View>

      <Button
        label={t('auth.login.create')}
        variant="secondary"
        onPress={() => router.push('/(auth)/register/role')}
      />
      <Text
        weight={600}
        className="text-center text-[12px] leading-[18px] text-muted"
        style={{ marginTop: 12 }}
      >
        <Trans
          i18nKey="auth.login.terms"
          components={{
            terms: <Text weight={800} className="text-[12px] text-primary-pressed" />,
            privacy: <Text weight={800} className="text-[12px] text-primary-pressed" />,
          }}
        />
      </Text>
    </FormScreen>
  );
}
