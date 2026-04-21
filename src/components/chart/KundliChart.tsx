/**
 * KundliChart — South Indian style birth chart (Rashi Kundli).
 *
 * Draws a 4×4 grid where the outer 12 cells represent the 12 zodiac signs
 * in fixed positions. Planets are placed in their respective sign cells.
 * The Ascendant (Lagna) cell is marked with a diagonal line.
 *
 * Used in both Vedic and KP reading screens.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { COLORS, FONTS } from '../../constants/theme';
import type { PlanetPosition, WesternSign } from '../../types/astrology';

/* ── Sign layout (South Indian chart, signs are FIXED) ─────────────── */
// Row, Col positions for each sign index (0=Aries .. 11=Pisces)
const SIGN_CELLS: [number, number][] = [
  [0, 1], // 0  Aries
  [0, 2], // 1  Taurus
  [0, 3], // 2  Gemini
  [1, 3], // 3  Cancer
  [2, 3], // 4  Leo
  [3, 3], // 5  Virgo
  [3, 2], // 6  Libra
  [3, 1], // 7  Scorpio
  [3, 0], // 8  Sagittarius
  [2, 0], // 9  Capricorn
  [1, 0], // 10 Aquarius
  [0, 0], // 11 Pisces
];

const SIGN_ABBR = [
  'Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi',
];
const RASHI_ABBR = [
  'Me','Vr','Mi','Ka','Si','Ka','Tu','Vs','Dh','Ma','Ku','Mn',
];

const SIGN_NAMES: WesternSign[] = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju',
  Venus: 'Ve', Saturn: 'Sa', Uranus: 'Ur', Neptune: 'Ne', Pluto: 'Pl',
  NorthNode: 'Ra', SouthNode: 'Ke',  // Rahu/Ketu in Vedic
};

interface KundliChartProps {
  planets: PlanetPosition[];
  ascendantSign?: WesternSign;
  /** 'vedic' uses Rashi abbreviations, 'western' uses sign abbreviations */
  style?: 'vedic' | 'western';
  size?: number;
  title?: string;
}

export function KundliChart({
  planets,
  ascendantSign,
  style = 'vedic',
  size = 280,
  title,
}: KundliChartProps) {
  const CELL = size / 4;
  const PAD = 2;

  // Group planets by sign index
  const planetsBySign: Record<number, string[]> = {};
  for (const p of planets) {
    const idx = SIGN_NAMES.indexOf(p.sign);
    if (idx === -1) continue;
    if (!planetsBySign[idx]) planetsBySign[idx] = [];
    const abbr = PLANET_ABBR[p.planet] ?? p.planet.slice(0, 2);
    const retro = p.retrograde ? '(R)' : '';
    planetsBySign[idx].push(`${abbr}${retro}`);
  }

  const ascIdx = ascendantSign ? SIGN_NAMES.indexOf(ascendantSign) : -1;
  const labels = style === 'vedic' ? RASHI_ABBR : SIGN_ABBR;

  const lineColor = 'rgba(36,40,74,0.22)';
  const cellBg = 'rgba(255,255,255,0.45)';
  const ascBg = 'rgba(130,120,220,0.10)';

  return (
    <View style={[chartStyles.wrap, { width: size }]}>
      {title && <Text style={chartStyles.title}>{title}</Text>}
      <Svg width={size} height={size}>
        {/* Background */}
        <Rect x={0} y={0} width={size} height={size} rx={8} fill="rgba(255,255,255,0.30)" />

        {/* Grid lines */}
        {[1,2,3].map(i => (
          <React.Fragment key={`grid${i}`}>
            <Line x1={i*CELL} y1={0} x2={i*CELL} y2={size} stroke={lineColor} strokeWidth={0.8} />
            <Line x1={0} y1={i*CELL} x2={size} y2={i*CELL} stroke={lineColor} strokeWidth={0.8} />
          </React.Fragment>
        ))}
        {/* Outer border */}
        <Rect x={0} y={0} width={size} height={size} rx={8} fill="none" stroke={lineColor} strokeWidth={1.2} />

        {/* Cells */}
        {SIGN_CELLS.map(([row, col], signIdx) => {
          const x = col * CELL;
          const y = row * CELL;
          const isAsc = signIdx === ascIdx;
          const planetsHere = planetsBySign[signIdx] ?? [];

          return (
            <React.Fragment key={signIdx}>
              {/* Ascendant highlight */}
              {isAsc && (
                <>
                  <Rect x={x+1} y={y+1} width={CELL-2} height={CELL-2} fill={ascBg} />
                  <Line x1={x+2} y1={y+2} x2={x+CELL*0.35} y2={y+CELL*0.35} stroke={COLORS.vedic} strokeWidth={1.2} />
                </>
              )}

              {/* Sign label (top-left corner) */}
              <SvgText
                x={x + 3}
                y={y + 11}
                fontSize={9}
                fontWeight="600"
                fill={isAsc ? COLORS.vedic : 'rgba(36,40,74,0.45)'}
              >
                {labels[signIdx]}
              </SvgText>

              {/* House number if ascendant is known */}
              {ascIdx >= 0 && (
                <SvgText
                  x={x + CELL - 3}
                  y={y + 11}
                  fontSize={7}
                  fill="rgba(36,40,74,0.25)"
                  textAnchor="end"
                >
                  {((signIdx - ascIdx + 12) % 12) + 1}
                </SvgText>
              )}

              {/* Planets in this cell */}
              {planetsHere.map((pText, pi) => {
                // Arrange up to 4 planets in 2 columns
                const px = x + 4 + (pi % 2) * (CELL / 2 - 2);
                const py = y + 22 + Math.floor(pi / 2) * 14;
                return (
                  <SvgText
                    key={pi}
                    x={px}
                    y={py}
                    fontSize={11}
                    fontWeight="700"
                    fill={pText.includes('(R)') ? COLORS.error : COLORS.textPrimary}
                  >
                    {pText}
                  </SvgText>
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Centre label */}
        <SvgText
          x={size / 2}
          y={size / 2 - 6}
          fontSize={11}
          fontWeight="700"
          fill="rgba(36,40,74,0.35)"
          textAnchor="middle"
        >
          {style === 'vedic' ? 'Rashi' : 'Birth'}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 8}
          fontSize={11}
          fontWeight="700"
          fill="rgba(36,40,74,0.35)"
          textAnchor="middle"
        >
          Kundli
        </SvgText>
      </Svg>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: FONTS.heading,
    marginBottom: 6,
    textAlign: 'center',
  },
});
