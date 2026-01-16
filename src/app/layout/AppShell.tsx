import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#3B465C] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:3px_3px]"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}
