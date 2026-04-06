/**
 * CosmicSelf App Icon — SVG Reference Component
 *
 * A cosmic orb with radiating star points in indigo/teal/gold.
 * Use this as a visual reference for generating raster icon assets.
 */
import React from 'react';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Path,
  G,
} from 'react-native-svg';

interface IconProps {
  size?: number;
}

export default function CosmicSelfIcon({ size = 1024 }: IconProps) {
  const c = size / 2; // center
  const r = size * 0.32; // orb radius

  // Four-pointed star path centered at (cx, cy)
  const star = (cx: number, cy: number, outer: number, inner: number) => {
    return [
      `M ${cx} ${cy - outer}`,
      `Q ${cx + inner * 0.4} ${cy - inner * 0.4} ${cx + outer} ${cy}`,
      `Q ${cx + inner * 0.4} ${cy + inner * 0.4} ${cx} ${cy + outer}`,
      `Q ${cx - inner * 0.4} ${cy + inner * 0.4} ${cx - outer} ${cy}`,
      `Q ${cx - inner * 0.4} ${cy - inner * 0.4} ${cx} ${cy - outer}`,
      'Z',
    ].join(' ');
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        {/* Background gradient */}
        <RadialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <Stop offset="0%" stopColor="#1a1a4e" />
          <Stop offset="60%" stopColor="#0e0e2a" />
          <Stop offset="100%" stopColor="#0a0a2e" />
        </RadialGradient>

        {/* Orb gradient — indigo core to teal edge */}
        <RadialGradient id="orbGrad" cx="40%" cy="38%" r="55%">
          <Stop offset="0%" stopColor="#A89EFF" />
          <Stop offset="40%" stopColor="#7C6DFF" />
          <Stop offset="75%" stopColor="#00E5D1" />
          <Stop offset="100%" stopColor="#007A72" />
        </RadialGradient>

        {/* Inner glow */}
        <RadialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFD700" stopOpacity={0.6} />
          <Stop offset="50%" stopColor="#7C6DFF" stopOpacity={0.2} />
          <Stop offset="100%" stopColor="#7C6DFF" stopOpacity={0} />
        </RadialGradient>

        {/* Star gradient */}
        <LinearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#E5B800" />
        </LinearGradient>
      </Defs>

      {/* Background circle (rounded icon shape) */}
      <Circle cx={c} cy={c} r={c} fill="url(#bgGrad)" />

      {/* Outer glow ring */}
      <Circle
        cx={c}
        cy={c}
        r={r * 1.5}
        fill="url(#glowGrad)"
        opacity={0.5}
      />

      {/* Four-pointed star behind the orb */}
      <Path
        d={star(c, c, r * 1.6, r * 0.35)}
        fill="url(#starGrad)"
        opacity={0.35}
      />

      {/* Secondary smaller rotated star */}
      <G rotation={45} origin={`${c}, ${c}`}>
        <Path
          d={star(c, c, r * 1.2, r * 0.25)}
          fill="url(#starGrad)"
          opacity={0.2}
        />
      </G>

      {/* Main orb */}
      <Circle cx={c} cy={c} r={r} fill="url(#orbGrad)" />

      {/* Specular highlight on orb */}
      <Circle
        cx={c - r * 0.2}
        cy={c - r * 0.25}
        r={r * 0.45}
        fill="white"
        opacity={0.15}
      />

      {/* Tiny gold accent dot at center */}
      <Circle cx={c} cy={c} r={r * 0.12} fill="#FFD700" opacity={0.8} />
    </Svg>
  );
}
