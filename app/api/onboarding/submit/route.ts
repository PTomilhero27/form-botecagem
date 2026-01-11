import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Mode = "create" | "edit";

type MenuPayload = {
  machinesQty?: number;
  categories?: Array<{
    name: string;
    products?: Array<{ name: string; price: number }>;
  }>;
};

type BannerPayload = {
  // compat
  text?: string;

  // seu payload real do front
  bannerName?: string;
  theme?: string;  // "classic" | "neon" | "dark"...
  accent?: string; // "orange" | "blue" | etc
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      vendorId,
      mode: modeFromClient,
      merchantId: merchantIdFromClient,
      equipmentProfileId: equipmentProfileIdFromClient,
      bannerProfileId: bannerProfileIdFromClient,

      personalData,
      bankData,
      equipmentData,
      menuData,
      bannerData,
    } = body as {
      vendorId: string;

      mode?: Mode;
      merchantId?: string | null;
      equipmentProfileId?: string | null;
      bannerProfileId?: string | null;

      personalData?: any;
      bankData?: any;
      equipmentData?: any;
      menuData?: MenuPayload;
      bannerData?: BannerPayload;
    };

    if (!vendorId) {
      return NextResponse.json({ ok: false, error: "vendorId obrigatório" }, { status: 400 });
    }

    // 0) vendor_status é a fonte da verdade
    const { data: vs, error: vsErr } = await supabaseAdmin
      .from("vendor_status")
      .select("vendor_id, merchant_id, equipment_profile_id, banner_profile_id")
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (vsErr) throw vsErr;

    if (!vs) {
      return NextResponse.json(
        { ok: false, error: "vendor_status não encontrado para este vendorId" },
        { status: 400 }
      );
    }

    const existingMerchantId = (vs.merchant_id as string | null) ?? null;
    const existingEquipmentProfileId = (vs.equipment_profile_id as string | null) ?? null;
    const existingBannerProfileId = (vs.banner_profile_id as string | null) ?? null;

    // Decide modo real:
    // - se já existe merchant no vendor_status, é edição
    const effectiveMode: Mode = existingMerchantId ? "edit" : (modeFromClient ?? "create");

    // Se client pediu create mas já existe merchant, bloqueia
    if (effectiveMode === "edit" && modeFromClient === "create") {
      return NextResponse.json(
        { ok: false, error: "Cadastro já existe para este documento (modo create bloqueado)." },
        { status: 409 }
      );
    }

    // 1) Merchant: CREATE ou UPDATE
    const merchantPayload = {
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

    let merchantId: string;

    if (effectiveMode === "create") {
      const { data: merchant, error: merchantErr } = await supabaseAdmin
        .from("merchants")
        .insert(merchantPayload)
        .select("id")
        .single();

      if (merchantErr) throw merchantErr;
      merchantId = merchant.id as string;
    } else {
      merchantId = (merchantIdFromClient ?? existingMerchantId) as string;

      if (!merchantId) {
        return NextResponse.json(
          { ok: false, error: "merchantId ausente para edição" },
          { status: 400 }
        );
      }

      const { error: updErr } = await supabaseAdmin
        .from("merchants")
        .update(merchantPayload)
        .eq("id", merchantId);

      if (updErr) throw updErr;
    }

    // 2) Equipamentos (profile + items)
    let equipmentProfileId: string | null = null;

    if (equipmentData) {
      const targetProfileId =
        effectiveMode === "edit"
          ? (equipmentProfileIdFromClient ?? existingEquipmentProfileId)
          : null;

      if (effectiveMode === "edit" && targetProfileId) {
        equipmentProfileId = targetProfileId;

        const { error: epUpdErr } = await supabaseAdmin
          .from("equipment_profiles")
          .update({
            merchant_id: merchantId,
            outlets110: Number(equipmentData.outlets110 ?? 0),
            outlets220: Number(equipmentData.outlets220 ?? 0),
            other_outlets_qty: Number(equipmentData.otherOutletsQty ?? 0),
            other_outlets_label: equipmentData.otherOutletsLabel ?? null,
            notes: equipmentData.notes ?? null,
            updated_at: new Date().toISOString(), // ✅ se a coluna existir
          })
          .eq("id", equipmentProfileId);

        if (epUpdErr) throw epUpdErr;

        // substitui items (evita duplicar)
        const { error: delItemsErr } = await supabaseAdmin
          .from("equipment_items")
          .delete()
          .eq("equipment_profile_id", equipmentProfileId);

        if (delItemsErr) throw delItemsErr;

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
      } else {
        // create
        const { data: profile, error: profileErr } = await supabaseAdmin
          .from("equipment_profiles")
          .insert({
            merchant_id: merchantId,
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
    }

    // 3) Menu (categorias + produtos) - edit: limpa e recria
    if (menuData) {
      if (effectiveMode === "edit") {
        const { error: delProdErr } = await supabaseAdmin
          .from("menu_products")
          .delete()
          .eq("merchant_id", merchantId);
        if (delProdErr) throw delProdErr;

        const { error: delCatErr } = await supabaseAdmin
          .from("menu_categories")
          .delete()
          .eq("merchant_id", merchantId);
        if (delCatErr) throw delCatErr;
      }

      const categories = menuData.categories ?? [];
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
    }

    // 4) Banner (corrigido p/ seu payload real)
    let bannerProfileId: string | null = null;

    if (bannerData) {
      const bannerName = String(bannerData.bannerName ?? bannerData.text ?? "").trim();
      const theme = String(bannerData.theme ?? "classic").trim();
      const accent = String(bannerData.accent ?? "orange").trim();

      // só salva se tiver nome (se você quiser permitir vazio, remove esse if)
      if (bannerName.length > 0) {
        const targetBannerId =
          effectiveMode === "edit"
            ? (bannerProfileIdFromClient ?? existingBannerProfileId)
            : null;

        if (effectiveMode === "edit" && targetBannerId) {
          bannerProfileId = targetBannerId;

          const { error: bUpdErr } = await supabaseAdmin
            .from("vendor_banners")
            .update({
              merchant_id: merchantId,
              banner_name: bannerName,
              theme,
              accent,
              updated_at: new Date().toISOString(),
            })
            .eq("id", bannerProfileId);

          if (bUpdErr) throw bUpdErr;
        } else {
          const { data: b, error: bErr } = await supabaseAdmin
            .from("vendor_banners")
            .insert({
              merchant_id: merchantId,
              banner_name: bannerName,
              theme,
              accent,
            })
            .select("id")
            .single();

          if (bErr) throw bErr;
          bannerProfileId = b.id as string;
        }
      }
    }

    // 5) Atualiza vendor_status com referências
    const { error: linkErr } = await supabaseAdmin
      .from("vendor_status")
      .update({
        merchant_id: merchantId,
        equipment_profile_id: equipmentProfileId ?? existingEquipmentProfileId ?? null,
        banner_profile_id: bannerProfileId ?? existingBannerProfileId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("vendor_id", vendorId);

    if (linkErr) throw linkErr;

    return NextResponse.json({
      ok: true,
      mode: effectiveMode,
      merchantId,
      equipmentProfileId: equipmentProfileId ?? existingEquipmentProfileId ?? null,
      bannerProfileId: bannerProfileId ?? existingBannerProfileId ?? null,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro desconhecido" },
      { status: 500 }
    );
  }
}
