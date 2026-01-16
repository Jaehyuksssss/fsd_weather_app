import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <span className="text-sm font-semibold">FSD Weather</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
