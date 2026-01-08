export type PersonType = "PF" | "PJ";

export type PersonalInfo = {
  email: string;
  personType: PersonType;
  cpfCnpj: string;
  fullName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  pointOfSaleName: string;
  fullAddress: string;
};

export type BankInfo = {
  accountType: "corrente" | "poupanca";
  bankName: string;
  agency: string;
  accountNumber: string;
  holderCpfCnpj: string;
  holderName: string;
  pixKey: string;
};

export type MenuInfo = {
  machinesQty: 2 | 3;
  // categorias/produtos vêm depois
};

export type FormData = {
  personal: PersonalInfo;
  bank: BankInfo;
  menu: MenuInfo;
};
