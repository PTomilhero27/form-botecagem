import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");
    if (!merchantId) {
      return NextResponse.json({ error: "merchantId é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("vendor_banners")
      .select("merchant_id,banner_name,theme,accent")
      .eq("merchant_id", merchantId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(
      data ?? { merchant_id: merchantId, banner_name: "", theme: "classic", accent: "orange" },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const merchantId = body?.merchantId;
    const bannerName = String(body?.bannerName ?? "").trim();
    const theme = String(body?.theme ?? "classic");
    const accent = String(body?.accent ?? "orange");

    if (!merchantId) {
      return NextResponse.json({ error: "merchantId é obrigatório" }, { status: 400 });
    }
    if (!bannerName) {
      return NextResponse.json({ error: "bannerName é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("vendor_banners")
      .upsert(
        { merchant_id: merchantId, banner_name: bannerName, theme, accent },
        { onConflict: "merchant_id" }
      )
      .select("merchant_id,banner_name,theme,accent")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro" }, { status: 500 });
  }
}
