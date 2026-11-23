import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import logoSvg from '../assets/mallouliauto_logo.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getSafeRedirectPath = () => {
    const redirect = searchParams.get('redirect');

    if (!redirect) {
      return '/admin';
    }

    const isSafePath = redirect.startsWith('/admin') || redirect.startsWith('/guides');
    return isSafePath ? redirect : '/admin';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        setError('Identifiants invalides. Vérifiez vos informations de connexion.');
        return;
      }

      navigate(getSafeRedirectPath(), { replace: true });
    } catch {
      setError('Une erreur est survenue pendant la connexion. Réessayez dans quelques instants.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0c1b29] text-white">
      <SEO
        title="Connexion"
        description="Connexion sécurisée à MALLOULIAUTO."
        path="/login"
        noIndex
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(254,119,67,0.1),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(68,125,155,0.2),_transparent_30%),linear-gradient(135deg,_#091624_0%,_#17344a_50%,_#102639_100%)]" />
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#193246]/92 shadow-[0_24px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl lg:grid-cols-[0.96fr_1.04fr]">
          <div className="relative border-b border-white/8 px-5 py-8 sm:px-7 sm:py-9 lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
            <div className="mb-8 flex items-center gap-3">
              <img src={logoSvg} alt="MALLOULIAUTO" className="h-5.5 w-auto" />
            </div>

            <div className="max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-brand-orange/90">
                Connexion
              </p>
              <h1 className="mt-5 text-[2.7rem] font-semibold tracking-tight text-white sm:text-[2.85rem] leading-[1.02]">
                Se connecter à MALLOULIAUTO
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/66">
                Connectez-vous pour accéder à votre espace MALLOULIAUTO en toute sécurité.
              </p>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/68">
                Accès réservé aux comptes autorisés.
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center px-4 py-8 sm:px-7 lg:px-8 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(68,125,155,0.16),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(254,119,67,0.1),transparent_28%)]" />
            <div className="relative w-full max-w-[20.5rem] rounded-[1.5rem] border border-white/12 bg-[#21394f]/96 p-5.5 shadow-[0_20px_50px_rgba(0,0,0,0.26)]">
              <div className="mb-5.5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-brand-orange/90">
                  Connexion
                </p>
                <h2 className="mt-3 text-[1.55rem] font-semibold tracking-tight text-white sm:text-[1.7rem]">
                  Se connecter
                </h2>
                <p className="mt-2.5 text-xs leading-5.5 text-white/66">
                  Utilisez vos identifiants pour vous connecter.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/90">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@mallouliauto.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-brand-orange/60 focus:bg-white/12 focus:ring-2 focus:ring-brand-orange/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/90">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-brand-orange/60 focus:bg-white/12 focus:ring-2 focus:ring-brand-orange/20"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-brand-orange px-5 py-2.75 text-sm font-semibold text-white shadow-lg shadow-brand-orange/24 transition hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white/65">
                Interface alignée sur l&apos;univers visuel MALLOULIAUTO.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
