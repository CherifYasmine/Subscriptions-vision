export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Left: Logo + App name */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
            SV
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">SubVision</h1>
            <p className="text-xs text-slate-500">Local-first subscription tracker</p>
          </div>
        </div>

        {/* Right: could later hold settings / about / export */}
        <div className="flex items-center gap-3">
          {/* Placeholder button */}
          <button
            type="button"
            className="hidden md:inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </header>
  );
}
