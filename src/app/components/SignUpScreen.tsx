import { motion } from 'motion/react';
import { TouchButton } from './TouchButton';
import { SwipeableScreen } from './SwipeableScreen';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export function SignUpScreen({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { translate } = useLanguage();

  const handleSignUp = async () => {
    if (!name.trim()) {
      alert(translate('signup.enterName'));
      return;
    }

    if (!email.trim()) {
      alert(translate('signup.enterEmail'));
      return;
    }

    if (!password.trim()) {
      alert(translate('signup.enterPassword'));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Ошибка регистрации:', error);
        alert(error.message || translate('signup.failed'));
        setLoading(false);
        return;
      }

      const userId = data.user?.id;

      if (!userId) {
        alert(translate('signup.userIdMissing'));
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          name: name.trim(),
        },
      ]);

      if (profileError) {
        console.error('Ошибка создания профиля:', profileError);
        alert(translate('signup.profileNotSaved'));
        setLoading(false);
        return;
      }

      alert(translate('signup.success'));
      onNavigate('home');
    } catch (error) {
      console.error('Unexpected signup error:', error);
      alert(translate('signup.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SwipeableScreen onSwipeBack={() => onNavigate('welcome')}>
      <div className="h-full flex flex-col px-6 py-8 bg-background">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('welcome')}
          className="self-start text-muted-foreground mb-8"
          disabled={loading}
        >
          ← {translate('signup.back')}
        </motion.button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {translate('signup.title')}
          </motion.h2>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('signup.name')}
              </label>
              <input
                type="text"
                placeholder={translate('signup.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: '#1A1A1A' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('signup.email')}
              </label>
              <input
                type="email"
                placeholder={translate('signup.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: '#1A1A1A' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('signup.password')}
              </label>
              <input
                type="password"
                placeholder={translate('signup.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: '#1A1A1A' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <TouchButton
                onClick={handleSignUp}
                variant="primary"
                fullWidth
                className="mt-6"
              >
                {loading ? translate('signup.submitting') : translate('signup.submit')}
              </TouchButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-sm text-muted-foreground mt-4"
            >
              {translate('signup.haveAccount')}{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-accent"
                style={{ color: '#D4AF37' }}
                disabled={loading}
              >
                {translate('signup.loginLink')}
              </button>
            </motion.p>
          </div>
        </div>
      </div>
    </SwipeableScreen>
  );
}