export type AkashaEvent =
  | 'akasha_question_asked'
  | 'akasha_answer_received'
  | 'akasha_rate_limited'
  | 'akasha_limit_upsell_tapped'
  | 'akasha_prompt_chip_tapped'
  | 'akasha_past_reading_opened';

export function logAkashaEvent(name: AkashaEvent, params?: Record<string, unknown>): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, params ?? {});
  }
}
