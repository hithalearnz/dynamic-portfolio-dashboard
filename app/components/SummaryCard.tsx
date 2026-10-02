type SummaryCardProps = {
  title: string;
  value: string;
};

function SummaryCard({
  title,
  value,
}: SummaryCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl transition duration-300 group-hover:bg-blue-500/20" />

      <div className="relative">
        <p className="text-sm font-medium text-slate-400">
          {title}
        </p>

        <p className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {value}
        </p>
      </div>
    </div>
  );
}

export default SummaryCard;