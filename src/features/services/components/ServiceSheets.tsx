import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Icon, Input, Sheet, Stepper, Switch, Text } from '@/components/ui';
import { useServiceCategories } from '@/hooks/useCatalog';
import { useAddService, useRemoveService, useUpdateService } from '@/hooks/useMyProvider';
import { colors } from '@/theme';
import type { Provider, ProviderService } from '@/types';
import { fieldErrors } from '@/utils/apiError';

const MIN = 5;
const MAX = 480;
const DESCRIPTION_MAX = 80;

type Done = (message: string) => void;

const ErrorLine = ({ text }: { text?: string }) =>
  text ? (
    <Text weight={700} className="text-[13px] text-status-cancelled-fg">
      {text}
    </Text>
  ) : null;

const DurationStepper = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const { t } = useTranslation();
  return (
    <Stepper
      label={t('services.sheet.duration')}
      value={t('common.min', { value })}
      onLess={() => onChange(Math.max(MIN, value - 5))}
      onMore={() => onChange(Math.min(MAX, value + 5))}
      lessDisabled={value <= MIN}
      moreDisabled={value >= MAX}
      lessLabel={t('services.sheet.shorter')}
      moreLabel={t('services.sheet.longer')}
    />
  );
};

export function EditServiceSheet({
  service,
  onClose,
  onDone,
}: {
  /** The service being edited; null keeps the sheet closed. */
  service: ProviderService | null;
  onClose: () => void;
  onDone: Done;
}) {
  return (
    <Sheet open={service != null} title={service?.name ?? ''} onClose={onClose}>
      {service ? <EditBody service={service} onDone={onDone} /> : null}
    </Sheet>
  );
}

function EditBody({ service, onDone }: { service: ProviderService; onDone: Done }) {
  const { t } = useTranslation();
  const update = useUpdateService();
  const remove = useRemoveService();
  const [duration, setDuration] = useState(service.durationMin);
  const [description, setDescription] = useState(service.description ?? '');
  const [hidden, setHidden] = useState(service.hidden);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const busy = update.isPending || remove.isPending;

  const save = () =>
    update.mutate(
      { id: service.id, durationMin: duration, description: description.trim() || null, hidden },
      {
        onSuccess: () => onDone(t('services.sheet.saved')),
        onError: (e) => setErrors(fieldErrors(e, t('common.checkForm'))),
      },
    );
  const doRemove = () =>
    remove.mutate(service.id, {
      onSuccess: () => onDone(t('services.sheet.removed', { name: service.name })),
      onError: (e) => setErrors(fieldErrors(e, t('common.checkForm'))),
    });

  return (
    <>
      <DurationStepper value={duration} onChange={setDuration} />
      <ErrorLine text={errors.durationMin} />
      <Input
        label={t('services.sheet.description')}
        placeholder={t('services.sheet.descriptionPlaceholder')}
        value={description}
        onChangeText={setDescription}
        maxLength={DESCRIPTION_MAX}
        error={errors.description}
        height={48}
      />
      <View className="flex-row items-center" style={{ gap: 12, minHeight: 44 }}>
        <View className="flex-1">
          <Text weight={800} className="text-[15px] text-ink">
            {t('services.sheet.hide')}
          </Text>
          <Text weight={600} className="text-[13px] text-muted">
            {t('services.sheet.hideHint')}
          </Text>
        </View>
        <Switch value={hidden} onChange={setHidden} label={t('services.sheet.hide')} />
      </View>
      <ErrorLine text={errors.form} />
      <Button label={t('common.save')} onPress={save} disabled={busy} />
      {confirmRemove ? (
        <Button
          label={t('services.sheet.removeConfirm')}
          onPress={doRemove}
          disabled={busy}
          height={54}
          className="bg-status-cancelled-fg active:bg-status-cancelled-fg"
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setConfirmRemove(true)}
          className="items-center justify-center"
          style={{ height: 48 }}
        >
          <Text weight={800} className="text-[15px] text-status-cancelled-fg">
            {t('services.sheet.remove')}
          </Text>
        </Pressable>
      )}
    </>
  );
}

export function AddServiceSheet({
  open,
  onClose,
  onDone,
  provider,
}: {
  open: boolean;
  onClose: () => void;
  onDone: Done;
  provider: Provider;
}) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} title={t('services.add.title')} onClose={onClose}>
      <AddBody provider={provider} onDone={onDone} />
    </Sheet>
  );
}

function AddBody({ provider, onDone }: { provider: Provider; onDone: Done }) {
  const { t } = useTranslation();
  const categories = useServiceCategories(provider.typeId);
  const add = useAddService();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const taken = new Set(provider.services.map((s) => s.catalogServiceId));
  const groups = (categories.data ?? [])
    .map((c) => ({ ...c, services: c.services.filter((s) => !taken.has(s.id)) }))
    .filter((c) => c.services.length > 0);

  const submit = () => {
    if (!pickedId) {
      setErrors({ catalogServiceId: t('services.add.pick') });
      return;
    }
    add.mutate(
      { catalogServiceId: pickedId, durationMin: duration },
      {
        onSuccess: () => onDone(t('services.add.toast')),
        onError: (e) => setErrors(fieldErrors(e, t('common.checkForm'))),
      },
    );
  };

  if (categories.isPending) return <ActivityIndicator color={colors.primary.DEFAULT} />;
  if (categories.isError) {
    return (
      <Text weight={700} className="text-[14px] text-status-cancelled-fg">
        {t('common.loadError')}{' '}
        <Text
          weight={800}
          className="text-[14px] text-primary-pressed"
          onPress={() => categories.refetch()}
        >
          {t('common.retry')}
        </Text>
      </Text>
    );
  }
  if (groups.length === 0) {
    return (
      <Text weight={600} className="text-[15px] leading-[22px] text-inkSoft">
        {t('services.add.none')}
      </Text>
    );
  }
  return (
    <>
      {groups.map((c) => (
        <View key={c.id} style={{ gap: 8 }}>
          <Text weight={800} className="text-[14px] text-muted">
            {c.name}
          </Text>
          <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
            {c.services.map((s) => {
              const sel = s.id === pickedId;
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: sel }}
                  onPress={() => {
                    setPickedId(s.id);
                    setErrors({});
                  }}
                  className="flex-row items-center"
                  style={{
                    minHeight: 52,
                    borderRadius: 16,
                    borderWidth: 2,
                    paddingHorizontal: 14,
                    gap: 10,
                    borderColor: sel ? colors.primary.DEFAULT : colors.hairline,
                    backgroundColor: sel ? colors.primary.faint : colors.sheet,
                  }}
                >
                  <Text weight={800} className="flex-1 text-[15px] text-ink" numberOfLines={2}>
                    {s.name}
                  </Text>
                  {sel ? (
                    <Icon
                      name="checkWide"
                      size={18}
                      color={colors.primary.DEFAULT}
                      strokeWidth={3}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      <ErrorLine text={errors.catalogServiceId} />
      <DurationStepper value={duration} onChange={setDuration} />
      <ErrorLine text={errors.durationMin ?? errors.form} />
      <Button label={t('services.add.cta')} onPress={submit} disabled={add.isPending} />
    </>
  );
}
