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

type Step = "doc" | "form" | "personal" | "bank" | "equipment" | "menu" | "success";

export default function Page() {
  const [step, setStep] = useState<Step>("doc");
  const [vendorId, setVendorId] = useState<string | null>(null);

  // dados da planilha
  const [sheetRow, setSheetRow] = useState<SheetRow | null>(null);

  // (opcional) aqui você vai guardando os dados de cada step se quiser juntar tudo no final
  const [personalData, setPersonalData] = useState<any>(null);
  const [bankData, setBankData] = useState<any>(null);
  const [equipmentData, setEquipmentData] = useState<any>(null);
  const [menuData, setMenuData] = useState<any>(null);
  const [savedMerchantId, setSavedMerchantId] = useState<string | null>(null);

  async function handleDocConfirmed(doc: string) {
    try {
      setVendorId(doc);

      const row = await findVendorByDocument(doc);

      if (!row) {
        alert("Documento não encontrado na planilha. Entre em contato com o suporte.");
        setVendorId(null);
        setSheetRow(null);
        setStep("doc");
        return;
      }

      setSheetRow(row);
      setStep("form");
    } catch (e: any) {
      alert(e?.message || "Erro ao buscar dados na planilha.");
      setVendorId(null);
      setSheetRow(null);
      setStep("doc");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Header />

        {step === "doc" && (
          <DocumentLookupStep
            onContinue={(doc) => {
              void handleDocConfirmed(doc);
            }}
          />
        )}

        {step === "form" && (
          <ApprovedStep
            onBack={() => {
              setVendorId(null);
              setSheetRow(null);
              setPersonalData(null);
              setBankData(null);
              setEquipmentData(null);
              setMenuData(null);
              setStep("doc");
            }}
            onContinue={() => {
              setStep("personal");
            }}
          />
        )}

        {step === "personal" && vendorId && (
          <>
            <StepProgress current="personal" />

            <PersonalInfoStep
              vendorId={vendorId}
              sheetRow={sheetRow}
              onBack={() => setStep("form")}
              onNext={(data) => {
                setPersonalData(data);
                setStep("bank");
              }}
            />
          </>
        )}

        {step === "bank" && vendorId && (
          <>
            <StepProgress current="bank" />

            <BankInfoStep
              vendorId={vendorId}
              sheetRow={sheetRow}
              onBack={() => setStep("personal")}
              onNext={(data) => {
                setBankData(data);
                setStep("equipment");
              }}
            />
          </>
        )}

        {step === "equipment" && (
          <>
            <StepProgress current="equipment" />

            <EquipmentStep
              onBack={() => setStep("bank")}
              onNext={(data) => {
                console.log(data)
                setEquipmentData(data);
                setStep("menu");
              }}
            />
          </>
        )}

        {step === "menu" && (
          <>
            <StepProgress current="menu" />

            <MenuStep
              onBack={() => setStep("equipment")}
              onNext={async (data) => {
                setMenuData(data);

                if (!vendorId) {
                  alert("vendorId não encontrado. Volte e informe o documento novamente.");
                  setStep("doc");
                  return;
                }

                const payload = {
                  vendorId,
                  personalData,
                  bankData,
                  equipmentData, // ✅ agora vai
                  menuData: data,
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

                setSavedMerchantId(json.merchantId); // ✅
                setStep("success"); // ✅
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
