export function formatBRL(v: number | string): string {
  const n = typeof v === "string" ? Number(v) : v;
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
  } catch {
    return `R$ ${(Number(n) || 0).toFixed(2)}`.replace(".", ",");
  }
}

export function paymentLabel(code: string): string {
  switch (code) {
    case "DINHEIRO":
      return "DINHEIRO";
    case "PIX":
      return "PIX";
    case "CARTAO_DEBITO":
      return "CARTÃO DÉBITO";
    case "CARTAO_CREDITO":
      return "CARTÃO CRÉDITO";
    case "CREDITO_CLIENTE":
      return "CRÉDITO CLIENTE";
    default:
      return code || "-";
  }
}

