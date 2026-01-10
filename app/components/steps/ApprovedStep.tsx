"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export function ApprovedStep({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-emerald-50 p-2 ring-1 ring-inset ring-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-700" />
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-bold text-zinc-900">Confirmado</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Seu cadastro foi validado. Clique em <b>Continuar</b> para preencher o formulário.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          Voltar
        </button>

        <button
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
