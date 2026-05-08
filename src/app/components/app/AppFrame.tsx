import type { ReactNode } from 'react';
import { LoadingLogo } from '../LoadingLogo';

type AppFrameProps = {
  children: ReactNode;
  isMobileViewport: boolean;
  centerContent?: boolean;
};

type AppLoadingFrameProps = {
  isMobileViewport: boolean;
  loadingLabel: string;
};

export function AppFrame({
  children,
  isMobileViewport,
  centerContent = false,
}: AppFrameProps) {
  return (
    <div
      className="w-full flex items-start justify-start md:items-center md:justify-center bg-secondary overflow-hidden"
      style={{ minHeight: 'var(--app-height, 100dvh)', height: 'var(--app-height, 100dvh)' }}
    >
      <div
        className={`relative overflow-hidden flex flex-col w-full h-full md:min-h-0 md:w-auto${
          centerContent ? ' items-center justify-center' : ''
        }`}
        style={{
          width: '100%',
          height: 'var(--app-height, 100dvh)',
          maxWidth: isMobileViewport ? '100%' : '390px',
          maxHeight: isMobileViewport ? 'none' : '844px',
          backgroundColor: 'var(--background)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          borderRadius: isMobileViewport ? '0' : '2.5rem',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function AppLoadingFrame({ isMobileViewport, loadingLabel }: AppLoadingFrameProps) {
  return (
    <AppFrame isMobileViewport={isMobileViewport} centerContent>
      <LoadingLogo label={loadingLabel} />
    </AppFrame>
  );
}
