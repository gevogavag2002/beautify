import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ProviderTypeCard from '@/components/common/ProviderTypeCard';
import { Sheet } from '@/components/ui';
import type { Id, ProviderType } from '@/types';

type Props = {
  open: boolean;
  onClose: () => void;
  types: ProviderType[];
  selected: Id | null;
  onPick: (typeId: Id | null) => void;
};

// Opened by the type button in the search header: every provider type plus "All types".
export default function TypeFilterSheet({ open, onClose, types, selected, onPick }: Props) {
  const { t } = useTranslation();
  const all: ProviderType = {
    id: '',
    slug: 'all',
    name: t('search.allTypes'),
    shortName: t('search.allTypes'),
    pluralName: t('search.providers'),
  };
  return (
    <Sheet open={open} title={t('search.typeSheet')} onClose={onClose}>
      <View className="flex-row flex-wrap" style={{ gap: 8 }} accessibilityRole="radiogroup">
        {[all, ...types].map((type) => (
          <ProviderTypeCard
            key={type.id || 'all'}
            type={type}
            selected={(type.id || null) === selected}
            onPress={() => onPick(type.id || null)}
          />
        ))}
      </View>
    </Sheet>
  );
}
