"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sparkles, Palette, Type, ArrowLeft, ArrowRight, Store } from "lucide-react";


export type BannerForm = {
  banner_name: string;
  theme: "classic" | "neon" | "dark";
  accent: "orange" | "blue" | "purple" | "green"; 
  tentModel: "2x2" | "3x3" | "3x6";
};

function required(v: string) {
  return v.trim().length > 0;
}

/** 1) Caminho das imagens */
const TENT_IMAGES: Record<BannerForm["tentModel"], string> = {
  "2x2": "/barracas/Barraca-2x2.png",
  "3x3": "/barracas/Barraca-3x3.png",
  "3x6": "/barracas/Barraca-3x6.png",
};

/**
 * 2) Posição do banner por modelo (em %)
 * Ajuste fino depois olhando na tela (top/left/width/height).
 */
const BANNER_SLOT: Record<
  BannerForm["tentModel"],
  { top: string; left: string; width: string; height: string; radius?: string }
> = {
  // 2x2: a faixa é mais baixa e mais “quadrada”
  "2x2": { top: "27%", left: "16%", width: "68%", height: "9%", radius: "10px" },

  // 3x3: faixa um pouco mais alta (por causa do balcão)
  "3x3": { top: "35%", left: "13%", width: "74%", height: "8%", radius: "10px" },

  // 3x6: faixa bem ampla e um pouco mais baixa
  "3x6": { top: "35%", left: "10%", width: "80%", height: "7.5%", radius: "10px" },
};

/** 3) Perspectiva leve (opcional): deixe 0deg se não quiser efeito */
const BANNER_TRANSFORM: Record<BannerForm["tentModel"], string> = {
  "2x2": "perspective(900px) rotateX(6deg) rotateY(-8deg)",
  "3x3": "perspective(900px) rotateX(6deg) rotateY(-6deg)",
  "3x6": "perspective(900px) rotateX(5deg) rotateY(-4deg)",
};

const DEFAULTS: BannerForm = {
  banner_name: "",
  theme: "classic",
  accent: "orange",
  tentModel: "3x3",
};


export function BannerStep({
  initialData,
  onBack,
  onNext,
}: {
  initialData?: Partial<BannerForm> | null;
  onBack: () => void;
  onNext: (data: BannerForm) => void;
}) {
  const prefill = useMemo<BannerForm>(() => {
    return {
      banner_name: String(initialData?.banner_name ?? "").trim(),
      theme: (initialData?.theme as any) ?? "classic",
      accent: (initialData?.accent as any) ?? "orange",
      tentModel: (initialData?.tentModel as any) ?? "3x3",
    };
  }, [initialData]);

  const [form, setForm] = useState<BannerForm>(() => prefill);

   useEffect(() => {
    if (initialData) {
      console.log(initialData)
      setForm((prev) => ({ ...prev, ...DEFAULTS, ...initialData }));
    }
  }, [initialData]);

  function update<K extends keyof BannerForm>(key: K, value: BannerForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!required(form.banner_name)) return "Digite o nome do banner.";
    if (form.banner_name.trim().length > 28) return "Nome do banner deve ter no máximo 28 caracteres.";
    return null;
  }

  function handleNext() {
    const err = validate();
    if (err) return alert(err);
    onNext({
      banner_name: form.banner_name.trim(),
      theme: form.theme,
      accent: form.accent,
      tentModel: form.tentModel,
    });
  }

  const accentCls = accentToCls(form.accent);
  const themeCls = themeToCls(form.theme);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-zinc-900">Banner</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Escolha a barraca e veja a prévia do seu banner na frente. Você pode voltar e manter suas edições.
        </p>
      </div>

      {/* MOBILE FIRST */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* PREVIEW */}
        <div className="order-1">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <Sparkles className="h-4 w-4 text-zinc-500" />
                Prévia
              </div>
              <div className="text-xs font-semibold text-zinc-500">
                {form.banner_name.trim().length || 0}/28
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4">
              {/* fundo/tema */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl opacity-40" />
                <div className={["absolute inset-0 opacity-100", themeCls.bg].join(" ")} />
              </div>

              <div className="relative">
                <div className="mx-auto w-full max-w-md">
                  <TentMockupPreview
                    model={form.tentModel}
                    title={form.banner_name.trim() || "Seu banner"}
                    titleClass={accentCls.text}
                  />
                </div>

                <div className="mt-4 text-center text-xs text-zinc-600">
                  Dica: nomes curtos ficam mais bonitos no banner 🙂
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="order-2">
          <div className="space-y-4">
            <Field label="Nome do banner" icon={<Type className="h-4 w-4" />}>
              <input
                value={form.banner_name}
                onChange={(e) => update("banner_name", e.target.value)}
                placeholder="Ex: Botecagem do João"
                className={inputCls()}
                maxLength={28}
              />
            </Field>

            <Field label="Modelo da barraca" icon={<Store className="h-4 w-4" />}>
              <div className="grid grid-cols-3 gap-2">
                <Chip active={form.tentModel === "2x2"} onClick={() => update("tentModel", "2x2")}>
                  2m x 2m
                </Chip>
                <Chip active={form.tentModel === "3x3"} onClick={() => update("tentModel", "3x3")}>
                  3m x 3m
                </Chip>
                <Chip active={form.tentModel === "3x6"} onClick={() => update("tentModel", "3x6")}>
                  3m x 6m
                </Chip>
              </div>

              <div className="mt-2 text-xs text-zinc-500">
                O banner aparece na “saia” frontal da barraca (faixa da frente).
              </div>
            </Field>

            <Field label="Tema" icon={<Sparkles className="h-4 w-4" />}>
              <div className="grid grid-cols-3 gap-2">
                <Chip active={form.theme === "classic"} onClick={() => update("theme", "classic")}>
                  Clássico
                </Chip>
                <Chip active={form.theme === "neon"} onClick={() => update("theme", "neon")}>
                  Neon
                </Chip>
                <Chip active={form.theme === "dark"} onClick={() => update("theme", "dark")}>
                  Dark
                </Chip>
              </div>
            </Field>

            <Field label="Cor" icon={<Palette className="h-4 w-4" />}>
              <div className="grid grid-cols-4 gap-2">
                <ColorDot active={form.accent === "orange"} onClick={() => update("accent", "orange")} cls="bg-orange-500" />
                <ColorDot active={form.accent === "blue"} onClick={() => update("accent", "blue")} cls="bg-sky-500" />
                <ColorDot active={form.accent === "purple"} onClick={() => update("accent", "purple")} cls="bg-violet-500" />
                <ColorDot active={form.accent === "green"} onClick={() => update("accent", "green")} cls="bg-emerald-500" />
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <button
          onClick={handleNext}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Mockup Preview (imagem + overlay) ---------------- */

function TentMockupPreview({
  model,
  title,
  titleClass,
}: {
  model: BannerForm["tentModel"];
  title: string;
  titleClass: string;
}) {
  const img = TENT_IMAGES[model];
  const slot = BANNER_SLOT[model];
  const transform = BANNER_TRANSFORM[model];

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      {/* imagem */}
      <img
        src={img}
        alt={`Barraca ${model}`}
        className="w-full h-auto rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.12)]"
        draggable={false}
      />

      {/* banner overlay */}
      <div
        className={[
          "absolute flex items-center justify-center",
          "bg-white/92 border border-black/10 shadow-sm",
          "backdrop-blur-[2px]",
          "transition-all duration-300 ease-out",
        ].join(" ")}
        style={{
          top: slot.top,
          left: slot.left,
          width: slot.width,
          height: slot.height,
          borderRadius: slot.radius ?? "10px",
          transformOrigin: "center",
          transform,
        }}
      >
        <span className={["px-2 text-center font-extrabold tracking-tight truncate", titleClass].join(" ")}>
          {title}
        </span>
      </div>

      {/* etiqueta discreta */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/15">
          Barraca {model}
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-zinc-500">{icon}</div>
        <label className="text-sm font-semibold text-zinc-900">
          {label} <span className="ml-2 text-[11px] font-semibold text-red-600">*</span>
        </label>
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-sm font-semibold transition",
        active
          ? "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-100"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ColorDot({ active, onClick, cls }: { active: boolean; onClick: () => void; cls: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-11 w-full rounded-xl border transition",
        active ? "border-zinc-900 ring-2 ring-zinc-200" : "border-zinc-200 hover:border-zinc-300",
      ].join(" ")}
      aria-label="Escolher cor"
    >
      <div className={["mx-auto h-6 w-6 rounded-full", cls].join(" ")} />
    </button>
  );
}

function inputCls() {
  return [
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900",
    "placeholder:text-zinc-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100",
  ].join(" ");
}

function accentToCls(accent: BannerForm["accent"]) {
  switch (accent) {
    case "blue":
      return { text: "text-sky-600" };
    case "purple":
      return { text: "text-violet-600" };
    case "green":
      return { text: "text-emerald-600" };
    default:
      return { text: "text-orange-600" };
  }
}

function themeToCls(theme: BannerForm["theme"]) {
  if (theme === "neon") {
    return {
      bg: "bg-gradient-to-br from-zinc-900 via-zinc-950 to-black",
    };
  }
  if (theme === "dark") {
    return {
      bg: "bg-gradient-to-br from-zinc-800 to-zinc-950",
    };
  }
  return {
    bg: "bg-gradient-to-br from-orange-50 via-white to-zinc-50",
  };
}
