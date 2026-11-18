import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import GenderRadio from '@/components/common/GenderRadio';
import InfoNote from '@/components/common/InfoNote';
import OtpInput from '@/components/common/OtpInput';
import { Button, Icon, Input, Sheet, Text } from '@/components/ui';
import { fieldErrors } from '@/utils/apiError';
import { useCountdown } from '@/hooks/useCountdown';
import { colors } from '@/theme';
import type { Gender, User } from '@/types';
import { prettyPhone } from '@/utils/format';

import {
  useChangeEmail,
  useChangePassword,
  useChangePhone,
  useUpdateDetails,
  useVerifyEmailChange,
  useVerifyPhoneChange,
} from '../hooks/useProfile';

type Common = { open: boolean; onClose: () => void; onDone: (toast: string) => void };
type Audience = { provider?: boolean };
type Errors = Record<string, string>;

const FormError = ({ text }: { text?: string }) =>
  text ? (
    <Text weight={700} className="text-[13px] text-status-cancelled-fg">
      {text}
    </Text>
  ) : null;

// ---------- Edit details (name + gender) ----------
// Sheet mounts its children only while it is on screen, so body state starts fresh every time.
export function DetailsSheet({
  open,
  onClose,
  onDone,
  user,
  provider,
}: Common & Audience & { user: User }) {
  const { t } = useTranslation();
  const title = provider
    ? t('profile.sheet.details.titleProvider')
    : t('profile.sheet.details.title');
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <DetailsBody onDone={onDone} user={user} provider={provider} />
    </Sheet>
  );
}

function DetailsBody({
  onDone,
  user,
  provider,
}: Audience & { onDone: Common['onDone']; user: User }) {
  const { t } = useTranslation();
  const update = useUpdateDetails();
  const [fullName, setFullName] = useState(user.fullName);
  const [gender, setGender] = useState<Gender>(user.gender);
  const [errors, setErrors] = useState<Errors>({});

  const submit = () => {
    if (!fullName.trim()) return setErrors({ fullName: t('auth.details.errors.name') });
    update.mutate(
      { fullName: fullName.trim(), gender },
      {
        onSuccess: () => onDone(t('profile.sheet.details.toast')),
        onError: (e) => setErrors(fieldErrors(e, t('common.checkForm'))),
      },
    );
  };
  return (
    <>
      <Input
        label={t('profile.fullName')}
        value={fullName}
        onChangeText={setFullName}
        autoComplete="name"
        error={errors.fullName}
        hint={provider ? t('profile.sheet.details.nameHintProvider') : undefined}
        height={54}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <GenderRadio value={gender} onChange={setGender} />
      <FormError text={errors.form} />
      <Button label={t('profile.sheet.details.cta')} onPress={submit} disabled={update.isPending} />
    </>
  );
}

// ---------- Phone / email change: step 1 new value, step 2 code ----------
type ContactKind = 'phone' | 'email';

export function ContactSheet({
  open,
  onClose,
  onDone,
  kind,
  user,
  provider,
}: Common & Audience & { kind: ContactKind; user: User }) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'value' | 'code'>('value');
  // The step lives here (it drives the title), so restart it on every open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setStep('value');
  }
  const title = step === 'value' ? t(`profile.sheet.${kind}.title`) : t('profile.sheet.code.title');
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <ContactBody
        onDone={onDone}
        kind={kind}
        user={user}
        step={step}
        setStep={setStep}
        provider={provider}
      />
    </Sheet>
  );
}

function ContactBody({
  onDone,
  kind,
  user,
  step,
  setStep,
  provider,
}: Audience & {
  onDone: Common['onDone'];
  kind: ContactKind;
  user: User;
  step: 'value' | 'code';
  setStep: (s: 'value' | 'code') => void;
}) {
  const { t } = useTranslation();
  const sendPhone = useChangePhone();
  const sendEmail = useChangeEmail();
  const verifyPhone = useVerifyPhoneChange();
  const verifyEmail = useVerifyEmailChange();
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sentAt, setSentAt] = useState(0);
  const timer = useCountdown(60, sentAt);
  const countryCode = '+374';

  const isPhone = kind === 'phone';
  const target = isPhone ? `${countryCode}${value.replace(/\D/g, '')}` : value.trim();
  const sending = sendPhone.isPending || sendEmail.isPending;
  const verifying = verifyPhone.isPending || verifyEmail.isPending;

  const send = () => {
    setErrors({});
    const opts = {
      onSuccess: () => {
        setSentAt(Date.now());
        setCode('');
        setStep('code');
      },
      onError: (e: unknown) => setErrors(fieldErrors(e, t('common.checkForm'))),
    };
    if (isPhone) sendPhone.mutate(target, opts);
    else sendEmail.mutate(target, opts);
  };
  const verify = (c: string) => {
    setErrors({});
    const opts = {
      onSuccess: () => onDone(t(`profile.sheet.${kind}.done`)),
      onError: (e: unknown) => setErrors(fieldErrors(e, t('auth.phone.wrongCode'))),
    };
    if (isPhone) verifyPhone.mutate(c, opts);
    else verifyEmail.mutate(c, opts);
  };

  return (
    <>
      {step === 'value' ? (
        <>
          <Text weight={600} className="text-[15px] leading-[22px] text-inkSoft">
            {t(`profile.sheet.${kind}.current`)}{' '}
            <Text weight={800} className="text-[15px] text-ink">
              {isPhone ? prettyPhone(user.phone) : user.email}
            </Text>
          </Text>
          {isPhone ? (
            <View>
              <Text weight={800} className="text-[14px] text-ink" style={{ marginBottom: 6 }}>
                {provider ? t('profile.sheet.phone.labelProvider') : t('profile.sheet.phone.label')}
              </Text>
              <View className="flex-row" style={{ gap: 8 }}>
                {/* Country picker is in docs/BACKLOG.md; +374 fixed for now. */}
                <View
                  className="flex-row items-center rounded-[16px] bg-ground"
                  style={{
                    height: 54,
                    paddingHorizontal: 12,
                    gap: 6,
                    borderWidth: 2,
                    borderColor: colors.hairline,
                  }}
                >
                  <Text weight={800} className="text-[16px] text-ink">
                    {countryCode}
                  </Text>
                  <Icon name="chevronDown" size={14} color={colors.muted} strokeWidth={2.6} />
                </View>
                <Input
                  className="flex-1"
                  height={54}
                  value={value}
                  onChangeText={setValue}
                  keyboardType="phone-pad"
                  autoComplete="tel-national"
                  placeholder="91 000 000"
                  error={errors.phone}
                  returnKeyType="done"
                  onSubmitEditing={send}
                />
              </View>
            </View>
          ) : (
            <Input
              label={t('profile.sheet.email.label')}
              height={54}
              value={value}
              onChangeText={setValue}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="name@example.com"
              error={errors.email}
              returnKeyType="done"
              onSubmitEditing={send}
            />
          )}
          <InfoNote
            text={
              provider && isPhone
                ? t('profile.sheet.phone.noteProvider')
                : t(`profile.sheet.${kind}.note`)
            }
          />
          <FormError text={errors.form} />
          <Button label={t(`profile.sheet.${kind}.cta`)} onPress={send} disabled={sending} />
        </>
      ) : (
        <>
          <Text weight={600} className="text-[15px] leading-[22px] text-inkSoft">
            {t('profile.sheet.code.sentTo')}{' '}
            <Text weight={800} className="text-[15px] text-ink">
              {isPhone ? prettyPhone(target) : target}
            </Text>
          </Text>
          <OtpInput value={code} onChange={setCode} error={!!errors.code} onComplete={verify} />
          <FormError text={errors.code ?? errors.form} />
          <Text
            weight={700}
            className="text-[14px] text-primary-pressed"
            onPress={timer.done && !sending ? send : undefined}
            style={{ opacity: timer.done ? 1 : 0.6 }}
          >
            {timer.done ? t('auth.phone.resend') : t('auth.phone.resendIn', { time: timer.label })}
          </Text>
          <Button
            label={t('profile.sheet.code.cta')}
            onPress={() => verify(code)}
            disabled={code.length < 6 || verifying}
          />
        </>
      )}
    </>
  );
}

// ---------- Change password ----------
export function PasswordSheet({ open, onClose, onDone }: Common) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} title={t('profile.sheet.password.title')} onClose={onClose}>
      <PasswordBody onDone={onDone} />
    </Sheet>
  );
}

function PasswordBody({ onDone }: { onDone: Common['onDone'] }) {
  const { t } = useTranslation();
  const change = useChangePassword();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const nextOk = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(next);
  const matches = nextOk && next === confirm;

  const submit = () => {
    const e: Errors = {};
    if (!current) e.currentPassword = t('profile.errors.currentPassword');
    if (!nextOk) e.newPassword = t('common.passwordHint');
    if (next !== confirm) e.confirm = t('auth.details.errors.confirm');
    setErrors(e);
    if (Object.keys(e).length) return;
    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => onDone(t('profile.sheet.password.toast')),
        onError: (err) => setErrors(fieldErrors(err, t('common.checkForm'))),
      },
    );
  };
  return (
    <>
      <Input
        label={t('profile.sheet.password.current')}
        secure
        value={current}
        onChangeText={setCurrent}
        autoComplete="current-password"
        error={errors.currentPassword}
        returnKeyType="next"
      />
      <Input
        label={t('profile.sheet.password.new')}
        secure
        value={next}
        onChangeText={setNext}
        autoComplete="new-password"
        hint={t('common.passwordHint')}
        error={errors.newPassword}
        returnKeyType="next"
      />
      <View>
        <Input
          label={t('profile.sheet.password.confirm')}
          secure
          tone={matches ? 'ok' : 'default'}
          value={confirm}
          onChangeText={setConfirm}
          autoComplete="new-password"
          error={errors.confirm}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {matches && (
          <View className="flex-row items-center" style={{ marginTop: 6, gap: 6 }}>
            <Icon name="check" size={14} color={colors.status.confirmed.fg} strokeWidth={3} />
            <Text weight={700} className="text-[13px] text-status-confirmed-fg">
              {t('common.passwordsMatch')}
            </Text>
          </View>
        )}
      </View>
      <Text weight={600} className="text-[13px] leading-[19px] text-muted">
        {t('profile.sheet.password.note')}
      </Text>
      <FormError text={errors.form} />
      <Button
        label={t('profile.sheet.password.cta')}
        onPress={submit}
        disabled={change.isPending}
      />
    </>
  );
}

// ---------- Sign out ----------
export function SignOutSheet({
  open,
  onClose,
  onConfirm,
  pending,
  provider,
}: Audience & {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} title={t('profile.sheet.signout.title')} onClose={onClose}>
      <Text weight={600} className="text-[15px] leading-[22px] text-inkSoft">
        {provider ? t('profile.sheet.signout.textProvider') : t('profile.sheet.signout.text')}
      </Text>
      <Button
        label={t('profile.sheet.signout.cta')}
        onPress={onConfirm}
        disabled={pending}
        className="bg-status-cancelled-fg active:bg-status-cancelled-fg"
      />
      <Button
        label={t('profile.sheet.signout.stay')}
        variant="secondary"
        height={54}
        onPress={onClose}
        className="border-hairline"
      />
    </Sheet>
  );
}
