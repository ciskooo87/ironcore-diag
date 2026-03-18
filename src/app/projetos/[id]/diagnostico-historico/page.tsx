import { redirect } from "next/navigation";
import { appPath } from "@/lib/app-path";
export default async function LegacyRedirect({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(appPath(`/projetos/${id}/upload-historico/`)); }
