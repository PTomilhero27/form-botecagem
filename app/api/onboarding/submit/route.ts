import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type MenuPayload = {
  machinesQty?: number;
  categories?: Array<{
    name: string;
    products?: Array<{ name: string; price: number }>;
  }>;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { vendorId, personalData, bankData, equipmentData, menuData } = body as {
      vendorId: string;
      personalData: any;
      bankData: any;
      equipmentData: any;
      menuData: MenuPayload;
    };

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId obrigatório" }, { status: 400 });
    }

    // 0) vendor_status deve existir e cadastro é único:
    // se já tiver merchant_id, bloqueia novo envio
    const { data: vs, error: vsErr } = await supabaseAdmin
      .from("vendor_status")
      .select("vendor_id, merchant_id")
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (vsErr) throw vsErr;

    if (!vs) {
      return NextResponse.json(
        { error: "vendor_status não encontrado para este vendorId" },
        { status: 400 }
      );
    }

    if (vs.merchant_id) {
      return NextResponse.json(
        { error: "Cadastro já foi enviado anteriormente para este documento." },
        { status: 409 }
      );
    }

    // 1) Insert do merchant (PERSONAL + BANK + machinesQty)
    const merchantInsert = {
      pdv_name: personalData?.pdvName ?? personalData?.pdv_name ?? "PDV",
      person_type: personalData?.personType ?? personalData?.person_type ?? "PF",
      cpf_cnpj: vendorId,

      full_name: personalData?.fullName ?? personalData?.full_name ?? "",
      email: personalData?.email ?? null,
      phone: personalData?.phone ?? null,

      address_full: personalData?.addressFull ?? personalData?.address_full ?? null,
      address_city: personalData?.addressCity ?? personalData?.address_city ?? null,
      address_state: personalData?.addressState ?? personalData?.address_state ?? null,
      address_zipcode: personalData?.addressZipcode ?? personalData?.address_zipcode ?? null,

      bank_name: bankData?.bankName ?? bankData?.bank_name ?? null,
      bank_agency: bankData?.agency ?? bankData?.bank_agency ?? null,
      bank_account: bankData?.account ?? bankData?.bank_account ?? null,
      bank_account_type: bankData?.accountType ?? bankData?.bank_account_type ?? null,
      bank_holder_doc: bankData?.holderDoc ?? bankData?.bank_holder_doc ?? null,
      bank_holder_name: bankData?.holderName ?? bankData?.bank_holder_name ?? null,
      pix_key: bankData?.pixKey ?? bankData?.pix_key ?? null,

      machines_qty: Number(menuData?.machinesQty ?? 0),
    };

    const { data: merchant, error: merchantErr } = await supabaseAdmin
      .from("merchants")
      .insert(merchantInsert)
      .select("id")
      .single();

    if (merchantErr) throw merchantErr;

    const merchantId = merchant.id as string;

    // 2) Equipamentos (profile + items)
    let equipmentProfileId: string | null = null;

    if (equipmentData) {
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from("equipment_profiles")
        .insert({
          merchant_id: merchantId,
          vendor_id: vendorId,

          outlets110: Number(equipmentData.outlets110 ?? 0),
          outlets220: Number(equipmentData.outlets220 ?? 0),
          other_outlets_qty: Number(equipmentData.otherOutletsQty ?? 0),
          other_outlets_label: equipmentData.otherOutletsLabel ?? null,

          notes: equipmentData.notes ?? null,
        })
        .select("id")
        .single();

      if (profileErr) throw profileErr;
      equipmentProfileId = profile.id as string;

      const items = Array.isArray(equipmentData.items) ? equipmentData.items : [];
      if (items.length > 0) {
        const rows = items.map((it: any, idx: number) => ({
          equipment_profile_id: equipmentProfileId,
          name: it.name,
          qty: Number(it.qty ?? 1),
          position: idx,
        }));

        const { error: itemsErr } = await supabaseAdmin.from("equipment_items").insert(rows);
        if (itemsErr) throw itemsErr;
      }
    }

    // 3) Menu (categorias + produtos)
    const categories = menuData?.categories ?? [];

    for (let cIndex = 0; cIndex < categories.length; cIndex++) {
      const c = categories[cIndex];

      const { data: cat, error: catErr } = await supabaseAdmin
        .from("menu_categories")
        .insert({
          merchant_id: merchantId,
          name: c.name,
          position: cIndex,
          is_active: true,
        })
        .select("id")
        .single();

      if (catErr) throw catErr;

      const products = c.products ?? [];
      if (products.length > 0) {
        const rows = products.map((p, pIndex) => ({
          merchant_id: merchantId,
          category_id: cat.id,
          name: p.name,
          price_cents: Math.round(Number(p.price) * 100),
          position: pIndex,
          is_active: true,
        }));

        const { error: prodErr } = await supabaseAdmin.from("menu_products").insert(rows);
        if (prodErr) throw prodErr;
      }
    }

    // 4) Atualiza vendor_status com referências (sempre existe)
    const { error: linkErr } = await supabaseAdmin
      .from("vendor_status")
      .update({
        merchant_id: merchantId,
        equipment_profile_id: equipmentProfileId,
        updated_at: new Date().toISOString(),
        // status: "confirmado" (opcional se você quiser forçar)
      })
      .eq("vendor_id", vendorId);

    if (linkErr) throw linkErr;

    return NextResponse.json({ ok: true, merchantId, equipmentProfileId });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro desconhecido" },
      { status: 500 }
    );
  }
}
