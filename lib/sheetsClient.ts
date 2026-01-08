import {SheetRow } from "@/types/sheet";
import { SheetRowListSchema } from "./schemas/sheet.schema";
import { fetchFromSheetsCsv } from "@/app/service/http";




function onlyDigits(v: string) {
  return (v || "").replace(/\D+/g, "");
}

export async function findVendorByDocument(doc: string): Promise<SheetRow | null> {
  const url = process.env.NEXT_PUBLIC_SHEETS_API_CSV_URL!;
  const cleanDoc = onlyDigits(doc);

  // 🔥 aqui está o ponto chave
  const rows = await fetchFromSheetsCsv(url, SheetRowListSchema);

  const found =
    rows.find((r) => onlyDigits(r.pf_cpf ?? "") === cleanDoc) ||
    rows.find((r) => onlyDigits(r.pj_cnpj ?? "") === cleanDoc);

  return found ?? null;
}
