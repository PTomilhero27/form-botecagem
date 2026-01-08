"use client";

import { useMemo, useState } from "react";
import type { SheetRow } from "@/types/sheet";
import { Building2, CreditCard, Hash, KeyRound, User, Wallet } from "lucide-react";
import { BankAutocomplete } from "./BankAutocomplete";

export type BankAccountType = "corrente" | "poupanca";

export type BankForm = {
    accountType: BankAccountType; // ✅ não vem da planilha (obrigatório)

    bankName: string;
    agency: string;
    account: string;

    holderDoc: string; // cpf/cnpj do titular
    holderName: string;

    pixKey: string;
};

function required(v: string) {
    return v.trim().length > 0;
}

function onlyDigits(v: string) {
    return (v || "").replace(/\D+/g, "");
}

function pickHolderDoc(row: SheetRow | null, vendorId: string) {
    // melhor tentativa: se tiver pj_cnpj usa ele, senão pf_cpf, senão vendorId
    const pj = onlyDigits(row?.pj_cnpj || "");
    const pf = onlyDigits(row?.pf_cpf || "");
    if (pj.length >= 14) return pj;
    if (pf.length >= 11) return pf;
    return onlyDigits(vendorId || "");
}

function pickHolderName(row: SheetRow | null) {
    // melhor tentativa: pix_favored_name, senão pf_full_name, senão representante
    return (
        row?.pix_favored_name ||
        row?.pf_full_name ||
        row?.pj_legal_representative_name ||
        ""
    );
}

export function BankInfoStep({
    vendorId,
    sheetRow,
    onBack,
    onNext,
}: {
    vendorId: string;
    sheetRow: SheetRow | null;
    onBack: () => void;
    onNext: (data: BankForm) => void;
}) {
    const prefill = useMemo(() => {
        const bankName = sheetRow?.bank_name || "";
        const agency = sheetRow?.bank_agency || "";
        const account = sheetRow?.bank_account || "";

        const holderDoc = pickHolderDoc(sheetRow, vendorId);
        const holderName = pickHolderName(sheetRow);

        const pixKey = sheetRow?.pix_key || "";

        return {
            bankName,
            agency,
            account,
            holderDoc,
            holderName,
            pixKey,
        };
    }, [sheetRow, vendorId]);

    const [form, setForm] = useState<BankForm>({
        accountType: "corrente", // default (usuário pode trocar)
        bankName: prefill.bankName,
        agency: prefill.agency,
        account: prefill.account,
        holderDoc: prefill.holderDoc,
        holderName: prefill.holderName,
        pixKey: prefill.pixKey,
    });

    const disabled = {
        bankName: !!prefill.bankName,
        agency: !!prefill.agency,
        account: !!prefill.account,
        holderDoc: !!prefill.holderDoc,
        holderName: !!prefill.holderName,
        pixKey: !!prefill.pixKey,
    };

    function update<K extends keyof BankForm>(key: K, value: BankForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function validate(): string | null {
        if (!form.accountType) return "Selecione o tipo de conta.";

        if (!required(form.bankName)) return "Preencha o nome do banco.";
        if (!required(form.agency)) return "Preencha a agência.";
        if (!required(form.account)) return "Preencha o número da conta.";

        if (!required(form.holderDoc)) return "Preencha o CPF/CNPJ do titular.";
        if (!required(form.holderName)) return "Preencha o nome do titular.";

        if (!required(form.pixKey)) return "Preencha a chave Pix.";

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

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-zinc-900">Info bancária</h2>
                <p className="mt-1 text-sm text-zinc-600">
                    Todos os campos são obrigatórios. Dados encontrados foram preenchidos e bloqueados.
                </p>
            </div>

            {/* Tipo de conta */}
            <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Wallet className="h-4 w-4 text-zinc-500" />
                    Tipo de conta para repasse <span className="text-red-600">*</span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <RadioCard
                        checked={form.accountType === "corrente"}
                        onClick={() => update("accountType", "corrente")}
                        title="Conta corrente"
                        subtitle="Repasse na conta corrente."
                    />
                    <RadioCard
                        checked={form.accountType === "poupanca"}
                        onClick={() => update("accountType", "poupanca")}
                        title="Poupança"
                        subtitle="Repasse na poupança."
                    />
                </div>
            </div>

            {/* Campos */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nome do banco" icon={<Building2 className="h-4 w-4" />} disabled={disabled.bankName}>
                    <BankAutocomplete
                        value={form.bankName}
                        onChange={(v) => update("bankName", v)}
                        disabled={disabled.bankName}
                        placeholder="Digite nome ou código (ex: 341, itau)..."
                    />
                </Field>

                <Field label="Agência" icon={<Hash className="h-4 w-4" />} disabled={disabled.agency}>
                    <input
                        value={form.agency}
                        onChange={(e) => update("agency", e.target.value)}
                        disabled={disabled.agency}
                        placeholder="Ex: 1234"
                        className={inputCls(disabled.agency)}
                        type="number"
                    />
                </Field>

                <Field label="Número da conta" icon={<CreditCard className="h-4 w-4" />} disabled={disabled.account}>
                    <input
                        value={form.account}
                        onChange={(e) => update("account", e.target.value)}
                        disabled={disabled.account}
                        placeholder="Ex: 123456"
                        type="number"
                        className={inputCls(disabled.account)}
                    />
                </Field>

                <Field label="CPF/CNPJ do titular" icon={<KeyRound className="h-4 w-4" />} disabled={disabled.holderDoc}>
                    <input
                        value={form.holderDoc}
                        onChange={(e) => update("holderDoc", e.target.value)}
                        disabled={disabled.holderDoc}
                        placeholder="Somente números"
                        className={inputCls(disabled.holderDoc)}
                    />
                </Field>

                <div className="sm:col-span-2">
                    <Field label="Nome do titular" icon={<User className="h-4 w-4" />} disabled={disabled.holderName}>
                        <input
                            value={form.holderName}
                            onChange={(e) => update("holderName", e.target.value)}
                            disabled={disabled.holderName}
                            placeholder="Nome completo"
                            className={inputCls(disabled.holderName)}
                        />
                    </Field>
                </div>

                <div className="sm:col-span-2">
                    <Field label="Chave Pix" icon={<KeyRound className="h-4 w-4" />} disabled={disabled.pixKey}>
                        <input
                            value={form.pixKey}
                            onChange={(e) => update("pixKey", e.target.value)}
                            disabled={disabled.pixKey}
                            placeholder="CPF/CNPJ, e-mail, telefone ou chave aleatória"
                            className={inputCls(disabled.pixKey)}
                        />
                    </Field>
                </div>
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

function RadioCard({
    checked,
    onClick,
    title,
    subtitle,
}: {
    checked: boolean;
    onClick: () => void;
    title: string;
    subtitle: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "flex w-full flex-1 items-start gap-3 rounded-2xl border p-4 text-left transition",
                checked
                    ? "border-orange-500 bg-white ring-2 ring-orange-200"
                    : "border-zinc-200 bg-white hover:border-zinc-300",
            ].join(" ")}
        >
            <div
                className={[
                    "mt-1 h-4 w-4 rounded-full border",
                    checked ? "border-orange-500 bg-orange-500" : "border-zinc-300 bg-white",
                ].join(" ")}
            />
            <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-900">{title}</div>
                <div className="mt-1 text-xs text-zinc-600">{subtitle}</div>
            </div>
        </button>
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

function inputCls(disabled?: boolean) {
    return [
        "w-full rounded-xl border px-4 py-3 text-sm outline-none transition",
        disabled
            ? "border-zinc-200 bg-zinc-50 text-zinc-700"
            : "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500",
    ].join(" ");
}
