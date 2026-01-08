"use client";

import { useEffect, useState } from "react";
import { onlyDigits } from "@/lib/normalize";
import { EntryCpfModal } from "../ui/EntryCpfModal";
import { ConfirmVendorModal } from "../ui/ConfirmVendorModal";
import type { VendorLookupResponse } from "@/types/vendor";

export function DocumentLookupStep({
  onContinue,
}: {
  onContinue: (vendorId: string) => void;
}) {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);

  const [entryOpen, setEntryOpen] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<VendorLookupResponse | null>(null);

  useEffect(() => {
    setEntryOpen(true);
  }, []);

  async function handleSearch() {
    const doc = onlyDigits(cpfCnpj);

    if (doc.length < 11) {
      setEntryOpen(false);
      setResult({ ok: false, error: "CPF/CNPJ inválido" });
      setConfirmOpen(true);
      return;
    }

    setLoading(true);
    try {
      // ✅ use a rota correta
      const res = await fetch("/api/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpfCnpj: doc }),
      });

      const data = (await res.json()) as VendorLookupResponse;

      setEntryOpen(false);
      setResult(data);
      setConfirmOpen(true);
    } catch {
      setEntryOpen(false);
      setResult({ ok: false, error: "Falha ao consultar. Tente novamente." });
      setConfirmOpen(true);
    } finally {
      setLoading(false);
    }
  }

  function backToEntry() {
    setConfirmOpen(false);
    setEntryOpen(true);
  }

  return (
    <>
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-10 text-center text-sm text-zinc-500">
        Aguardando validação do CPF/CNPJ...
      </div>

      <EntryCpfModal
        open={entryOpen}
        title="CPF/CNPJ"
        subtitle="Digite seu CPF/CNPJ para validar seu acesso."
        value={cpfCnpj}
        onChange={setCpfCnpj}
        loading={loading}
        onSubmit={handleSearch}
      />

      <ConfirmVendorModal
        open={confirmOpen}
        onClose={backToEntry}
        result={result}
        onContinue={(vendorId) => {
          setConfirmOpen(false);
          onContinue(vendorId);
        }}
      />
    </>
  );
}
