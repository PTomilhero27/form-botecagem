import { onlyDigits } from "./normalize";

export function isValidCnpj(cnpj: string) {
  const s = onlyDigits(cnpj);
  if (s.length !== 14) return false;

  // rejeita sequências iguais (000... / 111... etc.)
  if (/^(\d)\1+$/.test(s)) return false;

  const calcDV = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += Number(base[i]) * weights[i];
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base12 = s.slice(0, 12);
  const dv1 = calcDV(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const base13 = base12 + String(dv1);
  const dv2 = calcDV(base13, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return s === base12 + String(dv1) + String(dv2);
}
