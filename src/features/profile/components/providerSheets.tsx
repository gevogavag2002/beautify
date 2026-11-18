import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ProviderTypeCard from '@/components/common/ProviderTypeCard';
import { Button, Input, Sheet, Text, TextArea } from '@/components/ui';
import { fieldErrors } from '@/utils/apiError';
import { useProviderTypes } from '@/hooks/useCatalog';
import { colors } from '@/theme';
import type { Id, Provider } from '@/types';

import { useUpdateMyProvider } from '@/hooks/useMyProvider';

type Common = {
  open: boolean;
  onClose: () => void;
  onDone: (toast: string) => void;
  provider: Provider;
};
type Errors = Record<string, string>;
const ABOUT_MAX = 300;

const FormError = ({ text }: { text?: string }) =>
  text ? (
    <Text weight={700} className="text-[13px] text-status-cancelled-fg">
      {text}
    </Text>
  ) : null;

// ---------- Business name + about ----------
export function BusinessSheet({ open, onClose, onDone, provider }: Common) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} title={t('profile.sheet.business.title')} onClose={onClose}>
      <BusinessBody onDone={onDone} provider={provider} />
    </Sheet>
  );
}
function BusinessBody({ onDone, provider }: Pick<Common, 'onDone' | 'provider'>) {
  const { t } = useTranslation();
  const update = useUpdateMyProvider();
  const [name, setName] = useState(provider.businessName);
  const [about, setAbout] = useState(provider.about ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const submit = () => {
    const e: Errors = {};
    if (!name.trim()) e.businessName = t('profile.errors.businessName');
    if (about.length > ABOUT_MAX) e.about = t('profile.errors.aboutTooLong', { max: ABOUT_MAX });
    setErrors(e);
    if (Object.keys(e).length) return;
    update.mutate(
      { businessName: name.trim(), about: about.trim() || null },
      {
        onSuccess: () => onDone(t('profile.sheet.business.toast')),
        onError: (err) => setErrors(fieldErrors(err, t('common.checkForm'))),
      },
    );
  };
  return (
    <>
      <Input
        label={t('profile.sheet.business.name')}
        value={name}
        onChangeText={setName}
        autoComplete="organization"
        error={errors.businessName}
        returnKeyType="next"
      />
      <TextArea
        label={t('profile.sheet.business.about')}
        labelRight={t('profile.sheet.business.optional')}
        counter={{ value: about.length, max: ABOUT_MAX }}
        value={about}
        onChangeText={setAbout}
        hint={t('profile.sheet.business.aboutHint')}
        error={errors.about}
      />
      <FormError text={errors.form} />
      <Button
        label={t('profile.sheet.business.cta')}
        onPress={submit}
        disabled={update.isPending}
      />
    </>
  );
}

// ---------- Provider type ----------
export function TypeSheet({ open, onClose, onDone, provider }: Common) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} title={t('profile.sheet.type.title')} onClose={onClose}>
      <TypeBody onDone={onDone} provider={provider} />
    </Sheet>
  );
}
function TypeBody({ onDone, provider }: Pick<Common, 'onDone' | 'provider'>) {
  const { t } = useTranslation();
  const types = useProviderTypes();
  const update = useUpdateMyProvider();
  const [typeId, setTypeId] = useState<Id>(provider.typeId);
  const [error, setError] = useState<string | undefined>();
  const submit = () =>
    update.mutate(
      { typeId },
      {
        onSuccess: () => onDone(t('profile.sheet.type.toast')),
        onError: (err) => setError(fieldErrors(err, t('common.checkForm')).form),
      },
    );
  return (
    <>
      <Text weight={600} className="text-[14px] leading-[20px] text-inkSoft">
        {t('profile.sheet.type.note')}
      </Text>
      {types.isPending && <ActivityIndicator color={colors.primary.DEFAULT} />}
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
        {(types.data ?? []).map((tp) => (
          <ProviderTypeCard
            key={tp.id}
            type={tp}
            selected={tp.id === typeId}
            onPress={() => setTypeId(tp.id)}
          />
        ))}
      </View>
      <FormError text={error} />
      <Button
        label={t('profile.sheet.type.cta')}
        onPress={submit}
        disabled={update.isPending || typeId === provider.typeId}
      />
    </>
  );
}

// ---------- Address + map pin ----------
export function AddressSheet({ open, onClose, onDone, provider }: Common) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} title={t('profile.sheet.address.title')} onClose={onClose}>
      <AddressBody onDone={onDone} provider={provider} />
    </Sheet>
  );
}
function AddressBody({ onDone, provider }: Pick<Common, 'onDone' | 'provider'>) {
  const { t } = useTranslation();
  const update = useUpdateMyProvider();
  const [address, setAddress] = useState(provider.address);
  const [errors, setErrors] = useState<Errors>({});
  const submit = () => {
    if (!address.trim()) return setErrors({ address: t('profile.errors.address') });
    // Pin stays where it is until the map (docs/BACKLOG.md) lets the provider drag it.
    update.mutate(
      { address: address.trim(), lat: provider.lat, lng: provider.lng },
      {
        onSuccess: () => onDone(t('profile.sheet.address.toast')),
        onError: (err) => setErrors(fieldErrors(err, t('common.checkForm'))),
      },
    );
  };
  return (
    <>
      <Input
        label={t('profile.sheet.address.label')}
        value={address}
        onChangeText={setAddress}
        autoComplete="street-address"
        error={errors.address}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <MapPlaceholder />
      <Text weight={600} className="text-[13px] leading-[19px] text-muted">
        {t('profile.sheet.address.note')}
      </Text>
      <FormError text={errors.form} />
      <Button label={t('profile.sheet.address.cta')} onPress={submit} disabled={update.isPending} />
    </>
  );
}

// Decorative map from the canvas; a real map (native module) is in docs/BACKLOG.md.
function MapPlaceholder() {
  const road = (style: object) => (
    <View style={[{ position: 'absolute', backgroundColor: colors.sheet }, style]} />
  );
  return (
    <View
      accessibilityElementsHidden
      className="overflow-hidden rounded-card"
      style={{ height: 190, backgroundColor: '#E8E3FB' }}
    >
      {road({ left: -20, top: 58, width: 440, height: 14, transform: [{ rotate: '-8deg' }] })}
      {road({ left: -20, top: 140, width: 440, height: 10, transform: [{ rotate: '4deg' }] })}
      {road({ left: 110, top: -20, width: 12, height: 240, transform: [{ rotate: '12deg' }] })}
      {road({ left: 260, top: -20, width: 9, height: 240, transform: [{ rotate: '-6deg' }] })}
      <View
        style={{
          position: 'absolute',
          left: 22,
          top: 86,
          width: 70,
          height: 46,
          borderRadius: 12,
          backgroundColor: '#D7EFE6',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 168,
          top: 104,
          width: 16,
          height: 6,
          borderRadius: 8,
          backgroundColor: 'rgba(30, 26, 51, 0.2)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 159,
          top: 58,
          width: 34,
          height: 34,
          borderTopLeftRadius: 17,
          borderTopRightRadius: 17,
          borderBottomRightRadius: 17,
          borderBottomLeftRadius: 4,
          transform: [{ rotate: '-45deg' }],
          backgroundColor: colors.primary.DEFAULT,
          borderWidth: 3,
          borderColor: colors.sheet,
        }}
      />
    </View>
  );
}
