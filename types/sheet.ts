export type SheetRow = {
  person_type?: "PF" | "PJ" | string;

  pf_full_name?: string;
  pf_cpf?: string;
  pf_brand_name?: string;

  pj_cnpj?: string;
  pj_legal_representative_name?: string;
  pj_legal_representative_cpf?: string;
  pj_state_registration?: string;
  pj_brand_name?: string;

  contact_phone?: string;
  contact_email?: string;

  address_full?: string;
  address_zipcode?: string;
  address_city?: string;
  address_state?: string;

  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;

  pix_key?: string;
  pix_favored_name?: string;

  terms_accepted?: string | boolean;
  type_tend?: string;
};
