type LoadingLineProps = {
  width?: string;
  height?: string;
  className?: string;
};

export function LoadingLine({
  width = '100%',
  height = '0.875rem',
  className = '',
}: LoadingLineProps) {
  return (
    <div
      className={`animate-pulse rounded-full ${className}`}
      style={{
        width,
        height,
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function LoadingCard({
  lines = ['70%', '100%', '82%'],
  className = '',
}: {
  lines?: string[];
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 space-y-3 ${className}`}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {lines.map((width, index) => (
        <LoadingLine
          key={`${width}-${index}`}
          width={width}
          height={index === 0 ? '1rem' : '0.875rem'}
        />
      ))}
    </div>
  );
}

export function LoadingAvatarStrip({ count = 4 }: { count?: number }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-10 w-10 animate-pulse rounded-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );
}
