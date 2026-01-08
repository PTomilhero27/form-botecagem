"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Zap, Package, ArrowLeft, ArrowRight } from "lucide-react";

export type EquipmentItem = {
  id: string;
  name: string;
  qty: number;
};

export type EquipmentForm = {
  items: EquipmentItem[];
  outlets110: number;
  outlets220: number;
  otherOutletsLabel: string; // ex: "trifásico", "380v", "extensão"
  otherOutletsQty: number;
  notes: string; // opcional (mas você pode tornar obrigatório se quiser)
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function onlyInt(v: string) {
  const s = (v || "").replace(/[^\d]/g, "");
  return s.length ? Number(s) : 0;
}

function required(v: string) {
  return v.trim().length > 0;
}

function inputCls(extra?: string) {
  return [
    extra ?? "",
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900",
    "placeholder:text-zinc-500 shadow-sm outline-none transition",
    "focus:border-orange-500 focus:ring-4 focus:ring-orange-100",
  ]
    .join(" ")
    .trim();
}

function chipCls(active?: boolean) {
  return [
    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition",
    active
      ? "border-orange-500 bg-orange-50 text-orange-700"
      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
  ].join(" ");
}

const SUGGESTIONS = [
  "Fritadeira",
  "Geladeira",
  "Freezer",
  "Chapa",
  "Forno elétrico",
  "Forno a gás",
  "Estufa",
  "Micro-ondas",
  "Liquidificador",
  "Batedeira",
  "Máquina de açaí",
  "Máquina de sorvete",
  "Cafeteira",
  "Moedor de café",
  "Expositor térmico",
  "Balcão refrigerado",
  "Exaustor",
  "Caixa de som",
];

export function EquipmentStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: EquipmentForm) => void;
}) {
  const [items, setItems] = useState<EquipmentItem[]>([
    { id: uid(), name: "", qty: 1 },
  ]);

  const [outlets110, setOutlets110] = useState(0);
  const [outlets220, setOutlets220] = useState(0);
  const [otherOutletsLabel, setOtherOutletsLabel] = useState("");
  const [otherOutletsQty, setOtherOutletsQty] = useState(0);

  const [notes, setNotes] = useState("");

  const totalEquipQty = useMemo(
    () => items.reduce((acc, it) => acc + (Number.isFinite(it.qty) ? it.qty : 0), 0),
    [items]
  );

  const totalOutlets = useMemo(
    () => (outlets110 || 0) + (outlets220 || 0) + (otherOutletsQty || 0),
    [outlets110, outlets220, otherOutletsQty]
  );

  function addItem(preset?: string) {
    setItems((prev) => [
      ...prev,
      { id: uid(), name: preset ?? "", qty: 1 },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.length <= 1 ? prev : prev.filter((x) => x.id !== id));
  }

  function updateItem(id: string, patch: Partial<EquipmentItem>) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function validate(): string | null {
    // Equipamentos (obrigatório pelo menos 1, com nome e qty >= 1)
    if (!items.length) return "Adicione pelo menos 1 equipamento.";

    for (const it of items) {
      if (!required(it.name)) return "Preencha o nome de todos os equipamentos.";
      if (!Number.isFinite(it.qty) || it.qty < 1) return "Quantidade do equipamento deve ser 1 ou mais.";
    }

    // Tomadas: precisa ter pelo menos 1 tomada informada (110, 220 ou outras)
    if (totalOutlets < 1) return "Informe a quantidade de tomadas (110, 220 ou outras).";

    // Se informou outras tomadas, precisa dizer qual
    if (otherOutletsQty > 0 && !required(otherOutletsLabel)) {
      return "Você informou 'outras tomadas'. Diga qual (ex: trifásico, 380v, extensão).";
    }

    return null;
  }

  function handleNext() {
    const err = validate();
    if (err) return alert(err);

    onNext({
      items,
      outlets110,
      outlets220,
      otherOutletsLabel: otherOutletsLabel.trim(),
      otherOutletsQty,
      notes: notes.trim(),
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-zinc-900">Equipamentos e Tomadas</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Liste os equipamentos que você vai levar e quantas tomadas precisa (110/220/outras).
        </p>
      </div>

      {/* Resumo */}
      <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold text-zinc-900">
            <Package className="h-4 w-4 text-orange-600" />
            Total de equipamentos: {totalEquipQty}
          </span>

          <span className="inline-flex items-center gap-2 font-semibold text-zinc-900">
            <Zap className="h-4 w-4 text-orange-600" />
            Tomadas: 110={outlets110 || 0} • 220={outlets220 || 0}
            {otherOutletsQty > 0 ? ` • ${otherOutletsLabel || "Outras"}=${otherOutletsQty}` : ""}
            {" "} (Total: {totalOutlets})
          </span>
        </div>
      </div>

      {/* Sugestões rápidas */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-zinc-900">Sugestões rápidas</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTIONS.slice(0, 10).map((s) => (
            <button
              key={s}
              type="button"
              className={chipCls(false)}
              onClick={() => addItem(s)}
            >
              <Plus className="h-4 w-4 text-orange-600" />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de equipamentos */}
      <div className="rounded-2xl border border-zinc-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-900">
            Equipamentos <span className="text-red-600">*</span>
          </div>

          <button
            type="button"
            onClick={() => addItem("")}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Adicionar equipamento
          </button>
        </div>

        <div className="space-y-3">
          {items.map((it, idx) => (
            <div
              key={it.id}
              className="grid grid-cols-1 gap-2 rounded-2xl border border-zinc-200 bg-white p-3 sm:grid-cols-6 sm:items-end"
            >
              <div className="sm:col-span-4">
                <label className="text-xs font-semibold text-zinc-800">
                  Nome do equipamento <span className="text-red-600">*</span>
                </label>

                <input
                  value={it.name}
                  onChange={(e) => updateItem(it.id, { name: e.target.value })}
                  placeholder='Ex: "Geladeira", "Fritadeira", "Chapa"...'
                  className={inputCls("mt-1")}
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-xs font-semibold text-zinc-800">
                  Qtde <span className="text-red-600">*</span>
                </label>
                <input
                  value={String(it.qty)}
                  onChange={(e) => updateItem(it.id, { qty: Math.max(1, onlyInt(e.target.value)) })}
                  inputMode="numeric"
                  className={inputCls("mt-1")}
                />
              </div>

              <div className="sm:col-span-1 sm:flex sm:justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 sm:mt-0 sm:w-auto"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                  Remover
                </button>
              </div>

              {idx === 0 && (
                <div className="sm:col-span-6 text-xs text-zinc-500">
                  Dica: use os chips acima para adicionar rápido.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tomadas */}
      <div className="mt-5 rounded-2xl border border-zinc-200 p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">
          Tomadas necessárias <span className="text-red-600">*</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-zinc-800">Tomadas 110V</label>
            <input
              value={String(outlets110)}
              onChange={(e) => setOutlets110(Math.max(0, onlyInt(e.target.value)))}
              inputMode="numeric"
              placeholder="0"
              className={inputCls("mt-1")}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-800">Tomadas 220V</label>
            <input
              value={String(outlets220)}
              onChange={(e) => setOutlets220(Math.max(0, onlyInt(e.target.value)))}
              inputMode="numeric"
              placeholder="0"
              className={inputCls("mt-1")}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-800">Outras (opcional)</label>
            <input
              value={String(otherOutletsQty)}
              onChange={(e) => setOtherOutletsQty(Math.max(0, onlyInt(e.target.value)))}
              inputMode="numeric"
              placeholder="0"
              className={inputCls("mt-1")}
            />
          </div>
        </div>

        {otherOutletsQty > 0 && (
          <div className="mt-3">
            <label className="text-xs font-semibold text-zinc-800">
              Quais outras tomadas? <span className="text-red-600">*</span>
            </label>
            <input
              value={otherOutletsLabel}
              onChange={(e) => setOtherOutletsLabel(e.target.value)}
              placeholder='Ex: "Trifásico", "380V", "Extensão"...'
              className={inputCls("mt-1")}
            />
          </div>
        )}

        <div className="mt-3 text-xs text-zinc-500">
          Exemplo: “4 tomadas: 2 de 110V e 2 de 220V para 4 fritadeiras”.
        </div>
      </div>

      {/* Observações (opcional) */}
      <div className="mt-5">
        <label className="text-sm font-semibold text-zinc-900">
          Observações (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Se precisar de algo específico, descreva aqui."
          className={[
            inputCls("mt-2"),
            "min-h-[96px] resize-none",
          ].join(" ")}
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <button
          onClick={handleNext}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
