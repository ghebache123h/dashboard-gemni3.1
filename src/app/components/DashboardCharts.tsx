'use client';

import { ChartCard, TrendAreaChart, GroupedBarChart, DonutChart } from './Charts';

interface DashboardChartsProps {
    messageTrendData: { name: string; user: number; ai: number }[];
    tokenTrendData: { name: string; input: number; output: number }[];
    otpTrendData: { name: string; Requested: number; Success: number; Failed: number }[];
    otpDonutData: { name: string; value: number; color: string }[];
    escalationTrendData: { name: string; value: number }[];
    costTrendData: { name: string; value: number }[];
}

export function DashboardCharts({
    messageTrendData,
    tokenTrendData,
    otpTrendData,
    otpDonutData,
    escalationTrendData,
    costTrendData,
}: DashboardChartsProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            {/* Row 1: Messages + OTP */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <ChartCard title="Message Volume" subtitle="User vs AI messages over time">
                    <GroupedBarChart
                        data={messageTrendData}
                        bars={[
                            { key: 'user', color: '#3b82f6', label: 'User' },
                            { key: 'ai', color: '#8b5cf6', label: 'AI' },
                        ]}
                    />
                </ChartCard>
                <ChartCard title="OTP Outcomes" subtitle="Request → Success / Failed breakdown">
                    <GroupedBarChart
                        data={otpTrendData}
                        bars={[
                            { key: 'Requested', color: '#f59e0b', label: 'Requested' },
                            { key: 'Success', color: '#10b981', label: 'Success' },
                            { key: 'Failed', color: '#f43f5e', label: 'Failed' },
                        ]}
                    />
                </ChartCard>
            </div>

            {/* Row 2: Token Usage + OTP Donut  */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <ChartCard title="Token Usage" subtitle="Input vs Output tokens consumed">
                    <GroupedBarChart
                        data={tokenTrendData}
                        bars={[
                            { key: 'input', color: '#06b6d4', label: 'Input Tokens' },
                            { key: 'output', color: '#8b5cf6', label: 'Output Tokens' },
                        ]}
                    />
                </ChartCard>
                <ChartCard title="OTP Distribution" subtitle="Overall success rate">
                    <DonutChart data={otpDonutData} />
                </ChartCard>
            </div>

            {/* Row 3: Cost Trend + Escalations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <ChartCard title="LLM Cost Trend" subtitle="Estimated daily spend ($)">
                    <TrendAreaChart data={costTrendData} color="#f59e0b" label="Cost ($)" />
                </ChartCard>
                <ChartCard title="Escalation Trend" subtitle="Human handoff events per day">
                    <TrendAreaChart data={escalationTrendData} color="#f43f5e" label="Escalations" />
                </ChartCard>
            </div>
        </div>
    );
}
