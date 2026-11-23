import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi as api } from '../../lib/adminApi';

type ChatMessage = {
  role: string;
  content: string;
};

type ChatSession = {
  session_id: string;
  created_at: string;
  detected_segment: string | null;
  message_count: number;
  messages: ChatMessage[];
};

type ChatStats = {
  totalConversations: number;
  todayConversations: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
  todayCostUsd: number;
  avgDurationMs: number;
  topSegments: Record<string, number>;
  recentSessions: ChatSession[];
};

const ZERO_STATS: ChatStats = {
  totalConversations: 0,
  todayConversations: 0,
  totalTokensIn: 0,
  totalTokensOut: 0,
  totalCostUsd: 0,
  todayCostUsd: 0,
  avgDurationMs: 0,
  topSegments: {},
  recentSessions: [],
};

const SEGMENT_LABELS: Record<string, string> = {
  insurance: 'Assurance',
  garage: 'Garage',
  fleet: 'Flotte',
  dealer: 'Concessionnaire',
  b2c: 'Particulier',
};

const SEGMENT_DOT_CLASS: Record<string, string> = {
  insurance: 'bg-brand-blue',
  garage: 'bg-brand-orange',
  fleet: 'bg-brand-navy',
  dealer: 'bg-emerald-500',
  b2c: 'bg-brand-blue',
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('fr-TN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <article className="rounded-card border border-brand-gray bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${tone}`} />
        <p className="text-xs text-brand-navy/65">{label}</p>
      </div>
      <p className="text-2xl font-bold text-brand-navy">{value}</p>
    </article>
  );
}

export default function HomepageAdminChatbotAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ChatStats>(ZERO_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const sortedSegments = useMemo(
    () =>
      Object.entries(stats.topSegments || {}).sort(
        ([, leftCount], [, rightCount]) => rightCount - leftCount
      ),
    [stats.topSegments]
  );

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api('/api/agents/chatbot/stats');
      setStats({ ...ZERO_STATS, ...data });
    } catch (err) {
      setError((err as Error).message);
      setStats(ZERO_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-gray bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-gray text-brand-navy transition hover:bg-brand-gray/25"
            aria-label="Retour"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-brand-navy">Analytique chatbot</h1>
            <p className="text-sm text-brand-navy/70">
              Suivi des conversations, coûts, segments et sessions récentes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue/90"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </header>

      {error ? (
        <div className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement: {error}. Les données affichées peuvent être incomplètes.
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-card border border-brand-gray bg-white p-10 shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-blue/20 border-t-brand-blue" />
          <p className="mt-3 text-center text-sm text-brand-navy/70">
            Chargement des statistiques...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={MessageSquare}
              label="Conversations totales"
              value={stats.totalConversations}
              tone="text-brand-blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Conversations aujourd'hui"
              value={stats.todayConversations}
              tone="text-brand-orange"
            />
            <StatCard
              icon={DollarSign}
              label="Coût total (USD)"
              value={`$${stats.totalCostUsd.toFixed(2)}`}
              tone="text-emerald-600"
            />
            <StatCard
              icon={DollarSign}
              label="Coût aujourd'hui (USD)"
              value={`$${stats.todayCostUsd.toFixed(2)}`}
              tone="text-emerald-600"
            />
            <StatCard
              icon={Zap}
              label="Tokens entrée"
              value={stats.totalTokensIn.toLocaleString()}
              tone="text-brand-blue"
            />
            <StatCard
              icon={Zap}
              label="Tokens sortie"
              value={stats.totalTokensOut.toLocaleString()}
              tone="text-brand-orange"
            />
            <StatCard
              icon={Clock}
              label="Durée moyenne (ms)"
              value={Math.round(stats.avgDurationMs)}
              tone="text-brand-navy"
            />
            <StatCard
              icon={Users}
              label="Sessions récentes"
              value={stats.recentSessions.length}
              tone="text-brand-blue"
            />
          </div>

          <article className="rounded-card border border-brand-gray bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-blue" />
              <h2 className="text-base font-semibold text-brand-navy">Segments détectés</h2>
            </div>

            {sortedSegments.length === 0 ? (
              <p className="text-sm text-brand-navy/65">Aucune conversation enregistrée.</p>
            ) : (
              <ul className="space-y-2">
                {sortedSegments.map(([segment, count]) => (
                  <li
                    key={segment}
                    className="flex items-center justify-between rounded-lg bg-brand-gray/20 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${SEGMENT_DOT_CLASS[segment] || 'bg-brand-blue'}`}
                      />
                      <span className="text-sm text-brand-navy">
                        {SEGMENT_LABELS[segment] || segment}
                      </span>
                    </div>
                    <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-card border border-brand-gray bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-blue" />
              <h2 className="text-base font-semibold text-brand-navy">Sessions récentes</h2>
            </div>

            {stats.recentSessions.length === 0 ? (
              <p className="text-sm text-brand-navy/65">Aucune session enregistrée.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentSessions.map((session) => {
                  const isExpanded = expandedSession === session.session_id;
                  const segmentLabel =
                    session.detected_segment && SEGMENT_LABELS[session.detected_segment]
                      ? SEGMENT_LABELS[session.detected_segment]
                      : session.detected_segment || 'Non détecté';

                  return (
                    <div
                      key={session.session_id}
                      className="rounded-lg border border-brand-gray/80"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedSession(isExpanded ? null : session.session_id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-brand-gray/15"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-brand-navy">
                            Session {session.session_id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-brand-navy/65">
                            {formatDateTime(session.created_at)} • {segmentLabel} •{' '}
                            {session.message_count} messages
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-brand-navy/70" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-brand-navy/70" />
                        )}
                      </button>

                      {isExpanded ? (
                        <div className="space-y-2 border-t border-brand-gray/70 bg-gray-50 px-4 py-3">
                          {session.messages.length === 0 ? (
                            <p className="text-xs text-brand-navy/65">
                              Aucun message dans cette session.
                            </p>
                          ) : (
                            session.messages.map((message, index) => {
                              const isUser = message.role === 'user';

                              return (
                                <div
                                  key={`${session.session_id}-${index}`}
                                  className={`rounded-lg px-3 py-2 text-sm ${
                                    isUser
                                      ? 'border border-brand-blue/30 bg-brand-blue/10 text-brand-navy'
                                      : 'border border-brand-orange/30 bg-brand-orange/10 text-brand-navy'
                                  }`}
                                >
                                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                                    {isUser ? (
                                      <User className="h-3.5 w-3.5" />
                                    ) : (
                                      <Bot className="h-3.5 w-3.5" />
                                    )}
                                    {isUser ? 'Utilisateur' : 'Assistant'}
                                  </div>
                                  <p className="whitespace-pre-wrap break-words">
                                    {message.content}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
}
