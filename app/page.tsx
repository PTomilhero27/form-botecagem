"use client";

import { useState } from "react";
import { ApprovedStep } from "./components/steps/ApprovedStep";
import { DocumentLookupStep } from "./components/steps/DocumentLookupStep";
import { findVendorByDocument } from "@/lib/sheetsClient";
import type { SheetRow } from "@/types/sheet";

import { StepProgress } from "./components/form/StepProgress";
import { PersonalInfoStep } from "./components/form/PersonalInfoStep";
import { BankInfoStep } from "./components/form/BankInfoStep";
import { EquipmentStep } from "./components/form/EquipmentStep";
import { MenuStep } from "./components/form/MenuStep";
import { SuccessStep } from "./components/steps/SuccessStep";
import { BannerStep } from "./components/form/BannerStep"; // ✅ novo step

type Step =
  | "doc"
  | "form"
  | "personal"
  | "bank"
  | "equipment"
  | "menu"
  | "banner"
  | "success";

type Mode = "create" | "edit";

export default function Page() {
  const [step, setStep] = useState<Step>("doc");
  const [vendorId, setVendorId] = useState<string | null>(null);

  // vindo do /api/vendor (vendor_status)
  const [mode, setMode] = useState<Mode>("create");
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [equipmentProfileId, setEquipmentProfileId] = useState<string | null>(null);

  // planilha
  const [sheetRow, setSheetRow] = useState<SheetRow | null>(null);

  // drafts (persistem ao voltar)
  const [personalDraft, setPersonalDraft] = useState<any>(null);
  const [bankDraft, setBankDraft] = useState<any>(null);
  const [equipmentDraft, setEquipmentDraft] = useState<any>(null);
  const [menuDraft, setMenuDraft] = useState<any>(null);
  const [bannerDraft, setBannerDraft] = useState<any>(null); // ✅ novo

  // prefill supabase (edit)
  const [equipmentInitialData, setEquipmentInitialData] = useState<any>(null);
  const [menuInitialData, setMenuInitialData] = useState<any>(null);
  const [bannerInitialData, setBannerInitialData] = useState<any>(null); // ✅ novo

  const [savedMerchantId, setSavedMerchantId] = useState<string | null>(null);

  async function handleDocConfirmed(
    doc: string,
    mId: string | null,
    equipProfileId: string | null,
    m: Mode
  ) {
    try {
      setVendorId(doc);
      setMerchantId(mId);
      setEquipmentProfileId(equipProfileId);
      setMode(m);

      // limpa drafts quando troca documento (evita misturar cadastros)
      setPersonalDraft(null);
      setBankDraft(null);
      setEquipmentDraft(null);
      setMenuDraft(null);
      setBannerDraft(null);

      setEquipmentInitialData(null);
      setMenuInitialData(null);
      setBannerInitialData(null);

      // 1) busca planilha
      const row = await findVendorByDocument(doc);
      if (!row) {
        alert("Documento não encontrado na planilha. Entre em contato com o suporte.");
        resetAll();
        return;
      }
      setSheetRow(row);

      // 2) prefill supabase se for edit
      if (m === "edit" && mId) {

        // ✅ Personal + Bank prefill do MERCHANT (fonte da verdade no edit)
        try {
          const res = await fetch(`/api/merchant?merchantId=${encodeURIComponent(mId)}`, {
            method: "GET",
          });

          if (res.ok) {
            const json = await res.json();
            // você pode usar Draft direto (assim ao voltar já fica persistido)
            setPersonalDraft(json.personal ?? null);
            setBankDraft(json.bank ?? null);
          }
        } catch {
          // se falhar, não trava o fluxo (vai cair no prefill da planilha nos steps)
        }


        // Equipment prefill (se tiver equipmentProfileId)
        if (equipProfileId) {
          try {
            const res = await fetch(`/api/equipment-profile?id=${equipProfileId}`, { method: "GET" });
            if (res.ok) setEquipmentInitialData(await res.json());
          } catch {
            setEquipmentInitialData(null);
          }
        }

        // Menu prefill (usa merchantId)
        try {
          const res = await fetch(`/api/menu?merchantId=${encodeURIComponent(mId)}`, { method: "GET" });
          if (res.ok) setMenuInitialData(await res.json());
        } catch {
          setMenuInitialData(null);
        }

        // Banner prefill (usa merchantId)
        try {
          const res = await fetch(`/api/banner?merchantId=${encodeURIComponent(mId)}`, { method: "GET" });
          if (res.ok) setBannerInitialData(await res.json());
        } catch {
          setBannerInitialData(null);
        }
      }

      setStep("form");
    } catch (e: any) {
      alert(e?.message || "Erro ao buscar dados.");
      resetAll();
    }
  }

  function resetAll() {
    setVendorId(null);

    setMode("create");
    setMerchantId(null);
    setEquipmentProfileId(null);

    setSheetRow(null);

    setPersonalDraft(null);
    setBankDraft(null);
    setEquipmentDraft(null);
    setMenuDraft(null);
    setBannerDraft(null);

    setEquipmentInitialData(null);
    setMenuInitialData(null);
    setBannerInitialData(null);

    setSavedMerchantId(null);
    setStep("doc");
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Header />

        {step === "doc" && (
          <DocumentLookupStep
            onContinue={(doc, mId, equipProfileId, m) => {
              void handleDocConfirmed(doc, mId, equipProfileId, m);
            }}
          />
        )}

        {step === "form" && (
          <ApprovedStep
            mode={mode}
            onBack={resetAll}
            onContinue={() => setStep("personal")}
          />
        )}

        {step === "personal" && vendorId && (
          <>
            <StepProgress current="personal" />
            <PersonalInfoStep
              key={`personal-${vendorId}`}
              vendorId={vendorId}
              sheetRow={sheetRow}
              initialData={personalDraft}
              onBack={() => setStep("form")}
              onNext={(data) => {
                setPersonalDraft((prev: any) => ({ ...(prev ?? {}), ...(data ?? {}) }));
                setStep("bank");
              }}
            />
          </>
        )}

        {step === "bank" && vendorId && (
          <>
            <StepProgress current="bank" />
            <BankInfoStep
              key={`bank-${vendorId}`}
              vendorId={vendorId}
              sheetRow={sheetRow}
              initialData={bankDraft}
              onBack={() => setStep("personal")}
              onNext={(data) => {
                setBankDraft((prev: any) => ({ ...(prev ?? {}), ...(data ?? {}) }));
                setStep("equipment");
              }}
            />
          </>
        )}

        {step === "equipment" && vendorId && (
          <>
            <StepProgress current="equipment" />
            <EquipmentStep
              key={`equipment-${vendorId}`}
              initialData={equipmentDraft ?? equipmentInitialData}
              onBack={() => setStep("bank")}
              onNext={(data) => {
                setEquipmentDraft(data);
                setStep("menu");
              }}
            />
          </>
        )}

        {/* ✅ Menu NÃO salva mais no banco. Só avança pro Banner e mantém draft */}
        {step === "menu" && vendorId && (
          <>
            <StepProgress current="menu" />
            <MenuStep
              key={`menu-${vendorId}`}
              initialData={menuDraft ?? menuInitialData}
              onBack={() => setStep("equipment")}
              onNext={(data) => {
                setMenuDraft(data);
                setStep("banner");
              }}
            />
          </>
        )}

        {/* ✅ SUBMIT FINAL acontece APENAS quando clicar em "Salvar" no Banner */}
        {step === "banner" && vendorId && (
          <>
            <StepProgress current="banner" />
            <BannerStep
              key={`banner-${vendorId}`}
              initialData={bannerDraft ?? bannerInitialData}
              onBack={() => setStep("menu")}
              onNext={async (data) => {
                // salva draft (pra voltar sem perder)
                setBannerDraft(data);

                if (!vendorId) {
                  alert("vendorId não encontrado. Volte e informe o documento novamente.");
                  setStep("doc");
                  return;
                }

                const payload = {
                  vendorId,
                  mode,
                  merchantId,
                  equipmentProfileId,

                  personalData: personalDraft,
                  bankData: bankDraft,
                  equipmentData: equipmentDraft ?? equipmentInitialData,
                  menuData: menuDraft ?? menuInitialData,
                  bannerData: data,
                };

                const res = await fetch("/api/onboarding/submit", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });

                const json = await res.json();

                if (!res.ok) {
                  alert(json?.error || "Erro ao salvar no Supabase");
                  return;
                }

                setSavedMerchantId(json.merchantId);
                setStep("success");
              }}
            />
          </>
        )}

        {step === "success" && <SuccessStep merchantId={savedMerchantId} />}
      </div>
    </main>
  );
}

function Header() {
  return (
    <div className="mb-8">
      <h1 className="mt-3 text-3xl font-extrabold text-zinc-900">
        Cadastro <span className="text-orange-500">Botecagem</span>
      </h1>
    </div>
  );
}
