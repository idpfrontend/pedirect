import { Nav } from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6">{children}</main>
    </div>
  );
}
