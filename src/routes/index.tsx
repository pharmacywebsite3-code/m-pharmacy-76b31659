import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, Upload, ShieldCheck, Pill, HeartPulse, Bandage, Leaf, Baby,
  Stethoscope, ShoppingCart, Check, FileText, Truck, CreditCard,
  Bell, Package, RefreshCw, Clock, ChevronRight, Plus, Minus, X, Lock, LogOut, User as UserIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchMedications, ETB_PER_USD, type ExternalMedication } from "@/lib/medications.functions";

const fmtUSD = (usd: number) => `$${usd.toFixed(2)}`;
const fmtETB = (usd: number) => `${(usd * ETB_PER_USD).toFixed(2)} ETB`;
const fmtDual = (usd: number) => `${fmtUSD(usd)} / ${fmtETB(usd)}`;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PharmacistAssistant } from "@/components/PharmacistAssistant";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "M-Pharmacy — Trusted Online Pharmacy & Prescription Refills" },
      { name: "description", content: "Search medications, upload prescriptions securely, shop OTC essentials, and manage refills with M-Pharmacy." },
    ],
  }),
  component: Home,
});

const categories = [
  { name: "All Products", icon: Search, count: 12, tone: "from-slate-50 to-slate-100" },
  { name: "Wellness", icon: HeartPulse, count: 128, tone: "from-emerald-50 to-teal-50" },
  { name: "First Aid", icon: Bandage, count: 64, tone: "from-rose-50 to-orange-50" },
  { name: "Vitamins", icon: Pill, count: 212, tone: "from-amber-50 to-yellow-50" },
  { name: "Herbal", icon: Leaf, count: 87, tone: "from-green-50 to-lime-50" },
  { name: "Baby Care", icon: Baby, count: 53, tone: "from-sky-50 to-blue-50" },
  { name: "Cold & Flu", icon: Stethoscope, count: 41, tone: "from-cyan-50 to-teal-50" },
];


const refills = [
  { name: "Metformin 500mg", due: "in 3 days", progress: 80 },
  { name: "Lisinopril 10mg", due: "in 9 days", progress: 45 },
  { name: "Atorvastatin 20mg", due: "in 18 days", progress: 20 },
];

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  badge: string | null;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((p: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
    // smooth scroll to checkout
    if (typeof document !== "undefined") {
      const el = document.getElementById("checkout");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header cartCount={cartCount} />
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <PrescriptionUpload />
      <Categories />
      <ProductGrid searchQuery={searchQuery} onAdd={addToCart} />
      <Checkout cart={cart} updateQty={updateQty} removeItem={removeItem} />
      <Dashboard />
      <Footer />
      <PharmacistAssistant />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Plus className="h-5 w-5" strokeWidth={3} />
      </div>
      <span className="font-display text-xl font-extrabold tracking-tight">
        M<span className="text-primary">·</span>Pharmacy
      </span>
    </div>
  );
}

function Header({ cartCount = 0 }: { cartCount?: number }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#shop" className="hover:text-foreground">Shop</a>
          <a href="#prescription" className="hover:text-foreground">Prescriptions</a>
          <a href="#checkout" className="hover:text-foreground">Checkout</a>
          <a href="#dashboard" className="hover:text-foreground">My Account</a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" /> Licensed Pharmacy
          </div>
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              title={user.email ?? undefined}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <UserIcon className="h-3.5 w-3.5" /> Sign in
            </Link>
          )}
          <button className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-muted">
            <ShoppingCart className="h-4.5 w-4.5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-soft/60 via-background to-background" />
      <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-semibold text-primary shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5" /> HIPAA-compliant · Verified pharmacists
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Your trusted pharmacy,<br />
              <span className="text-primary">delivered to your door.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Search 12,000+ medications, upload prescriptions securely, and get expert guidance from licensed pharmacists — all in one place.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft"
            >
              <div className="flex flex-1 items-center gap-2 pl-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medications, brands, or symptoms…"
                  className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
                Search
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {["Paracetamol", "Vitamin C", "Aspirin", "Insulin", "Ventolin", "Allergy"].map((t) => (
                <button
                  key={t}
                  onClick={() => setSearchQuery(t)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground hover:border-primary hover:text-primary"
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Free delivery over $35</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Encrypted health data</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> 24/7 pharmacist chat</div>
            </div>
          </div>

          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
      <div className="rounded-3xl border border-border bg-card p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-success/10 text-success">
              <Check className="h-5 w-5" strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-semibold">Prescription verified</p>
              <p className="text-xs text-muted-foreground">By Dr. Anya Mehta, PharmD</p>
            </div>
          </div>
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">Ready</span>
        </div>

        <div className="mt-5 space-y-3">
          {[
            { name: "Amoxicillin 500mg", qty: "30 capsules", usd: 14.20 },
            { name: "Ibuprofen 200mg", qty: "60 tablets", usd: 6.80 },
          ].map((m) => (
            <div key={m.name} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.qty}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{fmtUSD(m.usd)}</p>
                <p className="text-[10px] text-muted-foreground">{fmtETB(m.usd)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Estimated delivery</p>
            <p className="text-sm font-semibold">Tomorrow, before 12pm</p>
          </div>
          <button className="rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background">Track order</button>
        </div>
      </div>
    </div>
  );
}

type PrescriptionRow = {
  id: string;
  file_name: string;
  file_size: number | null;
  status: string;
  created_at: string;
};

function PrescriptionUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  const { data: files = [] } = useQuery({
    queryKey: ["prescriptions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("id, file_name, file_size, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PrescriptionRow[];
    },
  });

  const addFiles = useCallback(async (list: FileList | null) => {
    if (!list || !user) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(list)) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("prescriptions").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) throw upErr;
        const { error: dbErr } = await supabase.from("prescriptions").insert({
          user_id: user.id,
          file_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        });
        if (dbErr) throw dbErr;
      }
      queryClient.invalidateQueries({ queryKey: ["prescriptions", user.id] });
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }, [user, queryClient]);


  async function removeFile(row: PrescriptionRow) {
    if (!user) return;
    const { data: rec } = await supabase.from("prescriptions").select("file_path").eq("id", row.id).maybeSingle();
    if (rec?.file_path) await supabase.storage.from("prescriptions").remove([rec.file_path]);
    await supabase.from("prescriptions").delete().eq("id", row.id);
    queryClient.invalidateQueries({ queryKey: ["prescriptions", user.id] });
  }

  return (
    <section id="prescription" className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-soft md:grid-cols-[1fr_1.1fr] md:p-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <FileText className="h-3.5 w-3.5" /> Prescription Upload
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            Upload, verify, refill — in minutes.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Drag and drop a photo or PDF of your prescription. Our licensed pharmacists review every submission within 30 minutes.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "End-to-end encrypted transfer",
              "Pharmacist review in under 30 min",
              "Auto-saved to your secure profile",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div>
          {!user ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface p-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold">Sign in to upload securely</p>
              <p className="mt-1 text-sm text-muted-foreground">Your prescriptions are stored in your private, encrypted profile.</p>
              <button
                onClick={() => navigate({ to: "/auth" })}
                className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
              >
                Sign in to continue
              </button>
            </div>
          ) : (
            <>
              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                className={`flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  dragging ? "border-primary bg-primary-soft/60" : "border-border bg-surface hover:border-primary/50"
                }`}
              >
                <input ref={inputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={(e) => addFiles(e.target.files)} />
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-semibold">{busy ? "Uploading…" : "Drop your prescription here"}</p>
                <p className="mt-1 text-sm text-muted-foreground">PNG, JPG or PDF · up to 10MB</p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className="mt-5 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-60"
                >
                  Browse files
                </button>
              </label>

              {error && <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}

              {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {files.map((f) => (
                    <li key={f.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">{f.file_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {f.file_size ? `${(f.file_size / 1024).toFixed(1)} KB · ` : ""}{f.status}
                        </span>
                      </div>
                      <button onClick={() => removeFile(f)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:rounded-2xl">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
              <Check className="h-7 w-7" strokeWidth={3} />
            </div>
            <DialogTitle className="mt-4 text-xl font-semibold">Prescription received</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Our pharmacist will review it shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Categories() {
  return (
    <section id="shop" className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Shop by category</h2>
          <p className="mt-2 text-muted-foreground">Browse over-the-counter essentials curated by our pharmacists.</p>
        </div>
        <a href="#" className="hidden items-center gap-1 text-sm font-semibold text-primary md:inline-flex">
          View all <ChevronRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <button key={c.name} className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-1 hover:border-primary hover:shadow-soft">
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.tone} text-foreground`}>
              <c.icon className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-4 font-semibold">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.count} products</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProductGrid({ searchQuery, onAdd }: { searchQuery: string; onAdd: (p: { id: string; name: string; price: number }) => void }) {
  const loadMedications = useServerFn(fetchMedications);
  const { data: products = [], isLoading, isFetching } = useQuery({
    queryKey: ["medications", "external"],
    queryFn: () => loadMedications({ data: {} }) as Promise<ExternalMedication[]>,
    staleTime: 60_000,
  });

  const query = searchQuery.trim().toLowerCase();
  const filtered = products.filter((p) =>
    !query ||
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {query ? (
            filtered.length === 0 ? (
              <span>No results for "<span className="font-medium text-foreground">{searchQuery}</span>".</span>
            ) : (
              <span>{filtered.length} result{filtered.length === 1 ? "" : "s"} for "<span className="font-medium text-foreground">{searchQuery}</span>"</span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? "bg-amber-500 animate-pulse" : "bg-success"}`} />
              {isFetching ? "Syncing live pricing…" : "Live pricing from pharma network"}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl border border-border bg-card" />
            ))
          : filtered.map((p) => (
              <article key={p.id} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-soft">
                <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-soft to-surface">
                  <Pill className="h-12 w-12 text-primary/70 transition duration-300 group-hover:scale-110" />
                  {p.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-soft backdrop-blur">
                      {p.badge}
                    </span>
                  )}
                  <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur ${
                    p.inStock ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                  }`}>
                    {p.inStock ? `${p.stockCount} in stock` : "Out of stock"}
                  </span>
                </div>
                <div className="mt-4 flex flex-1 flex-col">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{p.category}</p>
                  <h3 className="font-serif mt-1 text-[17px] font-medium leading-snug text-foreground">{p.name}</h3>
                  <div className="mt-auto pt-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold tracking-tight">{fmtUSD(p.amountUSD)}</span>
                      <span className="text-xs font-semibold text-muted-foreground">/ {fmtETB(p.amountUSD)}</span>
                    </div>
                    <button
                      onClick={() => onAdd({ id: p.id, name: p.name, price: p.amountUSD })}
                      disabled={!p.inStock}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}


const steps = [
  { id: 1, title: "Cart", icon: ShoppingCart },
  { id: 2, title: "Shipping", icon: Truck },
  { id: 3, title: "Payment", icon: CreditCard },
  { id: 4, title: "Confirm", icon: Check },
];

function Checkout({
  cart,
  updateQty,
  removeItem,
}: {
  cart: CartItem[];
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const total = +(subtotal + tax).toFixed(2);

  async function nextStep() {
    if (cart.length === 0) return;
    if (step === 3 && user) {
      setPlacing(true);
      try {
        await supabase.from("orders").insert({
          user_id: user.id,
          items: cart.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
          item_count: itemCount,
          total,
          status: "Processing",
        });
        queryClient.invalidateQueries({ queryKey: ["orders", user.id] });
      } finally {
        setPlacing(false);
      }
    }
    setStep(step === 4 ? 1 : step + 1);
  }

  return (
    <section id="checkout" className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Checkout simulator
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">A checkout you can trust</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Walk through every step — from cart to confirmation — in a transparent, secure flow.</p>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="grid grid-cols-4 border-b border-border bg-surface">
          {steps.map((s) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center justify-center gap-2 px-3 py-4 text-sm font-semibold transition ${
                  active ? "bg-card text-foreground" : done ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                  active ? "bg-primary text-primary-foreground" : done ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.id}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div className="min-h-[280px]">
            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Your cart</h3>
                  <span className="text-xs text-muted-foreground">
                    {itemCount} item{itemCount === 1 ? "" : "s"}
                  </span>
                </div>
                {cart.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    Your cart is empty. Tap <span className="font-semibold text-foreground">“Add to Cart”</span> on any product above to get started.
                  </div>
                ) : (
                  cart.map((i) => (
                    <div key={i.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary-soft text-primary">
                          <Pill className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{i.name}</p>
                          <p className="text-xs text-muted-foreground">{fmtDual(i.price)} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-lg border border-border">
                          <button onClick={() => updateQty(i.id, i.qty - 1)} className="grid h-8 w-8 place-items-center"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                          <button onClick={() => updateQty(i.id, i.qty + 1)} className="grid h-8 w-8 place-items-center"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button onClick={() => removeItem(i.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Shipping address</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full name" placeholder="Jane Doe" />
                  <Field label="Phone" placeholder="+1 555 0101" />
                  <Field label="Address" placeholder="221B Baker Street" className="sm:col-span-2" />
                  <Field label="City" placeholder="London" />
                  <Field label="Postal code" placeholder="NW1 6XE" />
                </div>
                <div className="rounded-xl border border-border bg-surface p-4 text-sm">
                  <p className="font-semibold">Standard delivery</p>
                  <p className="text-xs text-muted-foreground">Arrives Wed, Jul 1 — Free over $35</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Payment method</h3>
                {!user && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <Link to="/auth" className="font-semibold underline">Sign in</Link> to save this order to your account.
                  </div>
                )}
                <div className="rounded-xl border-2 border-primary bg-primary-soft/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Visa ending in 4242</span>
                    </div>
                    <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                  </div>
                </div>
                <Field label="Card number" placeholder="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry" placeholder="12 / 28" />
                  <Field label="CVC" placeholder="123" />
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Encrypted with 256-bit TLS. PCI-DSS compliant.
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="h-8 w-8" strokeWidth={3} />
                </div>
                <h3 className="mt-4 text-xl font-bold">Order confirmed</h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  {user
                    ? "We've saved this order to your dashboard and emailed your receipt."
                    : "Your order was simulated. Sign in next time to save it to your account."}
                </p>
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Order summary</h4>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label={`Items (${itemCount})`} value={fmtDual(subtotal)} />
              <Row label="Subtotal" value={fmtDual(subtotal)} />
              <Row label="Delivery" value={subtotal >= 35 || subtotal === 0 ? "Free" : fmtDual(4.99)} />
              <Row label="Tax (8%)" value={fmtDual(tax)} />
            </dl>
            <div className="my-4 border-t border-border" />
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold">Total</span>
              <div className="text-right">
                <div className="text-2xl font-extrabold leading-none">{fmtUSD(total)}</div>
                <div className="mt-1 text-xs font-semibold text-muted-foreground">{fmtETB(total)}</div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              {step > 1 && step < 4 && (
                <button onClick={() => setStep(step - 1)} className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold">
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                disabled={placing || (step < 4 && cart.length === 0)}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
              >
                {placing ? "Placing…" : step === 4 ? "Start over" : step === 3 ? "Place order" : cart.length === 0 ? "Cart empty" : "Continue"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({ label, placeholder, className = "" }: { label: string; placeholder: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

type ProfileRow = {
  full_name: string | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  item_count: number;
  total: number;
  status: string;
  created_at: string;
};

function Dashboard() {
  const { user, loading } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileRow | null;
    },
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, item_count, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []).map((o) => ({ ...o, total: Number(o.total) })) as OrderRow[];
    },
  });

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Member dashboard
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            {user ? `Welcome back, ${displayName}` : "Your dashboard awaits"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {user ? "Track recent orders and stay ahead of your refills." : "Sign in to see your orders and refill reminders."}
          </p>
        </div>
      </div>

      {!user && !loading ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-soft">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <UserIcon className="h-6 w-6" />
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Create a free M-Pharmacy account to upload prescriptions, view orders, and get refill reminders.
          </p>
          <Link
            to="/auth"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
          >
            Sign in or create account
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Recent orders</h3>
              <a href="#" className="text-sm font-semibold text-primary">See all</a>
            </div>
            <div className="mt-5 divide-y divide-border">
              {ordersLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading orders…</p>
              ) : orders.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No orders yet. Complete the checkout simulator above to log your first order.
                </p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{o.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {o.item_count} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{fmtUSD(o.total)}</p>
                      <p className="text-[10px] text-muted-foreground">{fmtETB(o.total)}</p>
                      <span className={`text-xs font-semibold ${o.status === "Delivered" ? "text-success" : "text-primary"}`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary-soft/70 to-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Refill reminders</h3>
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-5 space-y-4">
              {refills.map((r) => (
                <div key={r.name} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">Refill due {r.due}</p>
                    </div>
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${r.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">Licensed online pharmacy serving patients since 2014.</p>
        </div>
        {[
          { title: "Shop", links: ["Wellness", "Vitamins", "First Aid", "Baby Care"] },
          { title: "Services", links: ["Prescription Upload", "Refill Reminders", "Pharmacist Chat", "Insurance"] },
          { title: "Company", links: ["About", "Privacy", "Terms", "Contact"] },
        ].map((col) => (
          <div key={col.title}>
            <h5 className="text-sm font-bold">{col.title}</h5>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © 2026 M-Pharmacy · NABP-accredited · Licensed in all 50 states
      </div>
    </footer>
  );
}
