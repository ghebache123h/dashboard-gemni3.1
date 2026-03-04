export function Card({
    title,
    value,
    description,
    valueColor = "text-slate-900"
}: {
    title: string;
    value: string | number;
    description?: string;
    valueColor?: string;
}) {
    return (
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
                <div className={`mt-2 text-3xl font-bold ${valueColor}`}>{value}</div>
            </div>
            {description && <p className="text-sm text-slate-500 mt-4">{description}</p>}
        </div>
    );
}
