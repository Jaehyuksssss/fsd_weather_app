import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

const BARCODE_TYPE_OPTIONS = ["QR Code", "Data Matrix", "PDF417"] as const;

function getDefaultBaseUrl(): string {
  // 배포용 기본값 + 로컬에서도 바로 확인 가능하도록 origin fallback
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://app.figmaboy.org";
  return origin.includes("localhost") ? origin : "https://app.figmaboy.org";
}

function normalizeBaseUrl(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  const noTrailing = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(noTrailing)) return noTrailing;
  if (/^\/\//.test(noTrailing)) return `https:${noTrailing}`;

  // 스킴이 없으면 대부분 스캐너가 "검색어"로 처리할 수 있어서 https://를 붙인다.
  return `https://${noTrailing}`;
}

export function QrCreatePage() {
  const fallbackBaseUrl = useMemo(() => getDefaultBaseUrl(), []);
  const [baseUrl, setBaseUrl] = useState<string>(() => fallbackBaseUrl);
  const [department, setDepartment] = useState("");
  const [name, setName] = useState("");
  const [barcodeType, setBarcodeType] =
    useState<(typeof BARCODE_TYPE_OPTIONS)[number]>("QR Code");

  const viewUrl = useMemo(() => {
    const b = normalizeBaseUrl(baseUrl, fallbackBaseUrl);
    const params = new URLSearchParams();
    params.set("dept", department.trim());
    params.set("name", name.trim());
    params.set("code", barcodeType);
    params.set("v", "1");
    return `${b}/qr/view?${params.toString()}`;
  }, [barcodeType, baseUrl, department, fallbackBaseUrl, name]);

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setError("");

    QRCode.toDataURL(viewUrl, {
      margin: 1,
      scale: 10,
      errorCorrectionLevel: "M",
    })
      .then((url: string) => {
        if (cancelled) return;
        setQrDataUrl(url);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      });

    return () => {
      cancelled = true;
    };
  }, [viewUrl]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto w-full max-w-2xl px-5 py-10">
        <header className="space-y-2">
          <div className="text-2xl font-semibold tracking-tight">
            과제용 QR 만들기
          </div>
          <div className="text-sm text-slate-600">
            QR을 스캔하면 <span className="font-medium">/qr/view</span> 페이지로
            이동해서 정보를 보여줍니다.
          </div>
        </header>

        <main className="mt-8 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 text-sm font-semibold text-slate-900">입력</div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="mb-1 text-xs font-medium text-slate-700">
                  학과
                </div>
                <input
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="예) 컴퓨터공학과"
                />
              </label>

              <label className="block">
                <div className="mb-1 text-xs font-medium text-slate-700">
                  이름
                </div>
                <input
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예) 홍길동"
                />
              </label>

              <label className="block sm:col-span-2">
                <div className="mb-1 text-xs font-medium text-slate-700">
                  2차원 바코드 명칭(선택)
                </div>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  value={barcodeType}
                  onChange={(e) =>
                    setBarcodeType(
                      e.target.value as (typeof BARCODE_TYPE_OPTIONS)[number]
                    )
                  }
                >
                  {BARCODE_TYPE_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <div className="mb-1 text-xs font-medium text-slate-700">
                  Base URL (배포 주소)
                </div>
                <input
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  onBlur={() =>
                    setBaseUrl((prev) => normalizeBaseUrl(prev, fallbackBaseUrl))
                  }
                  placeholder="예) https://app.figmaboy.org"
                />
                <div className="mt-1 text-xs text-slate-500">
                  `https://`가 포함된 주소를 권장합니다. 스킴이 없으면 일부 기기에서
                  검색으로 열릴 수 있어요.
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 text-sm font-semibold text-slate-900">
              생성된 URL (QR에 들어가는 값)
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                className="break-all text-sm text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                href={viewUrl}
                target="_blank"
                rel="noreferrer"
              >
                {viewUrl}
              </a>
              <div className="shrink-0">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium hover:bg-slate-50"
                  onClick={() => navigator.clipboard.writeText(viewUrl)}
                >
                  URL 복사
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 text-sm font-semibold text-slate-900">
              QR 미리보기
            </div>

            {error ? (
              <div className="text-sm text-rose-700">생성 실패: {error}</div>
            ) : qrDataUrl ? (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <img
                    alt="Generated QR"
                    src={qrDataUrl}
                    className="h-60 w-60"
                  />
                </div>
                <div className="w-full space-y-2">
                  <a
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium hover:bg-slate-50"
                    href={qrDataUrl}
                    download="assignment_qr.png"
                  >
                    이미지 다운로드
                  </a>
                  <div className="text-xs text-slate-600">
                    유저는 QR을 스캔하면 이 앱의{" "}
                    <span className="font-medium">/qr/view</span>로 이동해 입력한
                    정보를 확인하게 됩니다.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-700">QR 생성 중...</div>
            )}
          </section>
        </main>

        <footer className="mt-10 text-xs text-slate-500">
          이 페이지는 과제용으로 앱 디자인과 분리된 “깨끗한” 페이지입니다.
        </footer>
      </div>
    </div>
  );
}

