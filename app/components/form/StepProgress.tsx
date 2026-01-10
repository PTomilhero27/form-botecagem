"use client";

import { Check } from "lucide-react";

export type StepKey = "personal" | "bank" | "equipment" | "menu";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "personal", label: "Info pessoal" },
  { key: "bank", label: "Info bancária" },
  { key: "equipment", label: "Equipamentos" },
  { key: "menu", label: "Cardápio" },
];

export function StepProgress({ current }: { current: StepKey }) {
  const currentIndex = Math.max(0, STEPS.findIndex((s) => s.key === current));
  const total = STEPS.length;
  const stepNumber = currentIndex + 1;
  const percent = Math.round((currentIndex / Math.max(1, total - 1)) * 100);

  return (
    <div className="mb-6">
      {/* MOBILE (até sm): compacto */}
      <div className="sm:hidden">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-500">
                Etapa {stepNumber} de {total}
              </p>
              <p className="truncate text-sm font-semibold text-zinc-900">
                {STEPS[currentIndex]?.label}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                {percent}%
              </div>
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* DESKTOP (sm+): seu layout completo */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between gap-3">
          {STEPS.map((step, idx) => {
            const done = idx < currentIndex;
            const active = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-1 items-center gap-3">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ring-1 ring-inset",
                    done
                      ? "bg-emerald-600 text-white ring-emerald-600"
                      : active
                      ? "bg-orange-500 text-white ring-orange-500"
                      : "bg-white text-zinc-600 ring-zinc-200",
                  ].join(" ")}
                >
                  {done ? <Check className="h-4 w-4" /> : idx + 1}
                </div>

                <div className="min-w-0">
                  <div
                    className={[
                      "truncate text-sm font-semibold",
                      active
                        ? "text-zinc-900"
                        : done
                        ? "text-zinc-800"
                        : "text-zinc-500",
                    ].join(" ")}
                  >
                    {step.label}
                  </div>

                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={[
                        "h-full rounded-full transition-all",
                        done
                          ? "w-full bg-emerald-600"
                          : active
                          ? "w-1/2 bg-orange-500"
                          : "w-0 bg-zinc-200",
                      ].join(" ")}
                    />
                  </div>
                </div>

                {idx !== STEPS.length - 1 && (
                  <div className="hidden h-px flex-1 bg-zinc-200 sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
