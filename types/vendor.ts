export type VendorStatus =
  | "selecionado"
  | "aguardando_assinatura"
  | "aguardando_pagamento"
  | "confirmado"
  | "desistente";

export type VendorLookupResponse =
  | { ok: false; error: string }
  | {
      ok: true;
      vendor: {
        vendor_id: string;
        status: string;
        merchant_id: string | null;
        equipment_profile_id: string | null;
      };
      canContinue: boolean;
      mode: "create" | "edit";
    };


export const STATUS_UI: Record<VendorStatus, { label: string; cls: string }> = {
  selecionado: {
    label: "Selecionado",
    cls: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  aguardando_assinatura: {
    label: "Aguardando assinatura",
    cls: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  aguardando_pagamento: {
    label: "Aguardando pagamento",
    cls: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  confirmado: {
    label: "Confirmado",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  desistente: {
    label: "Desistente",
    cls: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  },
};
