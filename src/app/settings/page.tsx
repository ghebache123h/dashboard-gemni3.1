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
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                    <a href="/" className="text-slate-500 hover:text-slate-900 transition">Back to Dashboard</a>
                </header>

                <section className="bg-white rounded-xl border p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">LLM Pricing Configuration</h2>
                    <form action={updateSettings} className="space-y-6">
                        <div>
                            <label htmlFor="inPrice" className="block text-sm font-medium text-slate-700">Input Tokens (Price per 1M)</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.001"
                                    name="inPrice"
                                    id="inPrice"
                                    defaultValue={settings.inputTokenPrice}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-slate-300 rounded-md py-2 border"
                                    placeholder="0.50"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="outPrice" className="block text-sm font-medium text-slate-700">Output Tokens (Price per 1M)</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.001"
                                    name="outPrice"
                                    id="outPrice"
                                    defaultValue={settings.outputTokenPrice}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-slate-300 rounded-md py-2 border"
                                    placeholder="1.50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Save Settings
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
