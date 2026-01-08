"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  MoreVertical,
  Trash2,
  Pencil,
  PackagePlus,
  X,
  AlertTriangle,
  GripVertical,
} from "lucide-react";

/* ------------------ Types ------------------ */

export type MachinesQty = 2 | 3 | number;

export type MenuProduct = {
  id: string;
  name: string;
  price: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  products: MenuProduct[];
};

export type MenuForm = {
  machinesQty: MachinesQty;
  categories: MenuCategory[];
};

/* ------------------ Utils ------------------ */

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function required(v: string) {
  return v.trim().length > 0;
}

function max40(v: string) {
  const s = v.trim();
  return s.length > 0 && s.length <= 40;
}

function moneyToNumber(v: string) {
  // aceita "12,50", "12.50", "1.234,56"
  const cleaned = (v || "")
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function formatMoneyBR(n: number) {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${n.toFixed(2)}`;
  }
}

function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function getElFromPoint(x: number, y: number) {
  return document.elementFromPoint(x, y) as HTMLElement | null;
}

/* ------------------ Main ------------------ */

export function MenuStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: MenuForm) => void;
}) {
  const [machinesMode, setMachinesMode] = useState<"2" | "3" | "other">("2");
  const [machinesOther, setMachinesOther] = useState<string>("");

  const machinesQty: MachinesQty = useMemo(() => {
    if (machinesMode === "2") return 2;
    if (machinesMode === "3") return 3;
    const n = Number(machinesOther);
    return Number.isFinite(n) ? n : 0;
  }, [machinesMode, machinesOther]);

  const [categories, setCategories] = useState<MenuCategory[]>([]);

  // menu "..." por categoria
  const [catMenuOpenId, setCatMenuOpenId] = useState<string | null>(null);

  // drag state (pointer)
  const [drag, setDrag] = useState<
    | null
    | { type: "category"; fromIndex: number; overIndex: number }
    | { type: "product"; catId: string; fromIndex: number; overIndex: number }
  >(null);

  // modais
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [addCatName, setAddCatName] = useState("");

  const [editCatOpen, setEditCatOpen] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");

  const [deleteCatOpen, setDeleteCatOpen] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const [addProdOpen, setAddProdOpen] = useState(false);
  const [addProdCatId, setAddProdCatId] = useState<string | null>(null);
  const [prodDrafts, setProdDrafts] = useState<Array<{ name: string; price: string }>>([
    { name: "", price: "" },
  ]);

  const [editProdOpen, setEditProdOpen] = useState(false);
  const [editProdCatId, setEditProdCatId] = useState<string | null>(null);
  const [editProdId, setEditProdId] = useState<string | null>(null);
  const [editProdName, setEditProdName] = useState("");
  const [editProdPrice, setEditProdPrice] = useState("");

  const [deleteProdOpen, setDeleteProdOpen] = useState(false);
  const [deleteProdCatId, setDeleteProdCatId] = useState<string | null>(null);
  const [deleteProdId, setDeleteProdId] = useState<string | null>(null);

  /* ------------------ Helpers ------------------ */

  function closeAllMenus() {
    setCatMenuOpenId(null);
  }

  // Category CRUD
  function openAddCategory() {
    closeAllMenus();
    setAddCatName("");
    setAddCatOpen(true);
  }

  function confirmAddCategory() {
    if (!required(addCatName)) return alert("Digite o nome da categoria.");
    const newCat: MenuCategory = { id: uid(), name: addCatName.trim(), products: [] };
    setCategories((prev) => [...prev, newCat]);
    setAddCatOpen(false);
  }

  function openEditCategory(catId: string) {
    closeAllMenus();
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    setEditCatId(catId);
    setEditCatName(cat.name);
    setEditCatOpen(true);
  }

  function confirmEditCategory() {
    if (!editCatId) return;
    if (!required(editCatName)) return alert("Digite o nome da categoria.");
    setCategories((prev) =>
      prev.map((c) => (c.id === editCatId ? { ...c, name: editCatName.trim() } : c))
    );
    setEditCatOpen(false);
  }

  function openDeleteCategory(catId: string) {
    closeAllMenus();
    setDeleteCatId(catId);
    setDeleteCatOpen(true);
  }

  function confirmDeleteCategory() {
    if (!deleteCatId) return;
    setCategories((prev) => prev.filter((c) => c.id !== deleteCatId));
    setDeleteCatOpen(false);
  }

  // Product CRUD
  function openAddProducts(catId: string) {
    closeAllMenus();
    setAddProdCatId(catId);
    setProdDrafts([{ name: "", price: "" }]);
    setAddProdOpen(true);
  }

  function addMoreDraft() {
    setProdDrafts((prev) => [...prev, { name: "", price: "" }]);
  }

  function updateDraft(i: number, key: "name" | "price", val: string) {
    setProdDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, [key]: val } : d)));
  }

  function confirmAddProducts() {
    if (!addProdCatId) return;

    const normalized: MenuProduct[] = [];
    for (const d of prodDrafts) {
      const name = (d.name || "").trim();
      const priceN = moneyToNumber(d.price);

      if (!required(name)) return alert("Preencha o nome do produto.");
      if (!max40(name))
        return alert(`Nome do produto deve ter no máximo 40 caracteres: "${name}"`);
      if (!Number.isFinite(priceN) || priceN <= 0)
        return alert("Preencha um valor válido (ex: 12,50).");

      normalized.push({ id: uid(), name, price: priceN });
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === addProdCatId ? { ...c, products: [...c.products, ...normalized] } : c
      )
    );

    setAddProdOpen(false);
  }

  function openEditProduct(catId: string, prodId: string) {
    closeAllMenus();
    const cat = categories.find((c) => c.id === catId);
    const prod = cat?.products.find((p) => p.id === prodId);
    if (!cat || !prod) return;

    setEditProdCatId(catId);
    setEditProdId(prodId);
    setEditProdName(prod.name);
    setEditProdPrice(String(prod.price).replace(".", ","));
    setEditProdOpen(true);
  }

  function confirmEditProduct() {
    if (!editProdCatId || !editProdId) return;

    const name = editProdName.trim();
    const priceN = moneyToNumber(editProdPrice);

    if (!required(name)) return alert("Preencha o nome do produto.");
    if (!max40(name)) return alert("Nome do produto deve ter no máximo 40 caracteres.");
    if (!Number.isFinite(priceN) || priceN <= 0)
      return alert("Preencha um valor válido (ex: 12,50).");

    setCategories((prev) =>
      prev.map((c) =>
        c.id !== editProdCatId
          ? c
          : {
              ...c,
              products: c.products.map((p) =>
                p.id === editProdId ? { ...p, name, price: priceN } : p
              ),
            }
      )
    );

    setEditProdOpen(false);
  }

  function openDeleteProduct(catId: string, prodId: string) {
    closeAllMenus();
    setDeleteProdCatId(catId);
    setDeleteProdId(prodId);
    setDeleteProdOpen(true);
  }

  function confirmDeleteProduct() {
    if (!deleteProdCatId || !deleteProdId) return;

    setCategories((prev) =>
      prev.map((c) =>
        c.id !== deleteProdCatId
          ? c
          : { ...c, products: c.products.filter((p) => p.id !== deleteProdId) }
      )
    );

    setDeleteProdOpen(false);
  }

  /* ------------------ Drag logic (categories) ------------------ */

  function startDragCategory(pointerId: number, fromIndex: number, target: HTMLElement) {
    closeAllMenus();
    target.setPointerCapture(pointerId);
    setDrag({ type: "category", fromIndex, overIndex: fromIndex });
  }

  function moveDragCategory(clientX: number, clientY: number) {
    setDrag((d) => {
      if (!d || d.type !== "category") return d;
      const el = getElFromPoint(clientX, clientY)?.closest("[data-cat-index]") as
        | HTMLElement
        | null;
      if (!el) return d;
      const over = Number(el.dataset.catIndex);
      if (!Number.isFinite(over)) return d;
      if (over === d.overIndex) return d;
      return { ...d, overIndex: over };
    });
  }

  function endDragCategory() {
    setCategories((prev) => {
      const d = drag;
      if (!d || d.type !== "category") return prev;
      if (d.fromIndex === d.overIndex) return prev;
      return arrayMove(prev, d.fromIndex, d.overIndex);
    });
    setDrag(null);
  }

  /* ------------------ Drag logic (products) ------------------ */

  function startDragProduct(
    pointerId: number,
    catId: string,
    fromIndex: number,
    target: HTMLElement
  ) {
    closeAllMenus();
    target.setPointerCapture(pointerId);
    setDrag({ type: "product", catId, fromIndex, overIndex: fromIndex });
  }

  function moveDragProduct(clientX: number, clientY: number, catId: string) {
    setDrag((d) => {
      if (!d || d.type !== "product") return d;
      if (d.catId !== catId) return d;

      const row = getElFromPoint(clientX, clientY)?.closest("[data-prod-index]") as
        | HTMLElement
        | null;
      if (!row) return d;
      if (row.dataset.prodCat !== catId) return d;

      const over = Number(row.dataset.prodIndex);
      if (!Number.isFinite(over)) return d;
      if (over === d.overIndex) return d;
      return { ...d, overIndex: over };
    });
  }

  function endDragProduct() {
    setCategories((prev) => {
      const d = drag;
      if (!d || d.type !== "product") return prev;

      return prev.map((c) => {
        if (c.id !== d.catId) return c;
        if (d.fromIndex === d.overIndex) return c;
        return { ...c, products: arrayMove(c.products, d.fromIndex, d.overIndex) };
      });
    });
    setDrag(null);
  }

  /* ------------------ Validation & Next ------------------ */

  function validateAll(): string | null {
    if (!machinesQty || machinesQty < 1) return "Selecione a quantidade de máquinas.";
    if (!categories.length) return "Adicione pelo menos 1 categoria.";

    for (const c of categories) {
      if (!required(c.name)) return "Categoria sem nome.";
      if (!c.products.length) return `A categoria "${c.name}" precisa ter pelo menos 1 produto.`;
      for (const p of c.products) {
        if (!max40(p.name)) return `Produto "${p.name}" excede 40 caracteres.`;
        if (!Number.isFinite(p.price) || p.price <= 0) return `Produto "${p.name}" com preço inválido.`;
      }
    }
    return null;
  }

  function handleNext() {
    const err = validateAll();
    if (err) return alert(err);

    onNext({
      machinesQty,
      categories,
    });
  }

  /* ------------------ Render ------------------ */

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-zinc-900">Cardápio</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Cadastre as categorias e produtos. Nome do produto: <b>máx. 40 caracteres</b>.
        </p>
      </div>

      {/* Máquinas */}
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">
          Quantidade de maquininhas <span className="text-red-600">*</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <RadioCard
            checked={machinesMode === "2"}
            onClick={() => setMachinesMode("2")}
            title="2"
            subtitle="2 terminais"
          />
          <RadioCard
            checked={machinesMode === "3"}
            onClick={() => setMachinesMode("3")}
            title="3"
            subtitle="3 terminais"
          />
          <RadioCard
            checked={machinesMode === "other"}
            onClick={() => setMachinesMode("other")}
            title="Outro"
            subtitle="Definir manualmente"
          />
        </div>

        {machinesMode === "other" && (
          <div className="mt-3 max-w-xs">
            <input
              value={machinesOther}
              onChange={(e) => setMachinesOther(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Ex: 4"
              className={inputCls()}
              inputMode="numeric"
            />
          </div>
        )}
      </div>

      {/* Categorias header */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-900">
          Categorias <span className="text-red-600">*</span>
        </div>

        <button
          type="button"
          onClick={openAddCategory}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Adicionar categoria
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {!categories.length && (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            Nenhuma categoria adicionada ainda.
          </div>
        )}

        {categories.map((cat, idx) => {
          const isOverCat = drag?.type === "category" && drag.overIndex === idx;

          return (
            <div
              key={cat.id}
              data-cat-index={idx}
              className={[
                "rounded-2xl border bg-white transition",
                isOverCat ? "border-orange-400 ring-2 ring-orange-100" : "border-zinc-200",
              ].join(" ")}
            >
              {/* Header categoria */}
              <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  {/* Drag handle categoria */}
                  <button
                    type="button"
                    className="touch-none rounded-lg p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                    aria-label="Arrastar categoria"
                    onPointerDown={(e) =>
                      startDragCategory(e.pointerId, idx, e.currentTarget as HTMLElement)
                    }
                    onPointerMove={(e) => {
                      if (!drag || drag.type !== "category") return;
                      moveDragCategory(e.clientX, e.clientY);
                    }}
                    onPointerUp={() => {
                      if (!drag || drag.type !== "category") return;
                      endDragCategory();
                    }}
                  >
                    <GripVertical className="h-5 w-5" />
                  </button>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-zinc-900">{cat.name}</div>
                    <div className="mt-0.5 text-xs text-zinc-600">{cat.products.length} produto(s)</div>
                  </div>
                </div>

                {/* menu ... */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCatMenuOpenId((prev) => (prev === cat.id ? null : cat.id))}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {catMenuOpenId === cat.id && (
                    <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                      <MenuItem
                        icon={<Pencil className="h-4 w-4" />}
                        label="Editar categoria"
                        onClick={() => openEditCategory(cat.id)}
                      />
                      <MenuItem
                        icon={<PackagePlus className="h-4 w-4" />}
                        label="Adicionar produto"
                        onClick={() => openAddProducts(cat.id)}
                      />
                      <MenuItem
                        icon={<Trash2 className="h-4 w-4 text-red-600" />}
                        label={<span className="text-red-600">Excluir categoria</span>}
                        onClick={() => openDeleteCategory(cat.id)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Produtos */}
              <div className="px-4 py-3">
                {!cat.products.length ? (
                  <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                    Nenhum produto ainda. Use “Adicionar produto”.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cat.products.map((p, pIdx) => {
                      const isOverProd =
                        drag?.type === "product" &&
                        drag.catId === cat.id &&
                        drag.overIndex === pIdx;

                      return (
                        <div
                          key={p.id}
                          data-prod-index={pIdx}
                          data-prod-cat={cat.id}
                          className={[
                            "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition",
                            isOverProd
                              ? "border-orange-400 bg-orange-50/40"
                              : "border-zinc-200 bg-white",
                          ].join(" ")}
                        >
                          <div className="flex min-w-0 items-start gap-2">
                            {/* Drag handle produto */}
                            <button
                              type="button"
                              className="touch-none rounded-lg p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                              aria-label="Arrastar produto"
                              onPointerDown={(e) =>
                                startDragProduct(
                                  e.pointerId,
                                  cat.id,
                                  pIdx,
                                  e.currentTarget as HTMLElement
                                )
                              }
                              onPointerMove={(e) => {
                                if (!drag || drag.type !== "product") return;
                                moveDragProduct(e.clientX, e.clientY, cat.id);
                              }}
                              onPointerUp={() => {
                                if (!drag || drag.type !== "product") return;
                                endDragProduct();
                              }}
                            >
                              <GripVertical className="h-4 w-4" />
                            </button>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-zinc-900">
                                {p.name}{" "}
                                <span className="ml-2 text-xs font-semibold text-zinc-500">
                                  ({p.name.length}/40)
                                </span>
                              </div>
                              <div className="mt-0.5 text-xs text-zinc-600">
                                {formatMoneyBR(p.price)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditProduct(cat.id, p.id)}
                              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteProduct(cat.id, p.id)}
                              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-50 hover:text-red-600"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ações */}
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

      {/* ------------------ MODAIS ------------------ */}

      <Modal open={addCatOpen} onClose={() => setAddCatOpen(false)} title="Adicionar categoria">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-900">
            Nome da categoria <span className="text-red-600">*</span>
          </label>

          <input
            value={addCatName}
            onChange={(e) => setAddCatName(e.target.value)}
            placeholder="Ex: Hamburguer"
            className={inputCls()}
          />

          <div className="flex justify-end gap-2">
            <BtnGhost onClick={() => setAddCatOpen(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={confirmAddCategory}>Salvar</BtnPrimary>
          </div>
        </div>
      </Modal>

      <Modal open={editCatOpen} onClose={() => setEditCatOpen(false)} title="Editar categoria">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-900">
            Nome da categoria <span className="text-red-600">*</span>
          </label>

          <input
            value={editCatName}
            onChange={(e) => setEditCatName(e.target.value)}
            placeholder="Ex: Pizza"
            className={inputCls()}
          />

          <div className="flex justify-end gap-2">
            <BtnGhost onClick={() => setEditCatOpen(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={confirmEditCategory}>Salvar</BtnPrimary>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteCatOpen}
        onClose={() => setDeleteCatOpen(false)}
        title="Excluir categoria"
        description="Essa ação é permanente. Não será possível voltar."
        confirmText="Excluir"
        onConfirm={confirmDeleteCategory}
      />

      <Modal open={addProdOpen} onClose={() => setAddProdOpen(false)} title="Adicionar produto(s)">
        <div className="space-y-3">
          <div className="text-sm text-zinc-600">
            Preencha os produtos e valores. Nome: <b>máx. 40</b>.
          </div>

          <div className="space-y-3">
            {prodDrafts.map((d, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-zinc-800">
                    Nome do produto <span className="text-red-600">*</span>
                  </label>

                  <input
                    value={d.name}
                    onChange={(e) => updateDraft(i, "name", e.target.value)}
                    placeholder="Ex: Burger artesanal"
                    className={inputCls("mt-1")}
                  />

                  <div className="mt-1 text-[11px] text-zinc-500">{d.name.length}/40</div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-800">
                    Valor (R$) <span className="text-red-600">*</span>
                  </label>

                  <input
                    value={d.price}
                    onChange={(e) => updateDraft(i, "price", e.target.value)}
                    placeholder="Ex: 35,00"
                    className={inputCls("mt-1")}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={addMoreDraft}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              <Plus className="h-4 w-4" />
              Adicionar mais um produto
            </button>

            <div className="flex justify-end gap-2">
              <BtnGhost onClick={() => setAddProdOpen(false)}>Cancelar</BtnGhost>
              <BtnPrimary onClick={confirmAddProducts}>Salvar</BtnPrimary>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={editProdOpen} onClose={() => setEditProdOpen(false)} title="Editar produto">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-900">
            Nome do produto <span className="text-red-600">*</span>
          </label>

          <input
            value={editProdName}
            onChange={(e) => setEditProdName(e.target.value)}
            placeholder="Ex: Refrigerante"
            className={inputCls()}
          />

          <div className="text-[11px] text-zinc-500">{editProdName.length}/40</div>

          <label className="text-sm font-semibold text-zinc-900">
            Valor (R$) <span className="text-red-600">*</span>
          </label>

          <input
            value={editProdPrice}
            onChange={(e) => setEditProdPrice(e.target.value)}
            placeholder="Ex: 12,50"
            className={inputCls()}
          />

          <div className="flex justify-end gap-2">
            <BtnGhost onClick={() => setEditProdOpen(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={confirmEditProduct}>Salvar</BtnPrimary>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteProdOpen}
        onClose={() => setDeleteProdOpen(false)}
        title="Excluir produto"
        description="Essa ação é permanente. Não será possível voltar."
        confirmText="Excluir"
        onConfirm={confirmDeleteProduct}
      />
    </div>
  );
}

/* ------------------ UI components ------------------ */

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

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-900 hover:bg-zinc-50"
    >
      <span className="text-zinc-500">{icon}</span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="relative z-10 w-[92vw] max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  onClose,
  title,
  description,
  confirmText,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="relative z-10 w-[92vw] max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-orange-50 p-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
            <p className="mt-1 text-sm text-zinc-600">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function BtnPrimary({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
    >
      {children}
    </button>
  );
}

function BtnGhost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
    >
      {children}
    </button>
  );
}

/* ------------------ Styling helpers ------------------ */

function inputCls(extra?: string) {
  return [
    extra ?? "",
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900",
    "placeholder:text-zinc-500 shadow-sm outline-none transition",
    "focus:border-orange-500 focus:ring-4 focus:ring-orange-100",
  ]
    .join(" ")
    .trim();
}
