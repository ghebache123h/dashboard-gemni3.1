import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export default async function CrmPage() {
    const escalatedEvents = await prisma.event.findMany({
        where: { eventType: 'ESCALATION' },
        include: {
            conversation: {
                include: {
                    messages: {
                        take: 3,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">CRM / Escalation Dashboard</h1>
                        <p className="text-slate-500 mt-1">Monitor users who required human support</p>
                    </div>
                    <div className="flex gap-4">
                        <a href="/" className="bg-white border rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-50 shadow-sm transition">
                            Back to Dashboard
                        </a>
                    </div>
                </header>

                <section className="bg-white rounded-xl border p-6 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Conversation ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Intent</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Recent Msg Preview</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {escalatedEvents.map((event) => {
                                const firstMsg = event.conversation.messages.find(m => m.role === 'user');
                                return (
                                    <tr key={event.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {format(new Date(event.createdAt), 'MMM d, yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            ...{event.conversationId.slice(-8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {event.conversation.intent || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                            {firstMsg ? firstMsg.content : 'No user message recorded'}
                                        </td>
                                    </tr>
                                )
                            })}

                            {escalatedEvents.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                                        No escalations recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </div>
        </main>
    );
}
