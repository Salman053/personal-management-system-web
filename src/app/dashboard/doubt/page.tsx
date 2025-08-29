import DoubtList from "@/components/doubt/doubt-list";

export default function DoubtsPage() {

  return (
    <main className=" ">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Doubt Box</h1>
        <p className="text-muted-foreground">
          Capture questions fast. Resolve with clarity. Build your knowledge
          base.
        </p>
      </header>
      <DoubtList  />
    </main>
  );
}
