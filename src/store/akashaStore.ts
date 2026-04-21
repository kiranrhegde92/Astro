import { create } from 'zustand';

export type AkashaFlowStatus = 'idle' | 'asking' | 'answered' | 'error' | 'rateLimited';

export interface AkashaReading {
  id: string;
  question: string;
  answer: string;
  locale: string;
  createdAt: number;
}

interface AkashaStoreState {
  status: AkashaFlowStatus;
  currentQuestion: string;
  currentAnswer: string | null;
  currentReadingId: string | null;
  errorMessage: string | null;
  nextAvailableAt: number | null;
  remaining: number | null;
  pastReadings: AkashaReading[];
  expandedReadingId: string | null;

  setAsking: (question: string) => void;
  setAnswered: (p: { readingId: string; answer: string; remaining: number }) => void;
  setError: (message: string) => void;
  setRateLimited: (nextAvailableAt: number) => void;
  resetToIdle: () => void;

  loadPastReadings: (readings: AkashaReading[]) => void;
  prependReading: (r: AkashaReading) => void;
  expandReading: (id: string | null) => void;
}

export const useAkashaStore = create<AkashaStoreState>((set) => ({
  status: 'idle',
  currentQuestion: '',
  currentAnswer: null,
  currentReadingId: null,
  errorMessage: null,
  nextAvailableAt: null,
  remaining: null,
  pastReadings: [],
  expandedReadingId: null,

  setAsking: (question) =>
    set({ status: 'asking', currentQuestion: question, currentAnswer: null, errorMessage: null }),
  setAnswered: ({ readingId, answer, remaining }) =>
    set({
      status: 'answered',
      currentAnswer: answer,
      currentReadingId: readingId,
      remaining,
      errorMessage: null,
    }),
  setError: (message) => set({ status: 'error', errorMessage: message }),
  setRateLimited: (nextAvailableAt) =>
    set({ status: 'rateLimited', nextAvailableAt, errorMessage: null }),
  resetToIdle: () =>
    set({
      status: 'idle',
      currentQuestion: '',
      currentAnswer: null,
      currentReadingId: null,
      errorMessage: null,
    }),

  loadPastReadings: (readings) => set({ pastReadings: readings }),
  prependReading: (r) => set((s) => ({ pastReadings: [r, ...s.pastReadings] })),
  expandReading: (id) => set({ expandedReadingId: id }),
}));
