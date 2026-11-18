import { View } from 'react-native';

import { colors } from '@/theme';
import type { ProviderCard } from '@/types';
import { offsetKm } from '@/utils/geo';

const HEIGHT = 250;
const BASE_WIDTH = 390;
const CENTER_Y = 112;
const PX_PER_KM = 25;

type Props = {
  width: number;
  radiusKm: number;
  center: { lat: number; lng: number };
  providers: ProviderCard[];
};

// Drawn map from the canvas: roads, two parks, the dashed search radius, a pin per provider
// and the user's dot. Pins sit at their real bearing and distance (25 px per km). A live map
// needs a native map module (docs/BACKLOG.md).
export default function MapMock({ width, radiusKm, center, providers }: Props) {
  const k = width / BASE_WIDTH;
  const cx = width / 2;
  const d = radiusKm * 2 * PX_PER_KM;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: HEIGHT, backgroundColor: colors.map.ground, overflow: 'hidden' }}
    >
      <View
        style={{
          position: 'absolute',
          left: -20,
          top: 70,
          width: width + 50,
          height: 14,
          backgroundColor: colors.map.road,
          transform: [{ rotate: '-8deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: -20,
          top: 168,
          width: width + 50,
          height: 10,
          backgroundColor: colors.map.road,
          transform: [{ rotate: '4deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 120 * k,
          top: -20,
          width: 12,
          height: 300,
          backgroundColor: colors.map.road,
          transform: [{ rotate: '12deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 286 * k,
          top: -20,
          width: 9,
          height: 300,
          backgroundColor: colors.map.road,
          transform: [{ rotate: '-6deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 22 * k,
          top: 96,
          width: 84,
          height: 58,
          borderRadius: 14,
          backgroundColor: colors.map.park,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 306 * k,
          top: 188,
          width: 70,
          height: 50,
          borderRadius: 14,
          backgroundColor: colors.map.park,
        }}
      />

      <View
        style={{
          position: 'absolute',
          left: cx - d / 2,
          top: CENTER_Y - d / 2,
          width: d,
          height: d,
          borderRadius: d / 2,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: colors.primary.DEFAULT,
          backgroundColor: 'rgba(98, 71, 232, 0.10)',
        }}
      />

      {providers.map((p) => {
        const o = offsetKm(center.lat, center.lng, p.lat, p.lng);
        return (
          <View
            key={p.id}
            style={{
              position: 'absolute',
              left: cx + o.east * PX_PER_KM - 16,
              top: CENTER_Y - o.north * PX_PER_KM - 32,
              width: 32,
              height: 32,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 4,
              transform: [{ rotate: '-45deg' }],
              backgroundColor: colors.primary.DEFAULT,
              borderWidth: 3,
              borderColor: colors.sheet,
              shadowColor: colors.primary.deep,
              shadowOpacity: 0.25,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          />
        );
      })}

      <View
        className="items-center justify-center rounded-full"
        style={{
          position: 'absolute',
          left: cx - 18,
          top: CENTER_Y - 18,
          width: 36,
          height: 36,
          backgroundColor: 'rgba(31, 79, 168, 0.18)',
        }}
      >
        <View
          className="rounded-full"
          style={{
            width: 20,
            height: 20,
            backgroundColor: colors.accent.sky.fg,
            borderWidth: 4,
            borderColor: colors.sheet,
          }}
        />
      </View>
    </View>
  );
}
