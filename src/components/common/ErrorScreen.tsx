import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Icon, Text } from '@/components/ui';
import { useLogout } from '@/hooks/useLogout';
import { useSessionStore } from '@/store/sessionStore';
import { colors } from '@/theme';

type Kind = 'notFound' | 'forbidden' | 'failure';

type Props = {
  kind: Kind;
  /** `failure` only: runs "Try again". */
  onRetry?: () => void;
};

// Illustrations copied 1:1 from the canvas (App404 / App403 / App500), 240x200 viewBox.
const Art = ({ kind }: { kind: Kind }) => (
  <Svg width={220} height={184} viewBox="0 0 240 200">
    <Circle cx={120} cy={104} r={88} fill={colors.primary.soft} />
    {kind === 'notFound' && (
      <>
        <Circle cx={34} cy={44} r={12} fill={colors.accent.rose.bg} />
        <Circle cx={210} cy={60} r={8} fill={colors.accent.mint.bg} />
        <Circle cx={200} cy={172} r={14} fill={colors.accent.amber.bg} />
        <Ellipse cx={120} cy={170} rx={34} ry={8} fill={colors.art.shadow} />
        <Path
          d="M120 36c-27 0-47 20-47 46 0 34 47 82 47 82s47-48 47-82c0-26-20-46-47-46z"
          fill={colors.primary.DEFAULT}
        />
        <Circle cx={120} cy={82} r={26} fill={colors.sheet} />
        <SvgText
          x={120}
          y={96}
          textAnchor="middle"
          fontFamily="Nunito_800ExtraBold"
          fontSize={38}
          fill={colors.primary.DEFAULT}
        >
          ?
        </SvgText>
      </>
    )}
    {kind === 'forbidden' && (
      <>
        <Circle cx={38} cy={54} r={10} fill={colors.accent.mint.bg} />
        <Circle cx={206} cy={48} r={13} fill={colors.accent.rose.bg} />
        <Circle cx={196} cy={170} r={9} fill={colors.accent.amber.bg} />
        <Ellipse cx={120} cy={174} rx={40} ry={8} fill={colors.art.shadow} />
        <Path
          d="M94 92V72a26 26 0 0 1 52 0v20"
          fill="none"
          stroke={colors.primary.pressed}
          strokeWidth={12}
          strokeLinecap="round"
        />
        <Rect x={78} y={86} width={84} height={76} rx={20} fill={colors.primary.DEFAULT} />
        <Circle cx={120} cy={116} r={10} fill={colors.sheet} />
        <Rect x={115} y={120} width={10} height={20} rx={5} fill={colors.sheet} />
      </>
    )}
    {kind === 'failure' && (
      <>
        <Circle cx={36} cy={60} r={12} fill={colors.accent.sky.bg} />
        <Circle cx={210} cy={56} r={9} fill={colors.accent.rose.bg} />
        <Circle cx={40} cy={166} r={8} fill={colors.accent.mint.bg} />
        <Ellipse cx={120} cy={174} rx={44} ry={8} fill={colors.art.shadow} />
        <Rect
          x={66}
          y={48}
          width={108}
          height={116}
          rx={18}
          fill={colors.sheet}
          stroke={colors.primary.DEFAULT}
          strokeWidth={4}
        />
        <Rect x={66} y={48} width={108} height={26} rx={13} fill={colors.primary.DEFAULT} />
        <Circle cx={82} cy={61} r={4} fill={colors.sheet} />
        <Circle cx={96} cy={61} r={4} fill={colors.sheet} />
        <Path
          d="M84 96h56M84 112h40M84 128h48"
          stroke={colors.art.shadow}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <Circle
          cx={168}
          cy={148}
          r={28}
          fill={colors.accent.amber.bg}
          stroke={colors.accent.amber.fg}
          strokeWidth={4}
        />
        <Path
          d="M168 134v16"
          stroke={colors.accent.amber.fg}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <Circle cx={168} cy={161} r={3.5} fill={colors.accent.amber.fg} />
      </>
    )}
  </Svg>
);

// Full-screen error from the canvas: white Back button, illustration, title, text and two
// pill buttons. Targets follow the signed-in role (client home / provider schedule).
export default function ErrorScreen({ kind, onRetry }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useSessionStore((s) => s.user?.role);
  const logout = useLogout();

  const home = role === 'provider' ? '/(provider)/(tabs)/schedule' : '/(client)/(tabs)';
  const goHome = () => router.replace(role ? home : '/(auth)/login');
  const back = () => (router.canGoBack() ? router.back() : goHome());

  const primary =
    kind === 'failure'
      ? { label: t('errors.retry'), onPress: onRetry ?? goHome, icon: true }
      : kind === 'notFound' && role === 'client'
        ? {
            label: t('errors.findProviders'),
            onPress: () => router.replace('/(client)/(tabs)/map'),
            icon: false,
          }
        : { label: t('errors.goHome'), onPress: goHome, icon: false };
  const secondary =
    kind === 'forbidden'
      ? {
          label: t('errors.otherAccount'),
          onPress: () =>
            logout.mutate(undefined, { onSettled: () => router.replace('/(auth)/login') }),
        }
      : primary.label === t('errors.goHome')
        ? null
        : { label: t('errors.goHome'), onPress: goHome };

  return (
    <View className="flex-1 bg-ground">
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={back}
          className="items-center justify-center rounded-full bg-sheet active:opacity-80"
          style={{ width: 44, height: 44 }}
        >
          <Icon name="back" size={22} color={colors.ink} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: 28 }}>
        <Art kind={kind} />
        <Text
          weight={800}
          className="text-center text-[26px] leading-[32px] text-ink"
          style={{ marginTop: 24 }}
        >
          {t(`errors.${kind}.title`)}
        </Text>
        <Text
          weight={600}
          className="text-center text-[16px] leading-[24px] text-inkSoft"
          style={{ marginTop: 10 }}
        >
          {t(`errors.${kind}.text`)}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 32), gap: 10 }}>
        <Pressable
          accessibilityRole="button"
          onPress={primary.onPress}
          className="flex-row items-center justify-center rounded-pill bg-primary active:bg-primary-pressed"
          style={{ height: 56, gap: 8 }}
        >
          {primary.icon ? (
            <Icon name="refresh" size={18} color={colors.sheet} strokeWidth={2.6} />
          ) : null}
          <Text weight={800} className="text-[17px] text-sheet">
            {primary.label}
          </Text>
        </Pressable>
        {secondary ? (
          <Pressable
            accessibilityRole="button"
            onPress={secondary.onPress}
            className="items-center justify-center rounded-pill bg-sheet active:bg-primary-soft"
            style={{ height: 56, borderWidth: 2, borderColor: colors.hairline }}
          >
            <Text weight={800} className="text-[17px] text-primary-pressed">
              {secondary.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
