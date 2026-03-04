import prisma from '@/lib/prisma';
import { Card } from './components/Card';

export default async function DashboardPage() {
  const [
    totalConversations,
    totalMessages,
    otpSuccessCount,
    otpFailedCount,
    escalationCount,
    settings,
    tokensData
  ] = await Promise.all([
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.event.count({ where: { eventType: 'OTP_SUCCESS' } }),
    prisma.event.count({ where: { eventType: 'OTP_FAILED' } }),
    prisma.event.count({ where: { eventType: 'ESCALATION' } }),
    prisma.settings.findFirst(),
    prisma.message.aggregate({
      _sum: { inputTokens: true, outputTokens: true }
    })
  ]);

  const inputTokens = tokensData._sum.inputTokens || 0;
  const outputTokens = tokensData._sum.outputTokens || 0;

  const inPricePerM = settings?.inputTokenPrice || 0.50;
  const outPricePerM = settings?.outputTokenPrice || 1.50;

  const inputCost = (inputTokens / 1_000_000) * inPricePerM;
  const outputCost = (outputTokens / 1_000_000) * outPricePerM;
  const totalCost = inputCost + outputCost;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Support Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1">Real-time tracking for WhatsApp AI Agent</p>
          </div>
          <div className="flex gap-4">
            <a href="/crm" className="bg-white border rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-50 shadow-sm transition">
              View CRM / Escalations
            </a>
            <a href="/settings" className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800 shadow-sm transition">
              Settings
            </a>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="Total Conversations"
            value={totalConversations.toLocaleString()}
            description="All inbound sessions"
          />
          <Card
            title="Total Messages"
            value={totalMessages.toLocaleString()}
            description="Inbound + Outbound"
          />
          <Card
            title="OTP Success"
            value={otpSuccessCount.toLocaleString()}
            description="Delivered & Verified"
            valueColor="text-emerald-600"
          />
          <Card
            title="Escalations"
            value={escalationCount.toLocaleString()}
            description="Handed to Human Support"
            valueColor="text-rose-600"
          />
        </section>

        <section className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Cost & Token Usage (LLM)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Input Tokens</p>
              <div className="mt-2 text-3xl font-semibold">{inputTokens.toLocaleString()}</div>
              <p className="text-sm text-slate-500 mt-1">${inputCost.toFixed(4)} total cost</p>
            </div>
            <div className="border-l pl-8">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Output Tokens</p>
              <div className="mt-2 text-3xl font-semibold">{outputTokens.toLocaleString()}</div>
              <p className="text-sm text-slate-500 mt-1">${outputCost.toFixed(4)} total cost</p>
            </div>
            <div className="border-l pl-8">
              <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Estimated Total LLM Cost</p>
              <div className="mt-2 text-4xl font-bold text-slate-900">${totalCost.toFixed(4)}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
