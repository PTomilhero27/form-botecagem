import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");

    if (!merchantId) {
      return NextResponse.json({ error: "merchantId é obrigatório" }, { status: 400 });
    }

    // 1) categorias do merchant
    const { data: cats, error: catsErr } = await supabaseAdmin
      .from("menu_categories")
      .select("id,name,position,is_active,created_at")
      .eq("merchant_id", merchantId)
      .order("position", { ascending: true });

    if (catsErr) {
      return NextResponse.json({ error: catsErr.message }, { status: 500 });
    }

    const catIds = (cats ?? []).map((c) => c.id);
    if (!catIds.length) {
      return NextResponse.json({ machinesQty: 2, categories: [] }, { status: 200 });
    }

    // 2) produtos dessas categorias
    const { data: prods, error: prodsErr } = await supabaseAdmin
      .from("menu_products")
      .select("id,category_id,name,price_cents,position,is_active,created_at")
      .in("category_id", catIds)
      .order("position", { ascending: true });

    if (prodsErr) {
      return NextResponse.json({ error: prodsErr.message }, { status: 500 });
    }

    // 3) monta no formato do MenuStep
    const categories = (cats ?? []).map((c) => ({
      id: c.id,
      name: c.name ?? "",
      products: (prods ?? [])
        .filter((p) => p.category_id === c.id)
        .filter((p) => p.is_active !== false) // opcional: só ativos
        .map((p) => ({
          id: p.id,
          name: p.name ?? "",
          price: Number(p.price_cents ?? 0) / 100,
        })),
    }));

    return NextResponse.json(
      {
        machinesQty: 2, // se você tiver isso em algum lugar no banco, troca aqui
        categories,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro" }, { status: 500 });
  }
}
