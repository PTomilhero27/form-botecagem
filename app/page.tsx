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

type Step = "doc" | "form" | "personal" | "bank" | "equipment" | "menu";

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
              onNext={(data) => {
                setMenuData(data);

                // aqui depois você salva tudo junto:
                console.log("PERSONAL", personalData);
                console.log("BANK", bankData);
                console.log("EQUIPMENT", equipmentData);
                console.log("MENU", data);

                alert("Cardápio OK ✅ (próximo: enviar tudo)");
              }}
            />
          </>
        )}
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
