import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90 [background-image:radial-gradient(900px_circle_at_20%_10%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(800px_circle_at_80%_35%,rgba(168,85,247,0.12),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(2,6,23,1))]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:3px_3px]"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}
