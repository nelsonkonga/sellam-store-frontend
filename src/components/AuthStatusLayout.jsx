import { ShieldCheck } from "lucide-react";

export default function AuthStatusLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1fcf5] px-5 py-10 text-[#141e1a]">
      <section className="w-full max-w-md rounded-xl border border-[#bdc9c1] bg-white p-8 text-center shadow-[0_2px_8px_rgba(20,30,26,0.08)]">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#ddf4ea] text-[#006547]">
          <ShieldCheck size={24} />
        </div>
        <div className="mx-auto mb-5 flex items-center justify-center gap-2 font-display text-2xl font-bold text-[#006547]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#12805c] text-base text-white">S</span>Sellam 2.0</div>
        {children}
      </section>
    </main>
  );
}
