import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ListState from '@/components/common/ListState';
import RoundButton from '@/components/common/RoundButton';
import StatusBarBand from '@/components/common/StatusBarBand';
import { Text } from '@/components/ui';
import type { PolicyBlock } from '@/types';
import { getDateLocale } from '@/utils/format';

import { usePrivacy } from '../hooks/useContent';

const Block = ({ block }: { block: PolicyBlock }) =>
  block.type === 'bullet' ? (
    <View className="flex-row" style={{ gap: 10 }}>
      <View
        className="rounded-full bg-primary"
        style={{ width: 6, height: 6, marginTop: 9, flexShrink: 0 }}
      />
      <Text weight={600} className="flex-1 text-[15px] leading-[23px] text-inkSoft">
        {block.text}
      </Text>
    </View>
  ) : (
    <Text weight={600} className="text-[15px] leading-[23px] text-inkSoft">
      {block.text}
    </Text>
  );

// The web Privacy page (Privacy.dc.html) on a phone: "In short" card, then one white card
// per section; the data table becomes a card per row.
export default function PrivacyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const policy = usePrivacy();
  const p = policy.data;

  return (
    <View className="flex-1 bg-ground">
      <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
        <View
          className="bg-primary"
          style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 44 }}
        >
          <RoundButton icon="chevronLeft" label={t('common.back')} onPress={() => router.back()} />
          <Text
            weight={800}
            className="text-[24px] leading-[30px] text-sheet"
            style={{ marginTop: 14 }}
          >
            {t('help.privacy.title')}
          </Text>
          {p?.updatedAt ? (
            <Text weight={700} className="text-[14px] text-primary-soft" style={{ marginTop: 4 }}>
              {t('help.privacy.updated', {
                date: new Date(p.updatedAt).toLocaleDateString(getDateLocale(), {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
              })}
            </Text>
          ) : null}
        </View>

        <View
          className="rounded-t-sheet bg-ground"
          style={{
            marginTop: -24,
            padding: 20,
            paddingBottom: Math.max(insets.bottom, 24),
            gap: 12,
          }}
        >
          <ListState loading={policy.isPending} error={policy.isError} onRetry={policy.refetch}>
            {p ? (
              <>
                <View className="bg-primary-soft" style={{ borderRadius: 22, padding: 16, gap: 8 }}>
                  <Text weight={800} className="text-[17px] text-primary-pressed">
                    {t('help.privacy.inShort')}
                  </Text>
                  {p.summary.map((line) => (
                    <Block key={line} block={{ type: 'bullet', text: line }} />
                  ))}
                </View>

                {p.sections.map((section) => (
                  <View
                    key={section.id}
                    className="bg-sheet"
                    style={{ borderRadius: 22, padding: 16, gap: 8 }}
                  >
                    <Text weight={800} className="text-[17px] leading-[23px] text-ink">
                      {section.title}
                    </Text>
                    {section.blocks.map((block) => (
                      <Block key={block.text} block={block} />
                    ))}
                    {section.table
                      ? p.dataTable.map((row) => (
                          <View
                            key={row.data}
                            className="bg-ground"
                            style={{ borderRadius: 16, padding: 12, gap: 4 }}
                          >
                            <Text weight={800} className="text-[15px] text-ink">
                              {row.data}
                            </Text>
                            <Text weight={600} className="text-[14px] leading-[20px] text-inkSoft">
                              {row.what}
                            </Text>
                            <Text weight={600} className="text-[13px] leading-[19px] text-muted">
                              {`${t('help.privacy.why')}: ${row.why}`}
                            </Text>
                            <Text weight={600} className="text-[13px] leading-[19px] text-muted">
                              {`${t('help.privacy.who')}: ${row.who}`}
                            </Text>
                          </View>
                        ))
                      : null}
                  </View>
                ))}
              </>
            ) : null}
          </ListState>
        </View>
      </ScrollView>
      <StatusBarBand />
    </View>
  );
}
