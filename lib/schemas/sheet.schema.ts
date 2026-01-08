import { z } from "zod";

export const SheetRowSchema = z.object({
  person_type: z.string().optional(),

  pf_full_name: z.string().optional(),
  pf_cpf: z.string().optional(),
  pf_brand_name: z.string().optional(),

  pj_cnpj: z.string().optional(),
  pj_legal_representative_name: z.string().optional(),
  pj_legal_representative_cpf: z.string().optional(),
  pj_state_registration: z.string().optional(),
  pj_brand_name: z.string().optional(),

  contact_phone: z.string().optional(),
  contact_email: z.string().optional(),

  address_full: z.string().optional(),
  address_zipcode: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),

  bank_name: z.string().optional(),
  bank_agency: z.string().optional(),
  bank_account: z.string().optional(),

  pix_key: z.string().optional(),
  pix_favored_name: z.string().optional(),

  terms_accepted: z.union([z.string(), z.boolean()]).optional(),
  type_tend: z.string().optional(),
});

export const SheetRowListSchema = z.array(SheetRowSchema);

export type SheetRow = z.infer<typeof SheetRowSchema>;
