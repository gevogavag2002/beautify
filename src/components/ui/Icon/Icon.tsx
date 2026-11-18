import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { icons, type IconName } from './icons';

type Props = {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
  /** Solid shape (rating stars): fills with `color` and drops the stroke. */
  filled?: boolean;
  style?: object;
};

export default function Icon({ name, size = 24, color, strokeWidth = 2, filled, style }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={filled ? 'none' : color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {icons[name].map((s, i) => {
        if (s.t === 'path') return <Path key={i} d={s.d} />;
        if (s.t === 'circle') return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} />;
        return <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />;
      })}
    </Svg>
  );
}
