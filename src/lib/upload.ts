import * as XLSX from "xlsx";

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
};

const MAP: Record<string, keyof Omit<ParsedUpload, "lines" | "quality" | "matchedFields" | "unknownColumns" | "debt_rows"> | null> = {
  faturamento: "faturamento",
  receita: "faturamento",
  vendas: "faturamento",
  contas_receber: "contas_receber",
  recebiveis: "contas_receber",
  recebíveis: "contas_receber",
  contas_pagar: "contas_pagar",
  fornecedores: "contas_pagar",
  pagamentos: "contas_pagar",
  extrato_bancario: "extrato_bancario",
  extrato: "extrato_bancario",
  saldo: "extrato_bancario",
  duplicatas: "duplicatas",
  titulos: "duplicatas",
  títulos: "duplicatas",
};

const PDF_HINTS: Record<keyof Omit<ParsedUpload, "lines" | "quality" | "matchedFields" | "unknownColumns" | "debt_rows">, string[]> = {
  faturamento: ["faturamento", "receita", "vendas", "valor faturado"],
  contas_receber: ["contas a receber", "a receber", "recebiveis", "recebíveis"],
  contas_pagar: ["contas a pagar", "a pagar", "fornecedores", "pagamentos"],
  extrato_bancario: ["saldo final", "saldo atual", "extrato", "saldo"],
  duplicatas: ["duplicatas", "titulos", "títulos"],
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
  const cleaned = input
    .replace(/R\$/gi, "")
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");

  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
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

function finalize(acc: ParsedUpload): ParsedUpload {
  const score = acc.matchedFields.length + (acc.debt_rows.length ? 2 : 0);
  acc.quality = score >= 3 ? "ok" : score >= 1 ? "partial" : "weak";
  return acc;
}

function extractDebtRows(rows: Array<Record<string, unknown>>): DebtRow[] {
  const out: DebtRow[] = [];
  for (const row of rows) {
    const normalized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) normalized[normalizeKey(k)] = v;

    const kindRaw = String(normalized.tipo || normalized.type || normalized.grupo_tipo || "").toLowerCase();
    const group = String(normalized.projeto || normalized.grupo || normalized.fundo || normalized.banco || normalized.credor || "").trim();
    const modality = String(normalized.modalidade || normalized.produto || normalized.linha || normalized.operacao || "").trim();
    const overdue = toNum(normalized.vencido || normalized.valor_vencido || normalized.overdue);
    const upcoming = toNum(normalized.a_vencer || normalized.avencer || normalized.valor_a_vencer || normalized.upcoming);
    const total = toNum(normalized.total || normalized.saldo_devedor || normalized.valor_total) || overdue + upcoming;

    const inferredType = kindRaw.includes("fidc")
      ? "fidc"
      : kindRaw.includes("banco") || kindRaw.includes("banc")
        ? "bancario"
        : group.toLowerCase().includes("fidc")
          ? "fidc"
          : group
            ? "bancario"
            : "";

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

  const acc: ParsedUpload = {
    faturamento: 0,
    contas_receber: 0,
    contas_pagar: 0,
    extrato_bancario: 0,
    duplicatas: 0,
    debt_rows: [],
    lines: lines.length,
    quality: "weak",
    matchedFields: [],
    unknownColumns: [],
  };
  const matched = new Set<string>();

  for (const line of lines) {
    const lower = line.toLowerCase();
    const values = extractMonetaryCandidates(line);
    if (values.length === 0) continue;

    let localMatched = false;
    for (const [field, hints] of Object.entries(PDF_HINTS) as Array<[keyof Omit<ParsedUpload, "lines" | "quality" | "matchedFields" | "unknownColumns" | "debt_rows">, string[]]>) {
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
  return finalize(acc);
}

export async function parseUploadedFile(file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const txt = buf.toString("utf-8");
    const [head, ...lines] = txt.split(/\r?\n/).filter(Boolean);
    const cols = head.split(",").map((s) => s.trim());
    const rows = lines.map((line) => {
      const parts = line.split(",");
      const row: Record<string, unknown> = {};
      cols.forEach((c, i) => {
        row[c] = parts[i] ?? "";
      });
      return row;
    });
    return fromRows(rows);
  }

  if (name.endsWith(".pdf")) {
    return fromPdfBuffer(buf);
  }

  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  return fromRows(rows);
}

export { ALLOWED_UPLOAD_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES };
