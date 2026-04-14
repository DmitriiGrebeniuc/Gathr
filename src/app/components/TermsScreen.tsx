import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { TERMS_OF_SERVICE } from '../constants/legalDocuments';
import { useLanguage } from '../context/LanguageContext';

export function TermsScreen({
  onNavigate,
  backTarget = 'signup',
}: {
  onNavigate: (screen: string, data?: any, customDirection?: 'forward' | 'back' | 'up' | 'down') => void;
  backTarget?: string;
}) {
  const { translate } = useLanguage();

  return (
    <SwipeableScreen onSwipeBack={() => onNavigate(backTarget, undefined, 'back')}>
      <div className="h-full flex flex-col bg-background">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(backTarget, undefined, 'back')}
            className="p-2 -ml-2 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <h1>{translate('legal.termsTitle')}</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-sm mx-auto space-y-4">
            <div
              className="rounded-xl border p-5"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                {translate('legal.lastUpdated')}: {TERMS_OF_SERVICE.lastUpdated}
              </p>

              <div className="space-y-3">
                {TERMS_OF_SERVICE.intro.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-6 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {TERMS_OF_SERVICE.sections.map((section) => (
              <section
                key={section.heading}
                className="rounded-xl border p-5"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                }}
              >
                <h3 className="mb-3">{section.heading}</h3>

                <div className="space-y-3">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-sm leading-6 text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </SwipeableScreen>
  );
}
