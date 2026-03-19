export function str(value: FormDataEntryValue | null, min = 1, max = 255) {
  const text = String(value || "").trim();
  if (text.length < min || text.length > max) throw new Error("invalid_string");
  return text;
}
