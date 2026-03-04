import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

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
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'var(--text-highlight)',
                            margin: 0,
                            letterSpacing: '-0.02em',
                        }}>
                            Escalation Monitor
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Track conversations handed off to human support
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="badge-danger" style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: 600 }}>
                            {escalatedEvents.length} escalation{escalatedEvents.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </header>

            {/* Table */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                {escalatedEvents.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Conversation</th>
                                <th>Status</th>
                                <th>Intent</th>
                                <th>Last Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {escalatedEvents.map((event, idx) => {
                                const firstMsg = event.conversation.messages.find(m => m.role === 'user');
                                return (
                                    <tr key={event.id} className="animate-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>
                                                    {format(new Date(event.createdAt), 'MMM d, yyyy')}
                                                </span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                                    {format(new Date(event.createdAt), 'HH:mm:ss')}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <code style={{
                                                fontSize: '12px',
                                                fontFamily: 'var(--font-mono)',
                                                background: 'var(--bg-surface)',
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                color: 'var(--accent-blue)',
                                                border: '1px solid var(--border-color)',
                                            }}>
                                                ...{event.conversationId.slice(-8)}
                                            </code>
                                        </td>
                                        <td>
                                            <span className="badge badge-danger">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
                                                Escalated
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-purple" style={{ padding: '4px 10px' }}>
                                                {event.conversation.intent || 'Unknown'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{
                                                maxWidth: '300px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: '13px',
                                                color: 'var(--text-secondary)',
                                            }}>
                                                {firstMsg ? firstMsg.content : (
                                                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No message recorded</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <line x1="17" y1="11" x2="23" y2="11" />
                        </svg>
                        <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)' }}>No escalations yet</div>
                        <div style={{ fontSize: '13px', marginTop: '6px' }}>
                            Conversations requiring human support will appear here
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
