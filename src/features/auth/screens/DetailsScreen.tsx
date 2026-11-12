import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import FormScreen from '@/components/common/FormScreen';
import { Button, Icon, Input, Text } from '@/components/ui';
import { colors } from '@/theme';

import GenderRadio from '../components/GenderRadio';
import RegisterHeader from '../components/RegisterHeader';
import { fieldErrors, useRegister } from '../hooks/useAuth';
import { totalSteps, useRegisterStore } from '../store';

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

export default function DetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useRegisterStore();
  const register = useRegister();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  const passwordOk = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(d.password);
  const matches = passwordOk && d.password === d.passwordConfirm;

  // Client-side checks mirror the backend rules; shown after the first submit attempt.
  const validate = () => {
    const e: Record<string, string> = {};
    if (!d.fullName.trim()) e.fullName = t('auth.details.errors.name');
    if (d.phone.replace(/\D/g, '').length < 6) e.phone = t('auth.details.errors.phone');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim()))
      e.email = t('auth.details.errors.email');
    if (!passwordOk) e.password = t('common.passwordHint');
    if (d.password !== d.passwordConfirm) e.passwordConfirm = t('auth.details.errors.confirm');
    return e;
  };
  const shown = touched ? { ...validate(), ...errors } : errors;
  const headerTitle =
    d.role === 'provider' && d.providerTypeName
      ? t('auth.register.headerTitleWithType', { type: d.providerTypeName })
      : t('auth.register.headerTitle');

  const submit = () => {
    setTouched(true);
    setErrors({});
    if (Object.keys(validate()).length) return;
    register.mutate(
      {
        role: d.role,
        providerTypeId: d.providerTypeId ?? undefined,
        fullName: d.fullName.trim(),
        gender: d.gender,
        phone: `${d.countryCode}${d.phone.replace(/\D/g, '')}`,
        email: d.email.trim(),
        password: d.password,
      },
      {
        onSuccess: (r) => {
          d.patch({ userId: r.userId });
          router.push('/(auth)/register/phone');
        },
        onError: (e) => setErrors(fieldErrors(e, t('common.checkForm'))),
      },
    );
  };

  return (
    <FormScreen
      header={
        <RegisterHeader
          title={headerTitle}
          heading={t('auth.details.title')}
          step={2}
          total={totalSteps(d.role)}
          padBottom={44}
        />
      }
      contentStyle={{
        paddingTop: 16,
        paddingHorizontal: 20,
        paddingBottom: Math.max(insets.bottom, 16),
        gap: 10,
      }}
    >
      <View className="flex-row items-center" style={{ gap: 12 }}>
        {d.photoUri ? (
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 56, height: 56, backgroundColor: '#E8E3FB' }}
          >
            <Text weight={800} className="text-[20px] text-primary-pressed">
              {initials(d.fullName) || 'AG'}
            </Text>
          </View>
        ) : (
          <View
            className="items-center justify-center rounded-full bg-ground"
            style={{
              width: 56,
              height: 56,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '#B9ACF5',
            }}
          >
            <Icon name="camera" size={22} color={colors.primary.DEFAULT} />
          </View>
        )}
        <View className="flex-1">
          <Text weight={800} className="text-[15px] text-ink" numberOfLines={1}>
            {t('auth.details.photo')}{' '}
            <Text weight={600} className="text-[15px] text-muted">
              · {t('auth.details.optional')}
            </Text>
          </Text>
          <Text
            weight={600}
            className="text-[13px] leading-[17px] text-muted"
            style={{ marginTop: 1 }}
          >
            {t('auth.details.photoHint')}
          </Text>
        </View>
        {/* Image picking needs expo-image-picker (native). Stubbed until that module is added. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => d.patch({ photoUri: d.photoUri ? null : 'placeholder' })}
          className="items-center justify-center rounded-pill bg-sheet"
          style={{
            height: 44,
            paddingHorizontal: 14,
            borderWidth: 2,
            borderColor: colors.hairline,
          }}
        >
          <Text weight={800} className="text-[14px] text-primary-pressed">
            {d.photoUri ? t('auth.details.changePhoto') : t('auth.details.addPhoto')}
          </Text>
        </Pressable>
      </View>

      <Input
        label={t('auth.details.fullName')}
        height={48}
        value={d.fullName}
        onChangeText={(v) => d.patch({ fullName: v })}
        autoComplete="name"
        textContentType="name"
        error={shown.fullName}
        returnKeyType="next"
      />

      <GenderRadio value={d.gender} onChange={(gender) => d.patch({ gender })} />

      <View>
        <Text
          weight={800}
          className="text-[14px] leading-[18px] text-ink"
          style={{ marginBottom: 4 }}
        >
          {t('auth.details.phone')}
        </Text>
        <View className="flex-row" style={{ gap: 8 }}>
          {/* Country picker to be added; +374 fixed for now. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Country code ${d.countryCode}, change`}
            className="flex-row items-center rounded-input bg-ground"
            style={{
              height: 48,
              paddingHorizontal: 12,
              gap: 6,
              borderWidth: 2,
              borderColor: colors.hairline,
            }}
          >
            <Text weight={800} className="text-[16px] text-ink">
              {d.countryCode}
            </Text>
            <Icon name="chevronDown" size={14} color={colors.muted} strokeWidth={2.6} />
          </Pressable>
          <Input
            height={48}
            className="flex-1"
            value={d.phone}
            onChangeText={(v) => d.patch({ phone: v })}
            keyboardType="phone-pad"
            autoComplete="tel-national"
            textContentType="telephoneNumber"
            placeholder="91 000 000"
            error={shown.phone}
          />
        </View>
      </View>

      <Input
        label={t('auth.details.email')}
        height={48}
        value={d.email}
        onChangeText={(v) => d.patch({ email: v })}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        error={shown.email}
        returnKeyType="next"
      />

      <Input
        label={t('auth.details.password')}
        height={48}
        secure
        value={d.password}
        onChangeText={(v) => d.patch({ password: v })}
        autoComplete="new-password"
        textContentType="newPassword"
        hint={t('common.passwordHint')}
        error={shown.password}
        returnKeyType="next"
      />

      <View>
        <Input
          label={t('auth.details.confirmPassword')}
          height={48}
          secure
          tone={matches ? 'ok' : 'default'}
          value={d.passwordConfirm}
          onChangeText={(v) => d.patch({ passwordConfirm: v })}
          autoComplete="new-password"
          textContentType="newPassword"
          error={shown.passwordConfirm}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {matches && (
          <View className="flex-row items-center" style={{ marginTop: 4, gap: 6 }}>
            <Icon name="check" size={14} color={colors.status.confirmed.fg} strokeWidth={3} />
            <Text weight={700} className="text-[13px] leading-[17px] text-status-confirmed-fg">
              {t('common.passwordsMatch')}
            </Text>
          </View>
        )}
      </View>

      {shown.form && (
        <Text weight={700} className="text-[13px] text-status-cancelled-fg">
          {shown.form}
        </Text>
      )}

      <View className="flex-1" style={{ minHeight: 8 }} />
      <Button
        label={t('common.continue')}
        height={54}
        onPress={submit}
        disabled={register.isPending}
      />
    </FormScreen>
  );
}
