import { ZodSchema } from "zod";
import Papa from "papaparse";

export async function fetchFromSheetsCsv<T>(
  url: string,
  schema: ZodSchema<T>
): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Erro ao buscar CSV");

  const csv = await res.text();

  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return schema.parse(parsed.data);
}
