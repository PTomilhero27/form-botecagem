"use client";

import type { VendorLookupResponse, VendorStatus } from "@/types/vendor";
import { STATUS_UI } from "@/types/vendor";

export function ConfirmVendorModal({
  open,
  onClose,
  result,
  onContinue,
}: {
  open: boolean;
  onClose: () => void;
  result: VendorLookupResponse | null;
  onContinue: (vendorId: string) => void;
}) {
  if (!open) return null;

  const ok = result && result.ok;

  const vendorId = ok ? result.vendor.vendor_id : "";
  const status: VendorStatus = ok ? result.vendor.status : "selecionado";
  const canContinue = ok ? result.canContinue : false;

  const ui = ok ? STATUS_UI[status] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar modal"
      />

      <div className="relative z-10 w-[92vw] max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Confirmação</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Confira os dados antes de continuar.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {!result && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
              Carregando...
            </div>
          )}

          {result && !ok && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {result.error}
            </div>
          )}

          {ok && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs font-semibold text-zinc-600">Documento</div>
              <div className="mt-1 text-base font-semibold text-zinc-900">
                {vendorId}
              </div>

              <div className="mt-4 text-xs font-semibold text-zinc-600">Status</div>

              <div
                className={[
                  "mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset",
                  ui?.cls ?? "bg-white text-zinc-800 ring-zinc-200",
                ].join(" ")}
              >
                {ui?.label ?? status}
              </div>

              {canContinue ? (
                <div className="mt-3 text-sm text-zinc-700">
                  Status confirmado. Você pode continuar o cadastro.
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Você não pode continuar com este status. Entre em contato no WhatsApp para suporte.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Voltar
          </button>

          {ok && canContinue && (
            <button
              onClick={() => onContinue(vendorId)}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
