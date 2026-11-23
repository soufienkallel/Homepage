import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function AdminRouteGuard() {
  const location = useLocation();
  const isAdmin = useStore((state) => state.isAdmin);
  const authReady = useStore((state) => state.authReady);
  const initializeAuth = useStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!authReady) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-label="Vérification de la session"
      >
        <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
        <span className="sr-only">Vérification de la session...</span>
      </div>
    );
  }

  if (!isAdmin) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(next)}`} replace />;
  }

  return <Outlet />;
}
