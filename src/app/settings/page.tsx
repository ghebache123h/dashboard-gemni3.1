import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const settings = await prisma.settings.findFirst() || { inputTokenPrice: 0.50, outputTokenPrice: 1.50 };

    async function updateSettings(formData: FormData) {
        'use server';
        const inPrice = parseFloat(formData.get('inPrice') as string);
        const outPrice = parseFloat(formData.get('outPrice') as string);

        await prisma.settings.upsert({
            where: { id: 'default' },
            update: { inputTokenPrice: inPrice, outputTokenPrice: outPrice },
            create: { id: 'default', inputTokenPrice: inPrice, outputTokenPrice: outPrice }
        });

        revalidatePath('/');
        revalidatePath('/settings');
        redirect('/');
    }

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--text-highlight)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                }}>
                    Settings
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Configure pricing and dashboard preferences
                </p>
            </header>

            {/* Pricing Card */}
            <div className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'var(--accent-amber-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-amber)',
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-highlight)', margin: 0 }}>
                            LLM Token Pricing
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            Set cost per 1 million tokens for accurate spend tracking
                        </p>
                    </div>
                </div>

                <form action={updateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Input Token Price */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: 'var(--text-muted)',
                                marginBottom: '8px',
                            }}>
                                Input Token Price (per 1M)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--accent-cyan)',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}>$</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    name="inPrice"
                                    defaultValue={settings.inputTokenPrice}
                                    required
                                    className="input-dark"
                                    style={{ paddingLeft: '32px' }}
                                    placeholder="0.50"
                                />
                            </div>
                        </div>

                        {/* Output Token Price */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: 'var(--text-muted)',
                                marginBottom: '8px',
                            }}>
                                Output Token Price (per 1M)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--accent-purple)',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}>$</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    name="outPrice"
                                    defaultValue={settings.outputTokenPrice}
                                    required
                                    className="input-dark"
                                    style={{ paddingLeft: '32px' }}
                                    placeholder="1.50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            These prices are used to calculate the estimated LLM cost displayed on the dashboard.
                            For Gemini 2.0 Flash, typical pricing is $0.10/M input and $0.40/M output.
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                        </svg>
                        Save Settings
                    </button>
                </form>
            </div>
        </div>
    );
}
