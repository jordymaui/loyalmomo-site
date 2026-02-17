import Nav from "./Nav";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav variant="header" />
      <main className="max-w-3xl mx-auto px-6 pb-20">
        {children}
      </main>
    </div>
  );
}
