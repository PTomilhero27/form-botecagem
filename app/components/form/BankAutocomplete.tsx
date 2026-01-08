"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { BankItem, BANKS_BR } from "@/lib/banks";

function normalize(str: string) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos
}

function highlightParts(text: string, query: string) {
  const q = normalize(query.trim());
  if (!q) return [text];

  // achar match sem acento, mas renderizar original:
  const normalizedText = normalize(text);
  const idx = normalizedText.indexOf(q);
  if (idx < 0) return [text];

  // mapeamento simples: assume tamanhos semelhantes (ok para UI)
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return [before, { match }, after] as const;
}

export function BankAutocomplete({
  value,
  onChange,
  disabled,
  placeholder = "Digite nome ou código (ex: 341, itau)...",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setQuery(value || ""), [value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const qRaw = query.trim();
    const q = normalize(qRaw);
    const qIsCode = /^\d{1,4}$/.test(qRaw);

    let list = BANKS_BR;

    if (q) {
      list = list.filter((b) => {
        const nameN = normalize(b.name);
        const codeN = normalize(b.code);
        if (qIsCode) return codeN.startsWith(q); // se digitou número, prioriza código
        return nameN.includes(q) || codeN.includes(q);
      });
    }

    // ordenação simples: se digitou código, prioriza startsWith; se nome, prioriza includes mais cedo
    const ranked = [...list].sort((a, b) => {
      if (qIsCode) {
        const as = a.code.startsWith(qRaw) ? 0 : 1;
        const bs = b.code.startsWith(qRaw) ? 0 : 1;
        if (as !== bs) return as - bs;
      }
      const ai = normalize(a.name).indexOf(q);
      const bi = normalize(b.name).indexOf(q);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });

    return ranked.slice(0, 12);
  }, [query]);

  function choose(b: BankItem) {
    const display = `${b.code} - ${b.name}`;
    onChange(display);
    setQuery(display);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

        <input
          value={query}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            onChange(v); // livre (caso não ache)
            setOpen(true);
          }}
          onFocus={() => !disabled && setOpen(true)}
          placeholder={placeholder}
          className={[
            "w-full rounded-xl border px-10 py-3 text-sm outline-none transition",
            disabled
              ? "border-zinc-200 bg-zinc-50 text-zinc-700"
              : "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={() => !disabled && setOpen((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          aria-label="Abrir lista de bancos"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-600">
              Nenhum banco encontrado. Você pode continuar digitando.
            </div>
          ) : (
            <ul className="max-h-72 overflow-auto py-1">
              {filtered.map((b) => {
                const label = `${b.code} - ${b.name}`;
                const parts = highlightParts(label, query);

                return (
                  <li key={`${b.code}-${b.name}`}>
                    <button
                      type="button"
                      onClick={() => choose(b)}
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-900 hover:bg-zinc-50"
                    >
                      {parts.map((p, idx) =>
                        typeof p === "string" ? (
                          <span key={idx}>{p}</span>
                        ) : (
                          <span
                            key={idx}
                            className="font-semibold text-orange-500" // Botecagem highlight
                          >
                            {p.match}
                          </span>
                        )
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-zinc-200 px-4 py-2 text-xs text-zinc-500">
            Pesquise por <b>código</b> (ex: 001, 341) ou <b>nome</b> (ex: itau, santander).
          </div>
        </div>
      )}
    </div>
  );
}
