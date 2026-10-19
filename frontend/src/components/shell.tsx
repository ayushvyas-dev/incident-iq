"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpenText, ChevronDown, Command, FileSearch, LayoutDashboard, Menu, Search, Siren, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Investigations", href: "/investigations", icon: Siren },
  { label: "Knowledge base", href: "/knowledge", icon: BookOpenText },
  { label: "Search", href: "/search", icon: Search },
  { label: "Evaluations", href: "/evaluations", icon: FileSearch },
  { label: "Operations", href: "/operations", icon: Activity },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen md:flex">
    <aside className={`${open ? "fixed inset-y-0 left-0 z-40 flex w-64" : "hidden"} md:fixed md:inset-y-0 md:flex md:w-60 md:flex-col border-r border-[var(--line)] bg-[var(--panel)]`}>
      <div className="flex h-16 items-center gap-3 border-b border-[var(--line)] px-5"><div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"><Command size={15}/></div><span className="text-[14px] font-semibold tracking-[-.03em]">IncidentIQ</span><button className="ml-auto md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <div className="px-3 pt-5"><button className="flex w-full items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-left text-xs text-[var(--muted)]"><span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--soft)] text-[10px] font-semibold text-[var(--ink)]">I</span>Incident workspace<ChevronDown size={13} className="ml-auto"/></button></div>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 pt-6">{nav.map(({ label, href, icon: Icon }) => { const active = href === "/" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] ${active ? "bg-[var(--soft)] font-medium" : "text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--ink)]"}`}><Icon size={16} strokeWidth={1.8}/>{label}</Link>; })}</nav>
      <div className="border-t border-[var(--line)] p-3"><div className="flex items-center gap-2 px-2 pt-1"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--soft)] text-[10px] font-semibold">IQ</div><div className="min-w-0"><div className="text-xs font-medium">Investigation team</div><div className="text-[10px] text-[var(--muted)]">Private workspace</div></div></div></div>
    </aside>
    <main className="min-w-0 flex-1 md:ml-60"><header className="sticky top-0 z-20 flex h-14 items-center border-b border-[var(--line)] bg-[var(--bg)]/95 px-4 backdrop-blur md:px-8"><button className="mr-3 md:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={19}/></button><div className="text-xs text-[var(--muted)]">Workspace <span className="mx-2 text-[var(--line)]">/</span><span className="text-[var(--ink)]">{nav.find((item) => item.href === "/" ? pathname === item.href : pathname.startsWith(item.href))?.label || "Incident"}</span></div><div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--muted)]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>Decision support</div></header><div className="mx-auto max-w-[1440px] px-4 py-7 md:px-8 md:py-9">{children}</div></main>
  </div>;
}
