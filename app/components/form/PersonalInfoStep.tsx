"use client";

import { useMemo, useState } from "react";
import type { SheetRow } from "@/types/sheet";
import { Mail, Phone, MapPin, Store, User } from "lucide-react";

type PersonalForm = {
  personType: "PF" | "PJ";

  cpfCnpj: string;
  fullName: string;

  email: string;
  phone: string;

  pdvName: string;

  // guardamos separado (pra salvar certinho)
  addressFull: string;
  addressZipcode: string;
  addressCity: string;
  addressState: string;

  // mas mostramos junto (UX)
  addressCombined: string;
};

function required(v: string) {
  return v.trim().length > 0;
}

function onlyDigits(v: string) {
  return (v || "").replace(/\D+/g, "");
}

function pickPersonType(row: SheetRow | null): "PF" | "PJ" {
  const pt = (row?.person_type || "").toLowerCase();
  if (pt.includes("pj")) return "PJ";
  if (pt.includes("pf")) return "PF";
  if (onlyDigits(row?.pj_cnpj || "").length >= 14) return "PJ";
  return "PF";
}

function buildAddressCombined(row?: {
  address_full?: string;
  address_zipcode?: string;
  address_city?: string;
  address_state?: string;
}) {
  const parts: string[] = [];
  const full = (row?.address_full || "").trim();
  const city = (row?.address_city || "").trim();
  const state = (row?.address_state || "").trim();
  const zip = (row?.address_zipcode || "").trim();

  if (full) parts.push(full);
  const cityState = [city, state].filter(Boolean).join(" - ");
  if (cityState) parts.push(cityState);
  if (zip) parts.push(`CEP ${zip}`);

  return parts.join(" • ");
}

export function PersonalInfoStep({
  vendorId,
  sheetRow,
  onBack,
  onNext,
}: {
  vendorId: string;
  sheetRow: SheetRow | null;
  onBack: () => void;
  onNext: (data: PersonalForm) => void;
}) {
  const prefill = useMemo(() => {
    const personType = pickPersonType(sheetRow);

    const cpfCnpj = vendorId || "";

    const fullName =
      personType === "PF"
        ? sheetRow?.pf_full_name || ""
        : sheetRow?.pj_legal_representative_name || "";

    const pdvName =
      personType === "PF"
        ? sheetRow?.pf_brand_name || ""
        : sheetRow?.pj_brand_name || "";

    const email = sheetRow?.contact_email || "";
    const phone = sheetRow?.contact_phone || "";

    const addressFull = sheetRow?.address_full || "";
    const addressZipcode = sheetRow?.address_zipcode || "";
    const addressCity = sheetRow?.address_city || "";
    const addressState = sheetRow?.address_state || "";

    const addressCombined = buildAddressCombined({
      address_full: addressFull,
      address_zipcode: addressZipcode,
      address_city: addressCity,
      address_state: addressState,
    });

    return {
      personType,
      cpfCnpj,
      fullName,
      email,
      phone,
      pdvName,
      addressFull,
      addressZipcode,
      addressCity,
      addressState,
      addressCombined,
    };
  }, [sheetRow, vendorId]);

  const [form, setForm] = useState<PersonalForm>({
    personType: prefill.personType,
    cpfCnpj: prefill.cpfCnpj,
    fullName: prefill.fullName,
    email: prefill.email,
    phone: prefill.phone,
    pdvName: prefill.pdvName,

    addressFull: prefill.addressFull,
    addressZipcode: prefill.addressZipcode,
    addressCity: prefill.addressCity,
    addressState: prefill.addressState,
    addressCombined: prefill.addressCombined,
  });

  const disabled = {
    // personType não editável
    personType: true,
    cpfCnpj: true,

    pdvName: !!prefill.pdvName,
    fullName: !!prefill.fullName,
    email: !!prefill.email,
    phone: !!prefill.phone,

    // se já temos tudo de endereço, trava o campo combinado
    addressCombined:
      !!prefill.addressFull &&
      !!prefill.addressZipcode &&
      !!prefill.addressCity &&
      !!prefill.addressState,
  };

  function update<K extends keyof PersonalForm>(key: K, value: PersonalForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!required(form.pdvName)) return "Preencha o nome do ponto de venda.";
    if (!required(form.fullName)) return "Preencha o nome.";
    if (!required(form.cpfCnpj)) return "CPF/CNPJ é obrigatório.";
    if (!required(form.email)) return "Preencha o e-mail.";
    if (!required(form.phone)) return "Preencha o contato.";

    // endereço: se for editável, o combinado é obrigatório
    if (!required(form.addressCombined)) return "Preencha o endereço completo.";

    // se você quiser obrigar os separados também, checa:
    // (quando vier da planilha eles já vêm cheios)
    if (!required(form.addressFull)) return "Endereço inválido.";
    if (!required(form.addressCity)) return "Cidade inválida.";
    if (!required(form.addressState)) return "Estado inválido.";
    if (!required(form.addressZipcode)) return "CEP inválido.";

    return null;
  }

  function handleNext() {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    onNext(form);
  }

  // Badge PF/PJ
  const badge =
    form.personType === "PJ"
      ? { label: "PJ", cls: "bg-sky-50 text-sky-700 ring-sky-200" }
      : { label: "PF", cls: "bg-violet-50 text-violet-700 ring-violet-200" };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Info pessoal</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Os dados já encontrados foram preenchidos.
          </p>
        </div>

        <div
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset",
            badge.cls,
          ].join(" ")}
        >
          <User className="h-4 w-4" />
          {badge.label}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* PDV grande */}
        <Field label="Nome do ponto de venda" icon={<Store className="h-4 w-4" />} disabled={disabled.pdvName}>
          <input
            value={form.pdvName}
            onChange={(e) => update("pdvName", e.target.value)}
            disabled={disabled.pdvName}
            placeholder="Ex: Sambatata"
            className={inputCls(disabled.pdvName, "text-base")}
          />
        </Field>

        {/* Nome | CPF */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome" icon={<User className="h-4 w-4" />} disabled={disabled.fullName}>
            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              disabled={disabled.fullName}
              placeholder="Digite seu nome"
              className={inputCls(disabled.fullName)}
            />
          </Field>

          <Field label="CPF/CNPJ" icon={<User className="h-4 w-4" />} disabled>
            <input value={form.cpfCnpj} disabled className={inputCls(true)} />
          </Field>
        </div>

        {/* Email | Contato */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="E-mail" icon={<Mail className="h-4 w-4" />} disabled={disabled.email}>
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              disabled={disabled.email}
              placeholder="ex: contato@expositor.com"
              className={inputCls(disabled.email)}
            />
          </Field>

          <Field label="Contato" icon={<Phone className="h-4 w-4" />} disabled={disabled.phone}>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              disabled={disabled.phone}
              placeholder="(11) 99999-9999"
              className={inputCls(disabled.phone)}
            />
          </Field>
        </div>

        {/* Endereço em um campo só */}
        <Field
          label="Endereço completo"
          icon={<MapPin className="h-4 w-4" />}
          disabled={disabled.addressCombined}
        >
          <input
            value={form.addressCombined}
            onChange={(e) => {
              update("addressCombined", e.target.value);

              // se o usuário editar manualmente (quando não veio da planilha),
              // aqui dá pra decidir como salvar:
              // - você pode salvar tudo em addressFull e deixar os outros vazios
              // - ou criar um parse (não recomendo agora)
              update("addressFull", e.target.value);
            }}
            disabled={disabled.addressCombined}
            placeholder="Rua, número • Cidade - UF • CEP 00000-000"
            className={inputCls(disabled.addressCombined)}
          />

          {!disabled.addressCombined && (
            <p className="mt-2 text-xs text-zinc-500">
              Informe tudo no mesmo campo (endereço, cidade/UF e CEP).
            </p>
          )}
        </Field>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={onBack}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          Voltar
        </button>

        <button
          onClick={handleNext}
          className="rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  disabled,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-zinc-500">{icon}</div>
        <label className="text-sm font-semibold text-zinc-900">
          {label}
          {disabled ? null : (
            <span className="ml-2 text-[11px] font-semibold text-red-600">*</span>
          )}
        </label>
      </div>
      {children}
    </div>
  );
}

function inputCls(disabled?: boolean, extra?: string) {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition",
    disabled
      ? "border-zinc-200 bg-zinc-50 text-zinc-700"
      : "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500",
    extra || "",
  ].join(" ");
}
