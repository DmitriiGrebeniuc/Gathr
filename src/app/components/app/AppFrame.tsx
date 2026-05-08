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
        data-mobile-viewport={isMobileViewport ? 'true' : 'false'}
        className={`relative overflow-hidden flex flex-col h-full w-full min-w-0 max-w-full md:min-h-0 md:max-h-[844px] md:max-w-[390px] md:rounded-[2.5rem]${
          centerContent ? ' items-center justify-center' : ''
        }`}
        style={{
          height: 'var(--app-height, 100dvh)',
          backgroundColor: 'var(--background)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
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
