import { AppShell } from "@/components/app-shell";
import { Logo } from "@/components/logo";
import { NewNoteButton } from "@/components/sidebar-content";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { q } = await searchParams;
  return (
    <AppShell q={typeof q === "string" ? q : ""}>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <Logo size={64} />
        <p className="text-muted-foreground">Select a note or create a new one</p>
        <NewNoteButton />
      </div>
    </AppShell>
  );
}
