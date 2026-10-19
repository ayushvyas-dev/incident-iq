"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api/client";
import { ErrorBox, Heading, Loading, Panel, Status } from "@/components/ui";

type Detail = { evaluation_run_id: string; experiment_name: string; dataset_id: string; split: string; status: string; config: Record<string, unknown>; metrics: Record<string, unknown>; error: { code: string } | null };
type Cases = { items: Array<{ case_id: string; passed?: boolean; [key: string]: unknown }> };
export default function EvaluationDetailPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const detail = useQuery({ queryKey: ["evaluation", evaluationId], queryFn: () => api<Detail>(`api/v1/evaluations/${evaluationId}`), enabled: Boolean(evaluationId), refetchInterval: q => ["queued", "processing"].includes(q.state.data?.status || "") ? 3000 : false });
  const cases = useQuery({ queryKey: ["evaluation-cases", evaluationId], queryFn: () => api<Cases>(`api/v1/evaluations/${evaluationId}/cases`), enabled: Boolean(evaluationId) });
  const metrics = detail.data?.metrics || {};
  const chart = Object.entries(metrics).filter(([,v]) => typeof v === "number").map(([name,value]) => ({ name, value: Number(value) }));
  return <><Heading eyebrow="Evaluation detail" title={detail.data?.experiment_name || "Evaluation run"} description={detail.data ? `${detail.data.dataset_id} · ${detail.data.split} · ${detail.data.evaluation_run_id}` : "Backend evaluation results and case outcomes."}/>{detail.isLoading ? <Loading/> : detail.isError ? <ErrorBox message={detail.error.message} retry={() => void detail.refetch()}/> : detail.data && <><div className="mb-4 flex gap-2"><Status value={detail.data.status}/>{detail.data.error && <span className="text-xs text-rose-600">{detail.data.error.code}</span>}</div><div className="grid gap-4 xl:grid-cols-2"><Panel title="Metrics" detail="Numeric metrics returned by the evaluation backend">{chart.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/><Bar dataKey="value" fill="#16834b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div> : <p className="text-xs text-[var(--muted)]">No numeric evaluation metrics returned yet.</p>}<pre className="mt-3 overflow-auto border-t border-[var(--line)] pt-3 text-[10px] text-[var(--muted)]">{JSON.stringify(metrics, null, 2)}</pre></Panel><Panel title="Run configuration"><pre className="max-h-80 overflow-auto whitespace-pre-wrap text-[10px] leading-5 text-[var(--muted)]">{JSON.stringify(detail.data.config, null, 2)}</pre></Panel></div></>}
    <div className="mt-4"><Panel title="Case results" detail="Per-case output returned by the evaluation API">{cases.isLoading ? <Loading/> : cases.isError ? <ErrorBox message={cases.error.message} retry={() => void cases.refetch()}/> : cases.data?.items.length ? <div className="divide-y divide-[var(--line)]">{cases.data.items.map(item => <div key={item.case_id} className="flex justify-between gap-3 py-3 text-xs"><span className="font-mono">{item.case_id}</span>{typeof item.passed === "boolean" && <Status value={item.passed ? "passed" : "failed"}/>}<pre className="max-w-[60%] overflow-auto text-[10px] text-[var(--muted)]">{JSON.stringify(item)}</pre></div>)}</div> : <p className="text-xs text-[var(--muted)]">No case results returned.</p>}</Panel></div>
  </>;
}
