import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";

import { Card, SectionTitle } from "../../shared/ui";

const BARCODE_TYPE_OPTIONS = [
  "QR Code",
  "Data Matrix",
  "PDF417",
] as const;

export function QrPage() {
  const [department, setDepartment] = useState("");
  const [name, setName] = useState("");
  const [barcodeType, setBarcodeType] =
    useState<(typeof BARCODE_TYPE_OPTIONS)[number]>("QR Code");

  const payload = useMemo(() => {
    return [
      `학과: ${department.trim() || "-"}`,
      `이름: ${name.trim() || "-"}`,
      `2차원 바코드(선택): ${barcodeType}`,
    ].join("\n");
  }, [barcodeType, department, name]);

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setError("");

    QRCode.toDataURL(payload, {
      margin: 1,
      scale: 8,
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
  }, [payload]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold tracking-tight">QR 만들기</div>
        <Link className="text-sm text-white/70 hover:text-white" to="/">
          ← 홈으로
        </Link>
      </div>

      <section className="space-y-3">
        <SectionTitle title="입력" subtitle="스캔 시 아래 내용이 그대로 표시돼요" />
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <div className="mb-1 text-xs font-medium text-white/70">학과</div>
              <input
                className="h-10 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="예) 컴퓨터공학과"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-medium text-white/70">이름</div>
              <input
                className="h-10 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 홍길동"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-medium text-white/70">
                2차원 바코드 명칭(선택)
              </div>
              <select
                className="h-10 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
                value={barcodeType}
                onChange={(e) =>
                  setBarcodeType(
                    e.target.value as (typeof BARCODE_TYPE_OPTIONS)[number]
                  )
                }
              >
                {BARCODE_TYPE_OPTIONS.map((v) => (
                  <option key={v} value={v} className="text-slate-900">
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="mb-1 text-xs font-medium text-white/70">
              QR Payload (스캔 결과)
            </div>
            <pre className="whitespace-pre-wrap break-words text-sm text-white/90">
              {payload}
            </pre>
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionTitle title="QR 미리보기" subtitle="스마트폰 카메라로 스캔해 확인" />
        <Card className="p-4">
          {error ? (
            <div className="text-sm text-white/80">생성 실패: {error}</div>
          ) : qrDataUrl ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="rounded-xl bg-white p-3">
                <img
                  alt="Generated QR"
                  src={qrDataUrl}
                  className="h-56 w-56"
                />
              </div>
              <div className="w-full space-y-2">
                <a
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15"
                  href={qrDataUrl}
                  download="assignment_qr.png"
                >
                  이미지 다운로드
                </a>
                <button
                  type="button"
                  className="ml-2 inline-flex h-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15"
                  onClick={() => navigator.clipboard.writeText(payload)}
                >
                  내용 복사
                </button>
                <div className="text-xs text-white/60">
                  과제 요구사항처럼 “평가 시점에 내용 확인”이 가능하도록, QR에는 입력한
                  텍스트를 그대로 넣었습니다.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-white/80">QR 생성 중...</div>
          )}
        </Card>
      </section>
    </div>
  );
}

