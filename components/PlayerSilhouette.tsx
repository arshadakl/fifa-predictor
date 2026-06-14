export default function PlayerSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="50" cy="34" r="20" />
      <path d="M50 58c-24 0-40 13-40 32v6h80v-6c0-19-16-32-40-32z" />
    </svg>
  );
}
