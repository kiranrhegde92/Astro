import type { ChartResult } from '../../services/functionsService';
import type { AkashaDigest } from '../../../functions/src/akasha/types';

export type { AkashaDigest } from '../../../functions/src/akasha/types';

export type AkashaChartInput = ChartResult['chart'];

export function buildAkashaDigest(chart: AkashaChartInput): AkashaDigest {
  return {
    vedic: buildVedicSection(chart),
    western: buildWesternSection(chart),
    kp: buildKpSection(chart),
    chinese: buildChineseSection(chart),
  };
}

function buildVedicSection(_chart: AkashaChartInput): AkashaDigest['vedic'] {
  throw new Error('not implemented');
}

function buildWesternSection(_chart: AkashaChartInput): AkashaDigest['western'] {
  throw new Error('not implemented');
}

function buildKpSection(_chart: AkashaChartInput): AkashaDigest['kp'] {
  throw new Error('not implemented');
}

function buildChineseSection(_chart: AkashaChartInput): AkashaDigest['chinese'] {
  throw new Error('not implemented');
}
