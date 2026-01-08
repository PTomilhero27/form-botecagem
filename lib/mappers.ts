import type { SheetRow } from "@/types/sheet";
import type { PersonalInfo } from "@/types/form";
import { onlyDigits } from "@/lib/normalize";

function clean(v?: string) {
  return (v ?? "").trim();
}

export function mapSheetToPersonalPrefill(
  row: SheetRow
): Partial<PersonalInfo> {
  const personType =
    clean(row.person_type).toUpperCase() === "PJ" ? "PJ" : "PF";

  const cpf = onlyDigits(clean(row.pf_cpf));
  const cnpj = onlyDigits(clean(row.pj_cnpj));

  const cpfCnpj = personType === "PJ" ? cnpj : cpf;

  const fullName =
    personType === "PJ"
      ? clean(row.pj_legal_representative_name)
      : clean(row.pf_full_name);

  const pointOfSaleName =
    personType === "PJ"
      ? clean(row.pj_brand_name)
      : clean(row.pf_brand_name);

  const address =
    clean(row.address_full) ||
    [clean(row.address_city), clean(row.address_state), clean(row.address_zipcode)]
      .filter(Boolean)
      .join(" - ");

  const prefill: Partial<PersonalInfo> = {
    personType,
  };

  if (row.contact_email) prefill.email = clean(row.contact_email);
  if (cpfCnpj) prefill.cpfCnpj = cpfCnpj;
  if (fullName) prefill.fullName = fullName;
  if (row.contact_email) prefill.responsibleEmail = clean(row.contact_email);
  if (row.contact_phone) prefill.responsiblePhone = clean(row.contact_phone);
  if (pointOfSaleName) prefill.pointOfSaleName = pointOfSaleName;
  if (address) prefill.fullAddress = address;

  return prefill;
}
