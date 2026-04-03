import { ChevronLeft, Mail, MessageCircle, Book, FileText } from 'lucide-react';

export function SupportScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 -ml-2 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        <h1>Help & Support</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-sm mx-auto space-y-6">
          <div>
            <h3 className="mb-4 text-sm text-muted-foreground">GET HELP</h3>
            <div className="space-y-3">
              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#3A3A3A' }}
                  >
                    <Book size={18} style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1">FAQ</p>
                    <p className="text-sm text-muted-foreground">Frequently asked questions</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>

              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#3A3A3A' }}
                  >
                    <MessageCircle size={18} style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Chat with our support team</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>

              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#3A3A3A' }}
                  >
                    <Mail size={18} style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@gathr.app</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-sm text-muted-foreground">ABOUT</h3>
            <div className="space-y-3">
              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#3A3A3A' }}
                  >
                    <FileText size={18} style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1">Terms of Service</p>
                    <p className="text-sm text-muted-foreground">Read our terms</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>

              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#3A3A3A' }}
                  >
                    <FileText size={18} style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1">Privacy Policy</p>
                    <p className="text-sm text-muted-foreground">How we protect your data</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>

              <div
                className="w-full py-4 rounded-xl border px-4"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
