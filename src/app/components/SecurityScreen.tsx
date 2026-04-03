import { ChevronLeft } from 'lucide-react';

export function SecurityScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 -ml-2 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        <h1>Privacy & Security</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-sm mx-auto space-y-6">
          <div>
            <h3 className="mb-4 text-sm text-muted-foreground">ACCOUNT SECURITY</h3>
            <div className="space-y-3">
              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="mb-1">Change Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 2 months ago</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>

              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="mb-1">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Not enabled</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>

              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="mb-1">Active Sessions</p>
                    <p className="text-sm text-muted-foreground">Manage logged in devices</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-sm text-muted-foreground">PRIVACY</h3>
            <div className="space-y-3">
              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="mb-1">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Public</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>

              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="mb-1">Blocked Users</p>
                    <p className="text-sm text-muted-foreground">Manage blocked accounts</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>

              <button
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1A1A1A' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="mb-1">Data & Privacy</p>
                    <p className="text-sm text-muted-foreground">Download or delete your data</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>
            </div>
          </div>

          <button
            className="w-full py-4 rounded-xl border transition-all mt-8"
            style={{ borderColor: 'rgba(212, 47, 61, 0.5)', color: '#d4183d' }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
