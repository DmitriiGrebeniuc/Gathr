import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function AdminScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { translate } = useLanguage();

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 -ml-2 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        <h1>{translate('admin.title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(212, 175, 55, 0.28)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <h3 className="mb-2">{translate('admin.enabledTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {translate('admin.enabledDescription')}
            </p>
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <h3 className="mb-2">{translate('admin.comingSoonTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {translate('admin.comingSoonDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
