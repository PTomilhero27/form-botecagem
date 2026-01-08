"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { onlyDigits } from "@/lib/normalize";
import { formatCpfCnpj } from "@/lib/cpfCnpj";
import { isValidCnpj } from "@/lib/validateCnpj";

export function EntryCpfModal({
  open,
  title = "CPF/CNPJ",
  subtitle = "Digite seu CPF/CNPJ para validar seu acesso.",
  value,
  onChange,
  loading,
  onSubmit,
}: {
  open: boolean;
  title?: string;
  subtitle?: string;
  value: string; // pode vir mascarado
  onChange: (v: string) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [touched, setTouched] = useState(false);

  const digits = useMemo(() => onlyDigits(value), [value]);

  const cnpjError = useMemo(() => {
    // só valida quando tiver 14 dígitos (cnpj completo)
    if (digits.length === 14) {
      return isValidCnpj(digits) ? "" : "CNPJ inválido (dígitos verificadores não conferem).";
    }
    return "";
  }, [digits]);

  const canSubmit = useMemo(() => {
    // CPF: 11 dígitos (não estamos validando DV do CPF por enquanto)
    if (digits.length === 11) return true;
    // CNPJ: 14 dígitos e DV válido
    if (digits.length === 14) return !cnpjError;
    return false;
  }, [digits, cnpjError]);

  useEffect(() => {
    if (open) {
      // foca ao abrir
      setTimeout(() => inputRef.current?.focus(), 0);
      setTouched(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* modal (menor e mais compacto) */}
      <div className="relative z-10 w-[92vw] max-w-xl rounded-2xl bg-white p-7 shadow-xl">
        <div className="text-left">
          {/* Label clicável que foca no input */}
          <label
            htmlFor="cpfCnpj"
            className="text-2xl font-semibold text-zinc-900 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            {title}
          </label>
          <p className="mt-2 text-sm text-zinc-600">{subtitle}</p>
        </div>

        <div className="mt-5">
          <input
            id="cpfCnpj"
            ref={inputRef}
            value={formatCpfCnpj(value)}
            onChange={(e) => {
              const rawDigits = onlyDigits(e.target.value).slice(0, 14); // limita a 14
              const masked = formatCpfCnpj(rawDigits);
              onChange(masked);
              setTouched(true);
            }}
            onBlur={() => setTouched(true)}
            placeholder="Ex: 123.456.789-00"
            inputMode="numeric"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-zinc-900
              placeholder-zinc-400 shadow-sm outline-none
              ${cnpjError && touched ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-zinc-200 focus:border-orange-500 focus:ring-orange-500/10"}
              focus:ring-4`}
          />

          {/* erro CNPJ */}
          {touched && cnpjError && (
            <div className="mt-2 text-sm text-red-600">{cnpjError}</div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onSubmit}
            disabled={loading || !canSubmit}
            className="rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white
                       shadow-sm transition hover:bg-orange-600
                       disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Pesquisando..." : "Pesquisar"}
          </button>
        </div>
      </div>
    </div>
  );
}
