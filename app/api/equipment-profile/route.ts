import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "equipment_profile_id é obrigatório" },
        { status: 400 }
      );
    }

    // 1️⃣ Busca o profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("equipment_profiles")
      .select(
        `
        id,
        outlets110,
        outlets220,
        other_outlets_qty,
        other_outlets_label,
        notes
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil de equipamento não encontrado" },
        { status: 404 }
      );
    }

    // 2️⃣ Busca os itens
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("equipment_items")
      .select("id,name,qty,position")
      .eq("equipment_profile_id", id)
      .order("position", { ascending: true });

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    // 3️⃣ Converte para o formato do form
    return NextResponse.json({
      items: (items ?? []).map((it) => ({
        id: it.id,
        name: it.name ?? "",
        qty: it.qty ?? 1,
      })),
      outlets110: profile.outlets110 ?? 0,
      outlets220: profile.outlets220 ?? 0,
      otherOutletsQty: profile.other_outlets_qty ?? 0,
      otherOutletsLabel: profile.other_outlets_label ?? "",
      notes: profile.notes ?? "",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro inesperado" },
      { status: 500 }
    );
  }
}
