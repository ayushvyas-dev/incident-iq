"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowRight, BookOpenText, Search, Siren } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Document, Evaluation, Incident, Metrics } from "@/lib/api/types";
import { ErrorBox, Heading, Loading, Panel, Status } from "@/components/ui";

function useData<T>(path: string) { return useQuery({ queryKey: [path], queryFn: () => api<T>(path) }); }
const fmt = (value: number | null) => value == null ? "—" : `${Math.round(value)} ms`;

export default function HomePage() {
  const readiness = useData<{ status: string; dependencies: Record<string, string> }>("health/ready");
  const docs = useData<{ items: Document[]; next_cursor: string | null }>("api/v1/documents?limit=5");
  const incidents = useData<{ items: Incident[]; next_cursor: string | null }>("api/v1/incidents?limit=5");
  const evaluations = useData<{ items: Evaluation[] }>("api/v1/evaluations?limit=5");
  const metrics = useData<Metrics>("api/v1/metrics/summary?window=24h");
  const queries = [readiness, docs, incidents, evaluations, metrics];
  const metricCards = [
    ["Requests · 24h", metrics.data?.requests.total ?? "—", `${metrics.data?.requests.success_rate == null ? "No sample" : `${(metrics.data.requests.success_rate * 100).toFixed(1)}% success`}`],
    ["P95 latency", fmt(metrics.data?.latency_ms.p95 ?? null), "Observed request latency"],
    ["Knowledge documents", docs.data?.items.length ?? "—", docs.data?.items.length ? "Latest returned records" : "Current page"],
    ["Fallbacks", metrics.data?.llm.fallback_count ?? "—", "LLM provider fallback count"],
  ];
  return <>
    <Heading eyebrow="Incident intelligence" title="Overview" description="A live view of investigations, knowledge, and system readiness." action={<Link href="/investigations/new" className="btn btn-primary"><Siren size={14}/> New investigation</Link>}/>
    {readiness.isLoading && <Loading/>}{readiness.isError && <ErrorBox message={readiness.error.message} retry={() => void readiness.refetch()}/>}
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metricCards.map(([label, value, note]) => <div key={String(label)} className="surface p-4"><div className="text-[11px] text-[var(--muted)]">{label}</div><div className="mt-2 text-[25px] font-semibold tracking-[-.04em]">{value}</div><div className="mt-1 text-[10px] text-[var(--muted)]">{note}</div></div>)}</div>
    <div className="mb-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]"><Panel title="Service readiness" detail="Live dependency status from the API" action={<span className="text-[10px] text-[var(--muted)]">/health/ready</span>}>{readiness.data ? <div className="space-y-3"><div className="flex items-center justify-between border-b border-[var(--line)] pb-3"><span className="text-xs">API overall</span><Status value={readiness.data.status}/></div>{Object.entries(readiness.data.dependencies || {}).map(([name, status]) => <div key={name} className="flex items-center justify-between text-xs"><span className="capitalize text-[var(--muted)]">{name.replaceAll("_", " ")}</span><Status value={status}/></div>)}</div> : <p className="text-xs text-[var(--muted)]">Readiness data is unavailable.</p>}</Panel>
      <Panel title="Quick actions" detail="Start from a real backend workflow"><div className="grid gap-2"><Link className="flex items-center gap-3 rounded-md border border-[var(--line)] p-3 hover:bg-[var(--soft)]" href="/investigations/new"><span className="flex h-8 w-8 items-center justify-center rounded bg-[var(--soft)]"><Siren size={15}/></span><span className="text-xs font-medium">Investigate an incident</span><ArrowRight size={14} className="ml-auto text-[var(--muted)]"/></Link><Link className="flex items-center gap-3 rounded-md border border-[var(--line)] p-3 hover:bg-[var(--soft)]" href="/knowledge"><span className="flex h-8 w-8 items-center justify-center rounded bg-[var(--soft)]"><BookOpenText size={15}/></span><span className="text-xs font-medium">Add operational knowledge</span><ArrowRight size={14} className="ml-auto text-[var(--muted)]"/></Link><Link className="flex items-center gap-3 rounded-md border border-[var(--line)] p-3 hover:bg-[var(--soft)]" href="/search"><span className="flex h-8 w-8 items-center justify-center rounded bg-[var(--soft)]"><Search size={15}/></span><span className="text-xs font-medium">Search indexed evidence</span><ArrowRight size={14} className="ml-auto text-[var(--muted)]"/></Link></div></Panel></div>
    <div className="grid gap-4 xl:grid-cols-2"><Panel title="Recent investigations" detail="Latest incidents returned by the API" action={<Link className="text-xs text-[var(--muted)] hover:text-[var(--ink)]" href="/investigations">View all →</Link>}>{incidents.isLoading ? <Loading/> : incidents.isError ? <ErrorBox message={incidents.error.message} retry={() => void incidents.refetch()}/> : incidents.data?.items.length ? <div className="divide-y divide-[var(--line)]">{incidents.data.items.map((item) => <Link key={item.incident_id} href={`/investigations/${item.incident_id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><div className="truncate text-xs font-medium">{item.title}</div><div className="mt-1 text-[10px] text-[var(--muted)]">{item.service} · {item.environment} · {new Date(item.created_at).toLocaleString()}</div></div><Status value={item.status}/></Link>)}</div> : <p className="text-xs text-[var(--muted)]">No incidents returned.</p>}</Panel>
      <Panel title="Knowledge & evaluations" detail="Latest backend records"><div className="space-y-4"><div><div className="mb-2 flex items-center justify-between text-[11px] font-medium"><span>Documents</span><Link href="/knowledge" className="text-[var(--muted)]">Browse →</Link></div>{docs.isLoading ? <Loading/> : docs.isError ? <ErrorBox message={docs.error.message}/> : docs.data?.items.length ? docs.data.items.slice(0, 3).map(d => <div key={d.document_id} className="flex justify-between border-t border-[var(--line)] py-2 text-[11px]"><span className="truncate">{d.filename}</span><Status value={d.status}/></div>) : <p className="text-[11px] text-[var(--muted)]">No documents returned.</p>}</div><div><div className="mb-2 flex items-center justify-between text-[11px] font-medium"><span>Evaluations</span><Link href="/evaluations" className="text-[var(--muted)]">Browse →</Link></div>{evaluations.isLoading ? <Loading/> : evaluations.isError ? <ErrorBox message={evaluations.error.message}/> : evaluations.data?.items.length ? evaluations.data.items.slice(0, 3).map(e => <div key={e.evaluation_run_id} className="flex justify-between border-t border-[var(--line)] py-2 text-[11px]"><span className="truncate">{e.experiment_name}</span><Status value={e.status}/></div>) : <p className="text-[11px] text-[var(--muted)]">No evaluations returned.</p>}</div></div></Panel></div>
    <div className="mt-4 flex items-center gap-2 text-[10px] text-[var(--muted)]"><Activity size={12}/>Overview combines live API responses; metric values are process-local to the backend instance.</div>
  </>;
}
