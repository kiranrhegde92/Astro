import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { BORDER_RADIUS, COLORS, FONTS } from '../../constants/theme';
import type { PlanetPosition, WesternSign } from '../../types/astrology';
import type { AspectType } from '../../engines/common/aspects';

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

const LUMINARIES = new Set(['Sun', 'Moon']);
const SKIP_NODES = new Set(['NorthNode', 'SouthNode']);

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

type CrossAspect = {
  userPlanet: string;
  partnerPlanet: string;
  type: AspectType;
  orb: number;
  userLon: number;
  partnerLon: number;
};

const ASPECT_DEFS: { type: AspectType; angle: number; maxOrb: number; maxOrbLuminary: number }[] = [
  { type: 'conjunction', angle: 0,   maxOrb: 8,  maxOrbLuminary: 10 },
  { type: 'sextile',     angle: 60,  maxOrb: 5,  maxOrbLuminary: 6  },
  { type: 'square',      angle: 90,  maxOrb: 7,  maxOrbLuminary: 8  },
  { type: 'trine',       angle: 120, maxOrb: 8,  maxOrbLuminary: 9  },
  { type: 'opposition',  angle: 180, maxOrb: 8,  maxOrbLuminary: 10 },
];

function angularSeparation(lon1: number, lon2: number) {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function calculateCrossAspects(
  userPlanets: PlanetPosition[],
  partnerPlanets: PlanetPosition[],
  limit = 12,
): CrossAspect[] {
  const aspects: CrossAspect[] = [];
  for (const up of userPlanets) {
    if (SKIP_NODES.has(up.planet)) continue;
    for (const pp of partnerPlanets) {
      if (SKIP_NODES.has(pp.planet)) continue;
      const uLon = planetLongitude(up);
      const pLon = planetLongitude(pp);
      const sep = angularSeparation(uLon, pLon);
      for (const def of ASPECT_DEFS) {
        const isLum = LUMINARIES.has(up.planet) || LUMINARIES.has(pp.planet);
        const maxOrb = isLum ? def.maxOrbLuminary : def.maxOrb;
        const orb = Math.abs(sep - def.angle);
        if (orb <= maxOrb) {
          aspects.push({ userPlanet: up.planet, partnerPlanet: pp.planet, type: def.type, orb, userLon: uLon, partnerLon: pLon });
          break;
        }
      }
    }
  }
  aspects.sort((a, b) => a.orb - b.orb);
  return aspects.slice(0, limit);
}

function getAspectColor(type: AspectType) {
  switch (type) {
    case 'trine':
    case 'sextile': return COLORS.tide;
    case 'square':
    case 'opposition': return COLORS.coral;
    default: return COLORS.gold;
  }
}

interface SynastryWheelProps {
  userPlanets: PlanetPosition[];
  partnerPlanets: PlanetPosition[];
  userName?: string;
  partnerName?: string;
  size?: number;
}

export function SynastryWheel({
  userPlanets,
  partnerPlanets,
  userName = 'You',
  partnerName = 'Partner',
  size = 300,
}: SynastryWheelProps) {
  const center = size / 2;

  // Ring radii
  const zodiacOuter = size * 0.47;
  const zodiacInner = size * 0.38;
  const userRing     = size * 0.30;   // user planets at inner ring
  const crossCenter  = size * 0.22;   // cross-aspect lines drawn at this radius
  const partnerRing  = size * 0.455;  // partner planets on outer ring edge

  const crossAspects = useMemo(
    () => calculateCrossAspects(userPlanets, partnerPlanets),
    [userPlanets, partnerPlanets],
  );

  return (
    <View style={[styles.wrap, { width: size }]}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.western }]} />
          <Text style={styles.legendText}>{userName}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.coral }]} />
          <Text style={styles.legendText}>{partnerName}</Text>
        </View>
      </View>

      <Svg width={size} height={size}>
        {/* Zodiac band */}
        <Circle cx={center} cy={center} r={zodiacOuter} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        <Circle cx={center} cy={center} r={zodiacInner} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={1} />

        {/* Inner disc */}
        <Circle cx={center} cy={center} r={userRing} fill="rgba(20,24,40,0.30)" stroke="rgba(255,255,255,0.09)" strokeWidth={1} />

        {/* Zodiac sign labels */}
        {ZODIAC.map((sign, index) => {
          const startAngle = index * 30;
          const boundary = polar(center, zodiacOuter, startAngle);
          const labelPoint = polar(center, (zodiacOuter + zodiacInner) / 2, startAngle + 15);
          return (
            <G key={sign}>
              <Line
                x1={boundary.x} y1={boundary.y}
                x2={polar(center, zodiacInner, startAngle).x}
                y2={polar(center, zodiacInner, startAngle).y}
                stroke="rgba(255,255,255,0.07)" strokeWidth={1}
              />
              <SvgText
                x={labelPoint.x} y={labelPoint.y}
                fill={SIGN_COLORS[index]}
                fontSize={size * 0.032}
                fontFamily={FONTS.accent}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {SIGN_ABBREVIATIONS[sign]}
              </SvgText>
            </G>
          );
        })}

        {/* Cross-chart aspect lines */}
        {crossAspects.map((asp, i) => {
          const uPt = polar(center, crossCenter, asp.userLon);
          const pPt = polar(center, partnerRing - size * 0.05, asp.partnerLon);
          return (
            <Line
              key={`cross-${asp.userPlanet}-${asp.partnerPlanet}-${i}`}
              x1={uPt.x} y1={uPt.y}
              x2={pPt.x} y2={pPt.y}
              stroke={getAspectColor(asp.type)}
              strokeOpacity={0.45}
              strokeWidth={asp.type === 'conjunction' ? 1.6 : 1.0}
            />
          );
        })}

        {/* User planets (inner ring, blue) */}
        {userPlanets.map((planet) => {
          const lon = planetLongitude(planet);
          const pt  = polar(center, userRing - size * 0.04, lon);
          return (
            <G key={`u-${planet.planet}`}>
              <Circle cx={pt.x} cy={pt.y} r={size * 0.044} fill={`${COLORS.western}cc`} stroke="rgba(255,255,255,0.20)" strokeWidth={1} />
              <SvgText
                x={pt.x} y={pt.y - 1}
                fill="#fff"
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

        {/* Partner planets (outer ring edge, coral) */}
        {partnerPlanets.map((planet) => {
          const lon = planetLongitude(planet);
          const pt  = polar(center, partnerRing - size * 0.04, lon);
          return (
            <G key={`p-${planet.planet}`}>
              <Circle cx={pt.x} cy={pt.y} r={size * 0.044} fill={`${COLORS.coral}cc`} stroke="rgba(255,255,255,0.20)" strokeWidth={1} />
              <SvgText
                x={pt.x} y={pt.y - 1}
                fill="#fff"
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

      <View style={styles.aspectLegend}>
        <View style={styles.aspectItem}>
          <View style={[styles.aspectLine, { backgroundColor: COLORS.tide }]} />
          <Text style={styles.aspectText}>Harmony</Text>
        </View>
        <View style={styles.aspectItem}>
          <View style={[styles.aspectLine, { backgroundColor: COLORS.gold }]} />
          <Text style={styles.aspectText}>Merge</Text>
        </View>
        <View style={styles.aspectItem}>
          <View style={[styles.aspectLine, { backgroundColor: COLORS.coral }]} />
          <Text style={styles.aspectText}>Tension</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.lg,
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    color: 'rgba(255,250,241,0.70)',
    fontSize: 12,
    fontFamily: FONTS.accent,
  },
  aspectLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  aspectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aspectLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
    opacity: 0.7,
  },
  aspectText: {
    color: 'rgba(255,250,241,0.55)',
    fontSize: 11,
    fontFamily: FONTS.accent,
  },
});
