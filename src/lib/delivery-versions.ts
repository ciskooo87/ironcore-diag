import { dbQuery } from "@/lib/db";

export async function getNextDeliveryVersion(projectId: string) {
  const q = await dbQuery<{ next_version: string }>(`select coalesce(max(version_no),0)+1 as next_version from project_delivery_versions where project_id=$1`, [projectId]);
  return Number(q.rows[0]?.next_version || 1);
}

export async function insertDeliveryVersion(input: { projectId: string; versionNo: number; finalDiagnosis: Record<string, unknown>; generatedBy?: string | null }) {
  await dbQuery(
    `insert into project_delivery_versions(project_id, version_no, final_diagnosis, generated_by) values($1,$2,$3::jsonb,$4)`,
    [input.projectId, input.versionNo, JSON.stringify(input.finalDiagnosis), input.generatedBy || null]
  );
}

export async function listDeliveryVersions(projectId: string) {
  const q = await dbQuery<{ id: string; version_no: number; generated_at: string }>(`select id, version_no, generated_at::text from project_delivery_versions where project_id=$1 order by version_no desc`, [projectId]);
  return q.rows;
}
