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
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="mb-6">
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
                    active ? "text-zinc-900" : done ? "text-zinc-800" : "text-zinc-500",
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
  );
}
