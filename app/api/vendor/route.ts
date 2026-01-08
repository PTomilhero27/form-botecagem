import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { onlyDigits } from "@/lib/normalize";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const docRaw = String(body?.cpfCnpj ?? "");
    const vendorId = onlyDigits(docRaw);

    if (vendorId.length < 11) {
      return NextResponse.json({ ok: false, error: "CPF/CNPJ inválido" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("vendor_status")
      .select("vendor_id,status")
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: "Documento não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      vendor: { vendor_id: data.vendor_id, status: data.status },
      canContinue: data.status === "confirmado",
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro" }, { status: 400 });
  }
}
