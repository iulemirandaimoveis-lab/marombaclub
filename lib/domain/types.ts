export type OrderStatus =
  | "CRIADO"
  | "AGUARDANDO_PAGAMENTO"
  | "PAGO"
  | "EM_SEPARACAO"
  | "PRONTO_PARA_RETIRADA"
  | "ENVIADO"
  | "ENTREGUE"
  | "CANCELADO"
  | "REEMBOLSADO";

export type PaymentStatus =
  | "PENDENTE"
  | "AUTORIZADO"
  | "PAGO"
  | "RECUSADO"
  | "CANCELADO"
  | "ESTORNADO"
  | "EXPIRADO";
