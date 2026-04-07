import { getProjectByCode, updateProjectByCode } from "@/lib/projects";
import { createHistoricalDiagnosis, getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";
import { getUserByEmail } from "@/lib/users";
import { dbQuery } from "@/lib/db";
import { logWorkflowEvent } from "@/lib/diag-workflow";

async function main() {
  const code = process.argv[2];
  const userEmail = process.argv[3] || "admin@ironcore.local";

  if (!code) throw new Error("usage: tsx scripts/rerun-historical-diagnosis.ts <code> [userEmail]");

  const project = await getProjectByCode(code, true);
  if (!project) throw new Error(`Projeto não encontrado: ${code}`);

  await updateProjectByCode(code, {
    name: project.name,
    cnpj: project.cnpj,
    legalName: project.legal_name,
    segment: project.segment,
    partners: project.partners || [],
    timezone: project.timezone || "America/Sao_Paulo",
    accountPlan: project.account_plan || [],
    projectSummary: project.project_summary || "",
    financialProfile: {
      tx_percent: Number(project.financial_profile?.tx_percent || 0),
      float_days: Number(project.financial_profile?.float_days || 0),
      tac: Number(project.financial_profile?.tac || 0),
      cost_per_boleto: Number(project.financial_profile?.cost_per_boleto || 0),
      tax_rate: project.financial_profile?.tax_rate,
      hist_cost_rate: project.financial_profile?.hist_cost_rate,
      hist_opex_rate: project.financial_profile?.hist_opex_rate,
      hist_finance_rate: project.financial_profile?.hist_finance_rate,
      proj_cost_rate: project.financial_profile?.proj_cost_rate,
      proj_opex_rate: project.financial_profile?.proj_opex_rate,
      proj_finance_rate: project.financial_profile?.proj_finance_rate,
      hist_collection_rate: project.financial_profile?.hist_collection_rate,
      hist_payment_rate: project.financial_profile?.hist_payment_rate,
      hist_invest_rate: project.financial_profile?.hist_invest_rate,
      proj_collection_rate: project.financial_profile?.proj_collection_rate,
      proj_payment_rate: project.financial_profile?.proj_payment_rate,
      proj_invest_rate: project.financial_profile?.proj_invest_rate,
      opening_cash: project.financial_profile?.opening_cash,
    },
    supplierClasses: project.supplier_classes || [],
    workflowState: "analise_ia",
  });

  const out = await createHistoricalDiagnosis({
    projectId: project.id,
    projectCode: project.code,
    projectName: project.name,
    projectSummary: project.project_summary || "",
  });

  const dbUser = await getUserByEmail(userEmail);
  await dbQuery(
    "insert into audit_log(project_id, actor_user_id, action, entity, entity_id, after_data) values($1,$2,$3,$4,$5,$6::jsonb)",
    [project.id, dbUser?.id || null, "historical.diagnosis.run", "ai_inference_runs", String(out.inferenceId || ""), JSON.stringify(out)]
  ).catch(() => null);

  await logWorkflowEvent({
    projectId: project.id,
    stepKey: "analise_ia",
    status: "concluido",
    payload: { inferenceId: out.inferenceId, provider: out.provider, model: out.model, status: out.status },
    createdBy: dbUser?.id || null,
  });

  const latest = await getLatestHistoricalDiagnosis(project.id);
  console.log(JSON.stringify({ out, latest }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
