import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { calculateAspects } from '../../engines/common/aspects';
import type { Aspect } from '../../engines/common/aspects';
import { BORDER_RADIUS, COLORS, FONTS } from '../../constants/theme';
import type { PlanetPosition, WesternSign } from '../../types/astrology';

const ZODIAC: WesternSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_ABBREVIATIONS: Record<WesternSign, string> = {
  Aries: 'Ari', Taurus: 'Tau', Gemini: 'Gem', Cancer: 'Can', Leo: 'Leo', Virgo: 'Vir',
  Libra: 'Lib', Scorpio: 'Sco', Sagittarius: 'Sag', Capricorn: 'Cap', Aquarius: 'Aqu', Pisces: 'Pis',
};

const SIGN_COLORS = [
  COLORS.western, '#8d79ff', '#a06cff', '#ff8b73', '#ffb067', '#f0bf6c',
  '#d88cff', '#ff739e', '#ff936a', '#7d8ff7', '#5fc5e8', '#58cbb5',
];

const PLANET_LABELS: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mercury: 'Me', Venus: 'Ve', Mars: 'Ma', Jupiter: 'Ju', Saturn: 'Sa',
  Uranus: 'Ur', Neptune: 'Ne', Pluto: 'Pl', NorthNode: 'NN', SouthNode: 'SN',
};

function planetLongitude(position: PlanetPosition) {
  return ZODIAC.indexOf(position.sign) * 30 + position.degree;
}

function polar(center: number, radius: number, angleDegrees: number) {
  const radians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
}

function getAspectColor(aspect: Aspect['type']) {
  switch (aspect) {
    case 'trine':
    case 'sextile':
      return COLORS.tide;
    case 'square':
    case 'opposition':
      return COLORS.coral;
    default:
      return COLORS.gold;
  }
}

export function NatalWheel({
  planets,
  size = 280,
  title,
  showAspects = true,
}: {
  planets: PlanetPosition[];
  size?: number;
  title?: string;
  showAspects?: boolean;
}) {
  const center = size / 2;
  const outerRadius = size * 0.46;
  const innerRadius = size * 0.29;
  const planetRadius = size * 0.37;

  const aspects = useMemo(() => calculateAspects(planets).slice(0, 10), [planets]);
  const longitudes = useMemo(
    () => Object.fromEntries(planets.map((planet) => [planet.planet, planetLongitude(planet)])),
    [planets]
  );

  return (
    <View style={[styles.wrap, { width: size }]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={outerRadius} fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
        <Circle cx={center} cy={center} r={innerRadius} fill="rgba(20,24,40,0.26)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

        {ZODIAC.map((sign, index) => {
          const start = index * 30;
          const boundary = polar(center, outerRadius, start);
          const labelPoint = polar(center, outerRadius - size * 0.065, start + 15);
          return (
            <G key={sign}>
              <Line x1={center} y1={center} x2={boundary.x} y2={boundary.y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <SvgText
                x={labelPoint.x}
                y={labelPoint.y}
                fill={SIGN_COLORS[index]}
                fontSize={size * 0.038}
                fontFamily={FONTS.accent}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {SIGN_ABBREVIATIONS[sign]}
              </SvgText>
            </G>
          );
        })}

        {showAspects
          ? aspects.map((aspect, index) => {
              const p1 = polar(center, innerRadius - 4, longitudes[aspect.planet1]);
              const p2 = polar(center, innerRadius - 4, longitudes[aspect.planet2]);
              return (
                <Line
                  key={`${aspect.planet1}-${aspect.planet2}-${index}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={getAspectColor(aspect.type)}
                  strokeOpacity={0.55}
                  strokeWidth={aspect.type === 'conjunction' ? 1.6 : 1.1}
                />
              );
            })
          : null}

        {planets.map((planet) => {
          const point = polar(center, planetRadius, planetLongitude(planet));
          return (
            <G key={`${planet.planet}-${planet.sign}-${planet.degree}`}>
              <Circle cx={point.x} cy={point.y} r={size * 0.045} fill="rgba(23,24,45,0.88)" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
              <SvgText
                x={point.x}
                y={point.y - 1}
                fill="#fffaf1"
                fontSize={size * 0.028}
                fontFamily={FONTS.heading}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {PLANET_LABELS[planet.planet] ?? planet.planet.slice(0, 2)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.lg,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: FONTS.accent,
    marginBottom: 8,
    letterSpacing: 0.9,
  },
});
