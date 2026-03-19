import { getProjectByCode } from "@/lib/projects";

export function projectCodeFromName(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || `projeto-${Date.now()}`;
}

export async function uniqueProjectCodeFromName(input: string) {
  const base = projectCodeFromName(input);
  let candidate = base;
  let i = 1;
  while (await getProjectByCode(candidate)) {
    i += 1;
    candidate = `${base}-${i}`.slice(0, 56);
  }
  return candidate;
}
