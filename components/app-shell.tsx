import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { SidebarContent } from "@/components/sidebar-content";
import { listNotes } from "@/lib/notes";

export async function AppShell({ q, activeId, children }: { q: string; activeId?: string; children: React.ReactNode }) {
  const notes = await listNotes(q);
  const sidebar = <SidebarContent notes={notes} q={q} activeId={activeId} />;
  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <header className="flex items-center gap-2 border-b px-3 py-2 md:hidden">
        <MobileNav>{sidebar}</MobileNav>
        <Logo />
        <span className="font-medium">Z Note</span>
      </header>
      <aside className="hidden w-72 shrink-0 border-r md:flex">{sidebar}</aside>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
