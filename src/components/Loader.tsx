export default function Loader({ label = "Please wait" }: { label?: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-[10px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 opacity-20 blur-[1px]" />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500 [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500 [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
}