import type { Metadata } from 'next';
import ResultsView from '@/components/results/ResultsView';

export const metadata: Metadata = {
  title: 'Results – FIFA World Cup 2026 Predictions',
  description: 'See how participants predicted the FIFA World Cup 2026.',
};

export default function ResultsPage() {
  return <ResultsView />;
}
