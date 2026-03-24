import ExcelJS from "exceljs";

function buildRows(kind: string) {
  switch (kind) {
    case "historico_faturamento":
      return {
        headers: ["competencia", "faturamento"],
        rows: [["2026-01", 180000], ["2026-02", 195000], ["2026-03", 205000]],
      };
    case "historico_contas_receber":
      return {
        headers: ["cliente", "titulo", "vencimento", "contas_receber"],
        rows: [["Cliente A", "NF-1001", "2026-03-15", 45000], ["Cliente B", "NF-1002", "2026-03-22", 62000]],
      };
    case "historico_contas_pagar":
      return {
        headers: ["fornecedor", "documento", "vencimento", "contas_pagar"],
        rows: [["Fornecedor A", "BOL-2001", "2026-03-10", 38000], ["Fornecedor B", "BOL-2002", "2026-03-25", 57000]],
      };
    case "historico_endividamento_bancos":
      return {
        headers: ["tipo", "projeto", "modalidade", "vencido", "a_vencer", "total"],
        rows: [["bancario", "Santander", "Capital de Giro", 41000, 164000, 205000], ["bancario", "Itaú", "Conta Garantida", 28000, 137000, 165000]],
      };
    case "historico_endividamento_fidc":
      return {
        headers: ["tipo", "projeto", "modalidade", "vencido", "a_vencer", "total"],
        rows: [["fidc", "FIDC NP Multissetorial Alpha", "Cota Sênior", 18000, 142000, 160000], ["fidc", "FIDC Mercantil Brasil", "Cota Subordinada", 9000, 86000, 95000]],
      };
    default:
      return { headers: ["coluna_1", "coluna_2"], rows: [["valor_1", "valor_2"]] };
  }
}

export async function buildUploadTemplate(kind: string, label: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Modelo");
  const { headers, rows } = buildRows(kind);
  sheet.addRow(headers);
  rows.forEach((row) => sheet.addRow(row));
  sheet.columns = headers.map((header) => ({ header, key: header, width: 24 }));

  const info = workbook.addWorksheet("Instrucoes");
  info.addRow([`Modelo oficial: ${label}`]);
  info.addRow([]);
  info.addRow(["Regras"]);
  info.addRow(["1. Mantenha os cabeçalhos exatamente como no modelo."]);
  info.addRow(["2. Não misture tipos de base no mesmo arquivo."]);
  info.addRow(["3. Para dívida, use tipo/projeto/modalidade/vencido/a_vencer/total."]);
  info.columns = [{ width: 90 }];

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
