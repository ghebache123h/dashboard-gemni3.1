import prisma from '@/lib/prisma';
import { KpiCard } from './components/Card';
import { DashboardCharts } from './components/DashboardCharts';
import { CostSection } from './components/CostSection';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [
    totalConversations,
    totalMessages,
    otpSuccessCount,
    otpFailedCount,
    otpRequestCount,
    escalationCount,
    settings,
    tokensData,
    recentMessages,
    recentEvents,
  ] = await Promise.all([
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.event.count({ where: { eventType: 'OTP_SUCCESS' } }),
    prisma.event.count({ where: { eventType: 'OTP_FAILED' } }),
    prisma.event.count({ where: { eventType: 'OTP_REQUEST' } }),
    prisma.event.count({ where: { eventType: 'ESCALATION' } }),
    prisma.settings.findFirst(),
    prisma.message.aggregate({
      _sum: { inputTokens: true, outputTokens: true }
    }),
    // Get recent messages grouped by day for chart
    prisma.message.findMany({
      select: { createdAt: true, role: true, inputTokens: true, outputTokens: true },
      orderBy: { createdAt: 'asc' },
      take: 500,
    }),
    // Get recent events for chart
    prisma.event.findMany({
      select: { createdAt: true, eventType: true },
      orderBy: { createdAt: 'asc' },
      take: 500,
    }),
  ]);

  const inputTokens = tokensData._sum.inputTokens || 0;
  const outputTokens = tokensData._sum.outputTokens || 0;
  const inPricePerM = settings?.inputTokenPrice || 0.50;
  const outPricePerM = settings?.outputTokenPrice || 1.50;
  const inputCost = (inputTokens / 1_000_000) * inPricePerM;
  const outputCost = (outputTokens / 1_000_000) * outPricePerM;
  const totalCost = inputCost + outputCost;

  // Prepare chart data by grouping messages by day
  const msgByDay: Record<string, { user: number; ai: number; inTok: number; outTok: number }> = {};
  for (const msg of recentMessages) {
    const day = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!msgByDay[day]) msgByDay[day] = { user: 0, ai: 0, inTok: 0, outTok: 0 };
    if (msg.role === 'user') msgByDay[day].user++;
    if (msg.role === 'ai') msgByDay[day].ai++;
    msgByDay[day].inTok += msg.inputTokens;
    msgByDay[day].outTok += msg.outputTokens;
  }
  const messageTrendData = Object.entries(msgByDay).map(([name, d]) => ({
    name, user: d.user, ai: d.ai,
  }));
  const tokenTrendData = Object.entries(msgByDay).map(([name, d]) => ({
    name, input: d.inTok, output: d.outTok,
  }));

  // Event data grouped by day
  const evtByDay: Record<string, { otp_req: number; otp_ok: number; otp_fail: number; esc: number }> = {};
  for (const evt of recentEvents) {
    const day = new Date(evt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!evtByDay[day]) evtByDay[day] = { otp_req: 0, otp_ok: 0, otp_fail: 0, esc: 0 };
    if (evt.eventType === 'OTP_REQUEST') evtByDay[day].otp_req++;
    if (evt.eventType === 'OTP_SUCCESS') evtByDay[day].otp_ok++;
    if (evt.eventType === 'OTP_FAILED') evtByDay[day].otp_fail++;
    if (evt.eventType === 'ESCALATION') evtByDay[day].esc++;
  }
  const otpTrendData = Object.entries(evtByDay).map(([name, d]) => ({
    name, Requested: d.otp_req, Success: d.otp_ok, Failed: d.otp_fail,
  }));
  const escalationTrendData = Object.entries(evtByDay).map(([name, d]) => ({
    name, value: d.esc,
  }));

  // Donut data
  const otpDonutData = [
    { name: 'Success', value: otpSuccessCount, color: '#10b981' },
    { name: 'Failed', value: otpFailedCount, color: '#f43f5e' },
    { name: 'Pending', value: Math.max(0, otpRequestCount - otpSuccessCount - otpFailedCount), color: '#f59e0b' },
  ];

  // Cost by day
  const costTrendData = Object.entries(msgByDay).map(([name, d]) => ({
    name,
    value: parseFloat((((d.inTok / 1_000_000) * inPricePerM) + ((d.outTok / 1_000_000) * outPricePerM)).toFixed(4)),
  }));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-highlight)',
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Dashboard Overview
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Real-time analytics for your WhatsApp AI support agent
        </p>
      </header>

      {/* KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div className="animate-in animate-delay-1">
          <KpiCard
            title="Conversations"
            value={totalConversations.toLocaleString()}
            subtitle="Total sessions tracked"
            accentColor="blue"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            }
          />
        </div>
        <div className="animate-in animate-delay-2">
          <KpiCard
            title="Messages"
            value={totalMessages.toLocaleString()}
            subtitle="Inbound + Outbound"
            accentColor="purple"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            }
          />
        </div>
        <div className="animate-in animate-delay-3">
          <KpiCard
            title="OTP Success"
            value={otpSuccessCount.toLocaleString()}
            subtitle={`${otpFailedCount} failed`}
            accentColor="emerald"
            trend={otpRequestCount > 0 ? {
              value: `${Math.round((otpSuccessCount / otpRequestCount) * 100)}%`,
              positive: (otpSuccessCount / otpRequestCount) > 0.5,
            } : undefined}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            }
          />
        </div>
        <div className="animate-in animate-delay-4">
          <KpiCard
            title="Escalations"
            value={escalationCount.toLocaleString()}
            subtitle="Handed to human support"
            accentColor="rose"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            }
          />
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts
        messageTrendData={messageTrendData}
        tokenTrendData={tokenTrendData}
        otpTrendData={otpTrendData}
        otpDonutData={otpDonutData}
        escalationTrendData={escalationTrendData}
        costTrendData={costTrendData}
      />

      {/* Cost Section */}
      <CostSection
        inputTokens={inputTokens}
        outputTokens={outputTokens}
        inputCost={inputCost}
        outputCost={outputCost}
        totalCost={totalCost}
        inPricePerM={inPricePerM}
        outPricePerM={outPricePerM}
      />
    </div>
  );
}
