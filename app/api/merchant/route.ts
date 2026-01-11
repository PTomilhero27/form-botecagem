import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");

    if (!merchantId) {
      return NextResponse.json({ error: "merchantId obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("merchants")
      .select(`
        id,
        pdv_name,
        person_type,
        cpf_cnpj,
        full_name,
        email,
        phone,
        address_full,
        address_city,
        address_state,
        address_zipcode,
        bank_account_type,
        bank_name,
        bank_agency,
        bank_account,
        bank_holder_doc,
        bank_holder_name,
        pix_key
      `)
      .eq("id", merchantId)
      .single();

    if (error) throw error;

    // devolve no formato que seus Steps já entendem
    const personal = {
      personType: data.person_type ?? "PF",
      cpfCnpj: data.cpf_cnpj ?? "",
      fullName: data.full_name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      pdvName: data.pdv_name ?? "",
      addressFull: data.address_full ?? "",
      addressCity: data.address_city ?? "",
      addressState: data.address_state ?? "",
      addressZipcode: data.address_zipcode ?? "",
      // se você usa addressCombined na UI:
      addressCombined: [
        (data.address_full ?? "").trim(),
        [data.address_city, data.address_state].filter(Boolean).join(" - "),
        data.address_zipcode ? `CEP ${data.address_zipcode}` : "",
      ]
        .filter(Boolean)
        .join(" • "),
    };

    const bank = {
      accountType: (data.bank_account_type ?? "corrente") as "corrente" | "poupanca",
      bankName: data.bank_name ?? "",
      agency: data.bank_agency ?? "",
      account: data.bank_account ?? "",
      holderDoc: data.bank_holder_doc ?? "",
      holderName: data.bank_holder_name ?? "",
      pixKey: data.pix_key ?? "",
    };

    return NextResponse.json({ personal, bank });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "Erro desconhecido" }, { status: 500 });
  }
}
