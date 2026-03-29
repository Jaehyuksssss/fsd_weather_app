import { Link, useLocation } from "react-router-dom";

function useQuery() {
  const loc = useLocation();
  return new URLSearchParams(loc.search);
}

export function QrViewPage() {
  const q = useQuery();

  const dept = q.get("dept")?.trim() ?? "";
  const name = q.get("name")?.trim() ?? "";
  const code = q.get("code")?.trim() ?? "";

  const hasAny = dept.length > 0 || name.length > 0 || code.length > 0;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto w-full max-w-xl px-5 py-12">
        <header className="space-y-2">
          <div className="text-2xl font-semibold tracking-tight">
            QR 정보 확인
          </div>
          <div className="text-sm text-slate-600">
            QR을 통해 전달된 정보를 표시합니다.
          </div>
        </header>

        <main className="mt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            {!hasAny ? (
              <div className="space-y-3">
                <div className="text-sm text-slate-700">
                  표시할 정보가 없습니다.
                </div>
                <div className="text-xs text-slate-500">
                  올바른 QR로 접속했는지 확인해 주세요.
                </div>
              </div>
            ) : (
              <dl className="grid gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <dt className="text-sm font-medium text-slate-600">학과</dt>
                  <dd className="col-span-2 text-sm text-slate-900">
                    {dept || "-"}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <dt className="text-sm font-medium text-slate-600">이름</dt>
                  <dd className="col-span-2 text-sm text-slate-900">
                    {name || "-"}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <dt className="text-sm font-medium text-slate-600">
                    2차원 바코드
                  </dt>
                  <dd className="col-span-2 text-sm text-slate-900">
                    {code || "-"}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link className="text-slate-700 underline" to="/qr/create">
              QR 다시 만들기
            </Link>
            <Link className="text-slate-700 underline" to="/">
              메인으로
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

