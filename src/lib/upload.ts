import ExcelJS from "exceljs";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS = [".csv", ".pdf", ".xlsx", ".xls", ".xlsm"] as const;

type DebtRow = {
  type: "fidc" | "bancario";
  group: string;
  modality: string;
  overdue: number;
  upcoming: number;
  total: number;
};

type ParsedUpload = {
  faturamento: number;
  contas_receber: number;
  contas_pagar: number;
  extrato_bancario: number;
  duplicatas: number;
  debt_rows: DebtRow[];
  lines: number;
  quality: "ok" | "partial" | "weak";
  matchedFields: string[];
  unknownColumns: string[];
  warnings: string[];
};

const MAP: Record<string, keyof Omit<ParsedUpload, "lines" | "quality" | "matchedFields" | "unknownColumns" | "debt_rows" | "warnings"> | null> = {
  faturamento: "faturamento",
  faturamento_bruto: "faturamento",
  faturamento_previsto: null,
  receita: "faturamento",
  vendas: "faturamento",
  receita_bruta: "faturamento",
  valor_faturado: "faturamento",
  contas_receber: "contas_receber",
  recebiveis: "contas_receber",
  recebíveis: "contas_receber",
  carteira: "contas_receber",
  saldo_carteira: "contas_receber",
  contas_pagar: "contas_pagar",
  fornecedores: "contas_pagar",
  pagamentos: "contas_pagar",
  saldo_fornecedores: "contas_pagar",
  extrato_bancario: "extrato_bancario",
  extrato: "extrato_bancario",
  saldo: "extrato_bancario",
  saldo_final: "extrato_bancario",
  saldo_atual: "extrato_bancario",
  duplicatas: "duplicatas",
  titulos: "duplicatas",
  títulos: "duplicatas",
  saldo_devedor: "duplicatas",
};

const PDF_HINTS: Record<keyof Omit<ParsedUpload, "lines" | "quality" | "matchedFields" | "unknownColumns" | "debt_rows" | "warnings">, string[]> = {
  faturamento: ["faturamento", "receita", "vendas", "valor faturado", "receita bruta"],
  contas_receber: ["contas a receber", "a receber", "recebiveis", "recebíveis", "carteira"],
  contas_pagar: ["contas a pagar", "a pagar", "fornecedores", "pagamentos"],
  extrato_bancario: ["saldo final", "saldo atual", "extrato", "saldo"],
  duplicatas: ["duplicatas", "titulos", "títulos", "saldo devedor"],
};

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toNum(v: unknown) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const br = parseBrMoney(v);
    return br ?? 0;
  }
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function parseBrMoney(input: string): number | null {
  const raw = String(input || "").trim().replace(/R\$/gi, "").replace(/\s+/g, "");
  if (!raw) return null;

  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const n = Number(raw);
    return Number.isFinite(n) && Math.abs(n) <= 1_000_000_000_000 ? n : null;
  }

  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(raw)) {
    const normalized = raw.replace(/\./g, "").replace(/,/g, ".");
    const n = Number(normalized);
    return Number.isFinite(n) && Math.abs(n) <= 1_000_000_000_000 ? n : null;
  }

  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(raw)) {
    const normalized = raw.replace(/,/g, "");
    const n = Number(normalized);
    return Number.isFinite(n) && Math.abs(n) <= 1_000_000_000_000 ? n : null;
  }

  const cleaned = raw.replace(/\./g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  if (Math.abs(n) > 1_000_000_000_000) return null;
  return n;
}

function extractMonetaryCandidates(line: string): number[] {
  const matches = line.match(/-?\s*R\$?\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})|-?\s*\d+(?:[\.,]\d{2})/g) || [];
  const out: number[] = [];
  for (const raw of matches) {
    const n = parseBrMoney(raw);
    if (n !== null) out.push(n);
  }
  return out;
}

function detectCsvDelimiter(headerLine: string) {
  const semicolons = (headerLine.match(/;/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

function looksLikeHeader(values: string[]) {
  const normalized = values.map((v) => normalizeKey(v)).filter(Boolean);
  const score = normalized.filter((v) => v in MAP || ["tipo", "type", "projeto", "grupo", "fundo", "banco", "credor", "modalidade", "produto", "linha", "operacao", "vencido", "a_vencer", "total"].includes(v)).length;
  return score >= Math.max(2, Math.ceil(values.length * 0.35));
}

function finalize(acc: ParsedUpload): ParsedUpload {
  const score = acc.matchedFields.length + (acc.debt_rows.length ? 2 : 0);
  acc.quality = score >= 3 ? "ok" : score >= 1 ? "partial" : "weak";
  if (acc.debt_rows.length === 0 && acc.matchedFields.length === 0) acc.warnings.push("Nenhuma coluna financeira ou linha de dívida foi reconhecida.");
  if (acc.unknownColumns.length > 8) acc.warnings.push("Muitas colunas não reconhecidas; revisar layout da planilha.");
  return acc;
}

function extractDebtRows(rows: Array<Record<string, unknown>>): DebtRow[] {
  const out: DebtRow[] = [];
  for (const row of rows) {
    const normalized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) normalized[normalizeKey(k)] = v;
    const kindRaw = String(normalized.tipo || normalized.type || normalized.grupo_tipo || "").toLowerCase();
    const group = String(normalized.projeto || normalized.grupo || normalized.fundo || normalized.banco || normalized.credor || normalized.instituicao || "").trim();
    const modality = String(normalized.modalidade || normalized.produto || normalized.linha || normalized.operacao || normalized.tipo_operacao || "").trim();
    const overdue = toNum(normalized.vencido || normalized.valor_vencido || normalized.overdue || normalized.atrasado);
    const upcoming = toNum(normalized.a_vencer || normalized.avencer || normalized.valor_a_vencer || normalized.upcoming || normalized.vincendo);
    const total = toNum(normalized.total || normalized.saldo_devedor || normalized.valor_total) || overdue + upcoming;
    const inferredType = kindRaw.includes("fidc") ? "fidc" : kindRaw.includes("banco") || kindRaw.includes("banc") ? "bancario" : group.toLowerCase().includes("fidc") ? "fidc" : group ? "bancario" : "";
    if (!inferredType || !group || !modality || total <= 0) continue;
    out.push({ type: inferredType as "fidc" | "bancario", group, modality, overdue, upcoming, total });
  }
  return out;
}

function fromRows(rows: Array<Record<string, unknown>>): ParsedUpload {
  const acc: ParsedUpload = {
    faturamento: 0,
    contas_receber: 0,
    contas_pagar: 0,
    extrato_bancario: 0,
    duplicatas: 0,
    debt_rows: extractDebtRows(rows),
    lines: rows.length,
    quality: "weak",
    matchedFields: [],
    unknownColumns: [],
    warnings: [],
  };
  const matched = new Set<string>();
  const unknown = new Set<string>();
  for (const row of rows) {
    for (const [k, v] of Object.entries(row)) {
      const normalized = normalizeKey(k);
      const key = MAP[normalized] || null;
      if (key) {
        acc[key] += toNum(v);
        matched.add(key);
      } else if (normalized) {
        unknown.add(normalized);
      }
    }
  }
  if (acc.debt_rows.length) matched.add("debt_rows");
  acc.matchedFields = Array.from(matched);
  acc.unknownColumns = Array.from(unknown).slice(0, 20);
  return finalize(acc);
}

async function fromPdfBuffer(buf: Buffer): Promise<ParsedUpload> {
  const pdf = (await import("pdf-parse")).default;
  const result = await pdf(buf);
  const text = result.text || "";
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const acc: ParsedUpload = { faturamento: 0, contas_receber: 0, contas_pagar: 0, extrato_bancario: 0, duplicatas: 0, debt_rows: [], lines: lines.length, quality: "weak", matchedFields: [], unknownColumns: [], warnings: [] };
  const matched = new Set<string>();
  for (const line of lines) {
    const lower = line.toLowerCase();
    const values = extractMonetaryCandidates(line);
    if (values.length === 0) continue;
    let localMatched = false;
    for (const [field, hints] of Object.entries(PDF_HINTS) as Array<[keyof Omit<ParsedUpload, "lines" | "quality" | "matchedFields" | "unknownColumns" | "debt_rows" | "warnings">, string[]]>) {
      if (hints.some((h) => lower.includes(h))) {
        acc[field] += values[values.length - 1] || 0;
        matched.add(field);
        localMatched = true;
        break;
      }
    }
    if (!localMatched && (lower.includes("saldo") || lower.includes("extrato"))) {
      acc.extrato_bancario += values[values.length - 1] || 0;
      matched.add("extrato_bancario");
    }
  }
  if (acc.extrato_bancario === 0) {
    let sum = 0;
    for (const line of lines) {
      const vals = extractMonetaryCandidates(line);
      for (const v of vals) sum += v;
    }
    acc.extrato_bancario = sum;
  }
  acc.matchedFields = Array.from(matched);
  if (!acc.matchedFields.length) acc.warnings.push("PDF sem pistas suficientes para leitura financeira confiável.");
  return finalize(acc);
}

async function rowsFromExcel(buf: Buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Uint8Array.from(buf) as any);
  const worksheet = workbook.worksheets[0];
  const rowsMatrix: string[][] = [];
  worksheet.eachRow((row) => {
    const values: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => values.push(String(cell.text || cell.value || "").trim()));
    rowsMatrix.push(values);
  });
  const headerIndex = rowsMatrix.findIndex((row) => looksLikeHeader(row));
  const idx = headerIndex >= 0 ? headerIndex : 0;
  const headers = (rowsMatrix[idx] || []).map((v) => String(v || "").trim());
  const rows: Array<Record<string, unknown>> = [];
  for (let i = idx + 1; i < rowsMatrix.length; i++) {
    const line = rowsMatrix[i];
    const obj: Record<string, unknown> = {};
    headers.forEach((header, j) => { obj[header] = line[j] ?? ""; });
    if (Object.values(obj).some((v) => String(v || "").trim() !== "")) rows.push(obj);
  }
  return rows;
}

function rowsFromCsv(buf: Buffer) {
  const txt = buf.toString("utf-8");
  const lines = txt.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headerIndex = lines.findIndex((line) => looksLikeHeader(line.split(/[;,]/).map((s) => s.trim())));
  const idx = headerIndex >= 0 ? headerIndex : 0;
  const delimiter = detectCsvDelimiter(lines[idx] || lines[0] || ",");
  const cols = (lines[idx] || "").split(delimiter).map((s) => s.trim());
  return lines.slice(idx + 1).map((line) => {
    const parts = line.split(delimiter);
    const row: Record<string, unknown> = {};
    cols.forEach((c, i) => { row[c] = parts[i] ?? ""; });
    return row;
  });
}

export async function parseUploadedFile(file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) return fromRows(rowsFromCsv(buf));
  if (name.endsWith(".pdf")) return fromPdfBuffer(buf);
  const rows = await rowsFromExcel(buf);
  return fromRows(rows);
}

export function validateParsedUpload(kind: string, parsed: ParsedUpload) {
  const errors: string[] = [];
  const warnings = [...parsed.warnings];

  if (kind === "historico_faturamento" && parsed.faturamento <= 0) errors.push("Base de faturamento sem valor reconhecido.");
  if (kind === "historico_contas_receber" && parsed.contas_receber <= 0) errors.push("Base de CAR sem valor reconhecido.");
  if (kind === "historico_contas_pagar" && parsed.contas_pagar <= 0) errors.push("Base de CAP sem valor reconhecido.");
  if (kind === "historico_endividamento_bancos") {
    if (parsed.debt_rows.filter((row) => row.type === "bancario").length === 0 && parsed.contas_pagar <= 0 && parsed.duplicatas <= 0) errors.push("Base bancária sem dívida reconhecida.");
    if (parsed.debt_rows.some((row) => row.type === "fidc")) warnings.push("A base bancária contém linhas classificadas como FIDC; revisar arquivo.");
  }
  if (kind === "historico_endividamento_fidc") {
    if (parsed.debt_rows.filter((row) => row.type === "fidc").length === 0 && parsed.contas_receber <= 0 && parsed.extrato_bancario <= 0) errors.push("Base FIDC sem dívida reconhecida.");
    if (parsed.debt_rows.some((row) => row.type === "bancario")) warnings.push("A base FIDC contém linhas classificadas como bancário; revisar arquivo.");
  }
  if (parsed.quality === "partial") warnings.push("Leitura parcial: considere usar o template oficial para maior confiabilidade.");

  return { errors, warnings };
}

export { ALLOWED_UPLOAD_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES };
