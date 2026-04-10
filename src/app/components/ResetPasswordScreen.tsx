import { motion } from 'motion/react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TouchButton } from './TouchButton';
import { SwipeableScreen } from './SwipeableScreen';
import { useLanguage } from '../context/LanguageContext';
import { feedback } from '../lib/feedback';

export function ResetPasswordScreen({
    onNavigate,
}: {
    onNavigate: (screen: string, data?: any) => void;
}) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { translate } = useLanguage();

    const handleResetPassword = async () => {
        if (!password.trim()) {
            feedback.warning(translate('resetPassword.enterPassword'));
            return;
        }

        if (!confirmPassword.trim()) {
            feedback.warning(translate('resetPassword.enterConfirmPassword'));
            return;
        }

        if (password.trim().length < 6) {
            feedback.warning(translate('resetPassword.passwordTooShort'));
            return;
        }

        if (password !== confirmPassword) {
            feedback.warning(translate('resetPassword.passwordsDoNotMatch'));
            return;
        }

        setLoading(true);

        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Ошибка получения recovery session:', sessionError);
                feedback.error(sessionError.message || translate('resetPassword.restoreSessionFailed'));
                return;
            }

            if (!session) {
                feedback.error(translate('resetPassword.recoverySessionMissing'));
                return;
            }

            const { error } = await supabase.auth.updateUser({
                password: password.trim(),
            });

            if (error) {
                console.error('Ошибка сброса пароля:', error);
                feedback.error(error.message || translate('resetPassword.failed'));
                return;
            }

            await supabase.auth.signOut();

            feedback.success(translate('resetPassword.success'));
            onNavigate('login', { clearPostLoginIntent: true });
        } catch (error) {
            console.error('Unexpected reset password error:', error);
            feedback.error(translate('resetPassword.unexpectedError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SwipeableScreen onSwipeBack={() => onNavigate('login', { clearPostLoginIntent: true })}>
            <div className="h-full flex flex-col px-6 py-8 bg-background">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('login', { clearPostLoginIntent: true })}
                    className="self-start text-muted-foreground mb-8"
                    disabled={loading}
                >
                    ← {translate('resetPassword.back')}
                </motion.button>

                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-3"
                    >
                        {translate('resetPassword.title')}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-sm text-muted-foreground mb-8"
                    >
                        {translate('resetPassword.description')}
                    </motion.p>

                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block mb-2 text-sm text-muted-foreground">
                                {translate('resetPassword.newPassword')}
                            </label>
                            <input
                                type="password"
                                placeholder={translate('resetPassword.newPasswordPlaceholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                                style={{ backgroundColor: '#1A1A1A' }}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block mb-2 text-sm text-muted-foreground">
                                {translate('resetPassword.confirmPassword')}
                            </label>
                            <input
                                type="password"
                                placeholder={translate('resetPassword.confirmPasswordPlaceholder')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                                style={{ backgroundColor: '#1A1A1A' }}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <TouchButton
                                onClick={handleResetPassword}
                                variant="primary"
                                fullWidth
                                className="mt-6"
                            >
                                {loading
                                    ? translate('resetPassword.submitting')
                                    : translate('resetPassword.submit')}
                            </TouchButton>
                        </motion.div>
                    </div>
                </div>
            </div>
        </SwipeableScreen>
    );
}
