import { FormEvent, useState } from 'react';
import { authenticate } from '../../application/auth/AuthUseCases';
import { AuthMode } from '../../domain/auth/Account';

interface AuthPageProps {
  onAuthenticated: (nickname: string) => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authStatus, setAuthStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearForm = () => {
    setNickname('');
    setEmail('');
    setPassword('');
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await authenticate(authMode, { nickname, email, password });
    setAuthStatus(result.message);
    setIsSubmitting(false);

    if (!result.success || !result.account) {
      return;
    }

    onAuthenticated(result.account.nickname);
    clearForm();
  };

  const handleQuickStart = () => {
    setAuthStatus('Mode test active. Acces direct au catalogue.');
    clearForm();
    onAuthenticated('Invite');
  };

  return (
    <main className="auth-page">
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <section className="auth-card">
        <p className="eyebrow">Salon local</p>
        <h1>Jeux de cartes</h1>
        <p className="auth-intro">
          Entre dans l&apos;application pour lancer une partie rapide de Bataille ou preparer les prochains jeux du catalogue.
        </p>

        <div className="auth-feature-list" aria-hidden="true">
          <span>Partie locale immediate</span>
          <span>Reprise automatique de session</span>
          <span>Format mobile et desktop</span>
        </div>

        <div className="auth-switch">
          <button
            type="button"
            className={authMode === 'signin' ? 'active' : ''}
            onClick={() => setAuthMode('signin')}
          >
            Connexion
          </button>
          <button
            type="button"
            className={authMode === 'signup' ? 'active' : ''}
            onClick={() => setAuthMode('signup')}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {authMode === 'signup' ? (
            <label htmlFor="nickname">
              Pseudo
              <input
                id="nickname"
                type="text"
                placeholder="Ton pseudo"
                autoComplete="nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
              />
            </label>
          ) : null}

          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              placeholder="nom@mail.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label htmlFor="password">
            Mot de passe
            <input
              id="password"
              type="password"
              placeholder="******"
              autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button type="submit" className="submit-btn">
            {isSubmitting ? 'Verification...' : authMode === 'signin' ? 'Se connecter' : 'Creer un compte'}
          </button>
        </form>

        <button type="button" className="secondary-btn auth-quickstart" onClick={handleQuickStart}>
          Tester Bataille sans compte
        </button>

        {authStatus ? <p className="status">{authStatus}</p> : null}
      </section>
    </main>
  );
}
