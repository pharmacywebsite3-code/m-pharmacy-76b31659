import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, Upload, ShieldCheck, Pill, HeartPulse, Bandage, Leaf, Baby,
  Stethoscope, ShoppingCart, Check, FileText, Truck, CreditCard,
  Bell, Package, RefreshCw, Clock, ChevronRight, Plus, Minus, X, Lock, LogOut, User as UserIcon,
  Languages, AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/useLanguage";
import { useCurrency, type Currency } from "@/hooks/useCurrency";
import { fetchMedications, ETB_PER_USD, type ExternalMedication } from "@/lib/medications.functions";
import { placeOrder } from "@/lib/orders.functions";

// Currency-aware price formatting.
function formatPrice(usd: number, currency: Currency): string {
  if (currency === "ETB") {
    return `${(usd * ETB_PER_USD).toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB`;
  }
  return `$${usd.toFixed(2)}`;
}
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
  { name: "All Products", icon: Search, tone: "from-slate-50 to-slate-100" },
  { name: "Wellness", icon: HeartPulse, tone: "from-emerald-50 to-teal-50" },
  { name: "First Aid", icon: Bandage, tone: "from-rose-50 to-orange-50" },
  { name: "Vitamins", icon: Pill, tone: "from-amber-50 to-yellow-50" },
  { name: "Herbal", icon: Leaf, tone: "from-green-50 to-lime-50" },
  { name: "Baby Care", icon: Baby, tone: "from-sky-50 to-blue-50" },
  { name: "Cold & Flu", icon: Stethoscope, tone: "from-cyan-50 to-teal-50" },
];


const refills = [
  { name: "Metformin 500mg", due: "in 3 days", progress: 80 },
  { name: "Lisinopril 10mg", due: "in 9 days", progress: 45 },
  { name: "Atorvastatin 20mg", due: "in 18 days", progress: 20 },
];

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  isPrescriptionRequired: boolean;
  dosage: string;
  packSize: string;
};

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((p: Omit<CartItem, "qty">) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
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
      <VideoSplash />
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <PrescriptionUpload />
      <Categories activeCategory={activeCategory} onSelect={setActiveCategory} />
      <ProductGrid searchQuery={searchQuery} activeCategory={activeCategory} onAdd={addToCart} />
      <Checkout cart={cart} updateQty={updateQty} removeItem={removeItem} />
      <Dashboard />
      <Footer />
      <PharmacistAssistant />
    </div>
  );
}


function VideoSplash() {
  const { t, language } = useLanguage();
  const scrollToShop = () => {
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section
      aria-label="Trusted pharmacy intro"
      className="relative isolate mx-auto mt-4 max-w-[1400px] overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary-soft via-background to-accent/40 shadow-soft"
      style={{ height: "min(78vh, 640px)" }}
    >
      {/* Animated background scene (CSS/SVG motion graphics) */}
      <div className="absolute inset-0 -z-10">
        {/* Ambient gradient blobs */}
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl splash-drift" />
        <div className="absolute -right-24 top-16 h-[28rem] w-[28rem] rounded-full bg-success/25 blur-3xl splash-drift-slow" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-accent/60 blur-3xl splash-drift" />

        {/* Floating capsules */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <linearGradient id="pill1" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="oklch(0.65 0.14 175)" />
              <stop offset="1" stopColor="oklch(0.85 0.06 175)" />
            </linearGradient>
            <linearGradient id="pill2" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="oklch(0.72 0.14 155)" />
              <stop offset="1" stopColor="oklch(0.92 0.05 155)" />
            </linearGradient>
          </defs>
          <g className="splash-float-a" style={{ transformOrigin: "150px 180px" }}>
            <rect x="80" y="150" width="140" height="56" rx="28" fill="url(#pill1)" opacity="0.85" />
            <line x1="150" y1="150" x2="150" y2="206" stroke="white" strokeWidth="2" opacity="0.6" />
          </g>
          <g className="splash-float-b" style={{ transformOrigin: "1050px 520px" }}>
            <rect x="960" y="480" width="120" height="48" rx="24" fill="url(#pill2)" opacity="0.8" transform="rotate(-25 1020 504)" />
          </g>
          <g className="splash-float-c" style={{ transformOrigin: "1080px 140px" }}>
            <circle cx="1080" cy="140" r="34" fill="url(#pill1)" opacity="0.75" />
          </g>
          <g className="splash-float-a" style={{ transformOrigin: "120px 560px" }}>
            <circle cx="120" cy="560" r="22" fill="url(#pill2)" opacity="0.7" />
          </g>

          {/* Delivery route line */}
          <path
            d="M -20 500 Q 300 420 600 500 T 1220 460"
            fill="none"
            stroke="oklch(0.58 0.13 175)"
            strokeWidth="2"
            strokeDasharray="6 10"
            opacity="0.45"
            className="splash-dash"
          />
        </svg>
      </div>

      {/* Soft white overlay for legibility */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background/85 via-background/30 to-background/50" />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        {/* Trust chips */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 splash-fade" style={{ animationDelay: "0.1s" }}>
          {[
            { label: t("splash.chip1"), icon: "🚚" },
            { label: t("splash.chip2"), icon: "🛡️" },
            { label: t("splash.chip3"), icon: "✨" },
          ].map((c) => (
            <span
              key={c.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur"
            >
              <span>{c.icon}</span> {c.label}
            </span>
          ))}
        </div>

        <h1
          className="max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground splash-fade sm:text-5xl md:text-6xl"
          style={{
            animationDelay: "0.25s",
            fontFamily: language === "am" ? "'Noto Sans Ethiopic', system-ui, sans-serif" : undefined,
          }}
        >
          {t("splash.titleLead")}{" "}
          <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            {t("splash.titleHighlight")}
          </span>
          .
          <br />
          <span className="text-2xl font-medium text-muted-foreground sm:text-3xl md:text-4xl">
            {t("splash.subtitle")}
          </span>
        </h1>

        <div className="mt-8 splash-fade" style={{ animationDelay: "0.65s" }}>
          <button
            type="button"
            onClick={scrollToShop}
            className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-success px-8 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-lg"
            style={{ fontFamily: language === "am" ? "'Noto Sans Ethiopic', system-ui, sans-serif" : undefined }}
          >
            <span>{t("splash.cta")}</span>
            <svg
              className="ml-1 h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Scroll hint */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 splash-fade" style={{ animationDelay: "1s" }}>
          <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-primary/40 p-1">
            <div className="h-2 w-1 rounded-full bg-primary splash-scroll" />
          </div>
        </div>
      </div>
    </section>
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
  const { language, setLanguage, t } = useLanguage();
  const { currency, toggle: toggleCurrency } = useCurrency();
  const [badgePop, setBadgePop] = useState(false);

  // Animate the cart badge every time the count changes.
  useEffect(() => {
    if (cartCount === 0) return;
    setBadgePop(true);
    const id = window.setTimeout(() => setBadgePop(false), 350);
    return () => window.clearTimeout(id);
  }, [cartCount]);

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#shop" className="transition-colors duration-300 hover:text-foreground">{t("nav.shop")}</a>
          <a href="#prescription" className="transition-colors duration-300 hover:text-foreground">{t("nav.prescriptions")}</a>
          <a href="#checkout" className="transition-colors duration-300 hover:text-foreground">{t("nav.checkout")}</a>
          <a href="#dashboard" className="transition-colors duration-300 hover:text-foreground">{t("nav.account")}</a>
        </nav>
        <div className="flex items-center gap-2">
          {/* Language switcher — EN | አማ */}
          <div
            role="group"
            aria-label="Language"
            className="hidden items-center overflow-hidden rounded-full border border-border bg-card text-xs font-semibold shadow-sm sm:inline-flex"
          >
            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              className={`px-2.5 py-1.5 transition-all duration-300 ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              EN
            </button>
            <span className="h-4 w-px bg-border" aria-hidden />
            <button
              type="button"
              onClick={() => setLanguage("am")}
              aria-pressed={language === "am"}
              style={{ fontFamily: "'Noto Sans Ethiopic', system-ui, sans-serif" }}
              className={`px-2.5 py-1.5 transition-all duration-300 ${language === "am" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              አማ
            </button>
          </div>

          {/* Currency switcher — USD | ETB */}
          <button
            type="button"
            onClick={toggleCurrency}
            aria-label="Toggle currency"
            className="hidden items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all duration-300 hover:bg-muted hover:scale-105 sm:inline-flex"
            title={currency === "USD" ? "Switch to ETB" : "Switch to USD"}
          >
            <Languages className="h-3.5 w-3.5 text-primary" />
            <span className={currency === "USD" ? "text-primary" : "text-muted-foreground"}>USD</span>
            <span className="text-muted-foreground">·</span>
            <span className={currency === "ETB" ? "text-primary" : "text-muted-foreground"}>ETB</span>
          </button>

          <div className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" /> {t("nav.licensed")}
          </div>
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:bg-muted hover:scale-105"
              title={user.email ?? undefined}
            >
              <LogOut className="h-3.5 w-3.5" /> {t("nav.signOut")}
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90 hover:scale-105"
            >
              <UserIcon className="h-3.5 w-3.5" /> {t("nav.signIn")}
            </Link>
          )}
          <a
            href="#checkout"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-all duration-300 hover:bg-muted hover:scale-105"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span
                key={cartCount}
                className={`absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-md transition-transform duration-300 ${badgePop ? "scale-125" : "scale-100"} animate-fade-in`}
              >
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  const { t, language } = useLanguage();
  const amFont = language === "am" ? "'Noto Sans Ethiopic', system-ui, sans-serif" : undefined;
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-soft/90 via-background to-white" />
      <div className="absolute -left-20 -top-20 -z-10 h-[600px] w-[600px] rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute right-0 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-success/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm animate-fade-in">
              <ShieldCheck className="h-3.5 w-3.5" /> {t("hero.chip")}
            </div>
            <h1
              className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl"
              style={{ fontFamily: amFont }}
            >
              {t("hero.title")}<br />
              <span className="text-primary">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg" style={{ fontFamily: amFont }}>
              {t("hero.description")}
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex items-center gap-2 rounded-2xl border border-border bg-card/90 p-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex flex-1 items-center gap-2 pl-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hero.searchPlaceholder")}
                  className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                  style={{ fontFamily: amFont }}
                />
              </div>
              <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:opacity-90 hover:scale-105">
                {t("hero.search")}
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {["Paracetamol", "Vitamin C", "Aspirin", "Insulin", "Ventolin", "Allergy"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground transition-all duration-300 hover:border-primary hover:text-primary hover:scale-105"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground" style={{ fontFamily: amFont }}>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> {t("hero.freeDelivery")}</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> {t("hero.encrypted")}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {t("hero.chat247")}</div>
            </div>
          </div>

          <HeroCard />
        </div>
      </div>
    </section>
  );
}


function HeroCard() {
  const { currency } = useCurrency();
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/25 via-success/15 to-transparent blur-2xl" />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
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
            <div key={m.name} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-sm">
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
                <p className="text-sm font-semibold">{formatPrice(m.usd, currency)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Estimated delivery</p>
            <p className="text-sm font-semibold">Tomorrow, before 12pm</p>
          </div>
          <button className="rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-sm">Track order</button>
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
    const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"]);
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(list)) {
        if (!ALLOWED_MIME.has(file.type)) {
          throw new Error(`Unsupported file type: ${file.name}. Allowed: JPG, PNG, WEBP, HEIC, PDF.`);
        }
        if (file.size > MAX_SIZE) {
          throw new Error(`${file.name} exceeds the 10MB size limit.`);
        }
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("prescriptions").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
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
      <div className="grid gap-8 rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md md:grid-cols-[1fr_1.1fr] md:p-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm animate-fade-in">
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
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface p-8 text-center transition-all duration-300 hover:border-primary/40">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold">Sign in to upload securely</p>
              <p className="mt-1 text-sm text-muted-foreground">Your prescriptions are stored in your private, encrypted profile.</p>
              <button
                onClick={() => navigate({ to: "/auth" })}
                className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:opacity-90 hover:scale-105"
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
                className={`flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                  dragging ? "border-primary bg-primary-soft/60" : "border-border bg-surface hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                <input ref={inputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={(e) => addFiles(e.target.files)} />
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-semibold">{busy ? "Uploading…" : "Drop your prescription here"}</p>
                <p className="mt-1 text-sm text-muted-foreground">PNG, JPG or PDF · up to 10MB</p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className="mt-5 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 disabled:opacity-60"
                >
                  Browse files
                </button>
              </label>

              {error && <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}

              {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {files.map((f) => (
                    <li key={f.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm transition-all duration-300 hover:shadow-sm hover:border-primary/30">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">{f.file_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {f.file_size ? `${(f.file_size / 1024).toFixed(1)} KB · ` : ""}{f.status}
                        </span>
                      </div>
                      <button onClick={() => removeFile(f)} className="text-muted-foreground transition-colors duration-300 hover:text-destructive">
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
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90 hover:scale-105"
            >
              Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Categories({
  activeCategory,
  onSelect,
}: {
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}) {
  const { t } = useLanguage();
  return (
    <section id="shop" className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{t("products.category")}</h2>
          <p className="mt-2 text-muted-foreground">
            {activeCategory
              ? `${t("products.browsing")} ${activeCategory}. ${t("products.resetHint")}`
              : t("products.categorySubtitle")}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {categories.map((c) => {
          const isActive = activeCategory === c.name || (c.name === "All Products" && activeCategory === null);
          const label = c.name === "All Products" ? t("products.allProducts") : c.name;
          return (
            <button
              key={c.name}
              onClick={() => onSelect(c.name === "All Products" ? null : c.name)}
              className={`group relative rounded-xl border p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-md animate-fade-in"
                  : "border-border bg-card hover:border-primary"
              }`}
              aria-pressed={isActive}
            >
              {isActive && (
                <span className="absolute right-2 top-2 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Active
                </span>
              )}
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.tone} ${isActive ? "text-primary" : "text-foreground"} transition-transform duration-300 group-hover:scale-110`}>
                <c.icon className="h-6 w-6" />
              </div>
              <p className={`mt-4 font-semibold ${isActive ? "text-primary-foreground" : ""}`}>{label}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}



function ProductGrid({
  searchQuery,
  activeCategory,
  onAdd,
}: {
  searchQuery: string;
  activeCategory: string | null;
  onAdd: (p: Omit<CartItem, "qty">) => void;
}) {
  const { t } = useLanguage();
  const { currency } = useCurrency();
  const loadMedications = useServerFn(fetchMedications);
  const { data: products = [], isLoading, isFetching } = useQuery({
    queryKey: ["medications", "external", activeCategory ?? "all"],
    queryFn: () => loadMedications({ data: { category: activeCategory ?? undefined } }) as Promise<ExternalMedication[]>,
    staleTime: 60_000,
  });

  const query = searchQuery.trim().toLowerCase();
  const filtered = products.filter((p) =>
    !query ||
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );

  const heading = activeCategory ? `${activeCategory}` : t("products.allMedications");

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">{heading}</h3>
          <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {filtered.length} {t("products.productsCount")}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? "bg-amber-500 animate-pulse" : "bg-success"}`} />
          {isFetching ? t("products.syncing") : t("products.livePricing")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl border border-border bg-card" />
            ))
          : filtered.map((p) => (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary-soft to-surface transition-all duration-300 group-hover:border-primary/30">
                  <Pill className="h-12 w-12 text-primary/70 transition duration-300 group-hover:scale-110" />

                  {/* Regulatory badge — OTC vs Rx */}
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur ${
                      p.isPrescriptionRequired
                        ? "bg-amber-500/95 text-white"
                        : "bg-success/90 text-white"
                    }`}
                  >
                    {p.isPrescriptionRequired ? (
                      <>
                        <AlertTriangle className="h-3 w-3" strokeWidth={3} />
                        {t("products.rx")}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3 w-3" strokeWidth={3} />
                        {t("products.otc")}
                      </>
                    )}
                  </span>

                  <span
                    className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur ${
                      p.inStock ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {p.inStock ? `${p.stockCount} ${t("products.inStock")}` : t("products.outOfStock")}
                  </span>
                </div>
                <div className="mt-4 flex flex-1 flex-col">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{p.category}</p>
                  <h3 className="font-serif mt-1 text-[17px] font-medium leading-snug text-foreground">{p.name}</h3>

                  {/* Medical clarity — dosage + pack size */}
                  <dl className="mt-2 space-y-0.5 text-[11px] leading-tight text-muted-foreground">
                    <div className="flex items-baseline gap-1.5">
                      <dt className="font-semibold uppercase tracking-wide text-foreground/70">
                        {t("products.dosage")}:
                      </dt>
                      <dd className="tabular-nums">{p.dosage}</dd>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <dt className="font-semibold uppercase tracking-wide text-foreground/70">
                        {t("products.packSize")}:
                      </dt>
                      <dd className="tabular-nums">{p.packSize}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold tracking-tight">{formatPrice(p.amountUSD, currency)}</span>
                    </div>
                    <button
                      onClick={() =>
                        onAdd({
                          id: p.id,
                          name: p.name,
                          price: p.amountUSD,
                          isPrescriptionRequired: p.isPrescriptionRequired,
                          dosage: p.dosage,
                          packSize: p.packSize,
                        })
                      }
                      disabled={!p.inStock}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:bg-primary/90 hover:scale-105 disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                      {t("products.addToCart")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}




const stepDefs = [
  { id: 1, icon: ShoppingCart, key: "cart" as const },
  { id: 2, icon: Truck, key: "shipping" as const },
  { id: 3, icon: CreditCard, key: "payment" as const },
  { id: 4, icon: Check, key: "confirm" as const },
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
  const { t } = useLanguage();
  const { currency } = useCurrency();
  const submitOrder = useServerFn(placeOrder);
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Rx compliance: check if the signed-in user has at least one prescription on file.
  const { data: prescriptionCount = 0 } = useQuery({
    queryKey: ["prescription-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("prescriptions")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const hasRxItems = cart.some((i) => i.isPrescriptionRequired);
  const hasPrescriptionOnFile = prescriptionCount > 0;
  const rxBlocked = hasRxItems && !hasPrescriptionOnFile;

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const deliveryFee = subtotal >= 35 || subtotal === 0 ? 0 : 4.99;
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const total = +(subtotal + tax + deliveryFee).toFixed(2);

  async function nextStep() {
    if (cart.length === 0) return;
    if (step === 3 && rxBlocked) return; // hard block on Rx items without prescription
    if (step === 3 && user) {
      setPlacing(true);
      setOrderError(null);
      try {
        await submitOrder({
          data: {
            items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
          },
        });
        queryClient.invalidateQueries({ queryKey: ["orders", user.id] });
      } catch (err) {
        setOrderError(err instanceof Error ? err.message : "Failed to place order");
        setPlacing(false);
        return;
      } finally {
        setPlacing(false);
      }
    }
    setStep(step === 4 ? 1 : step + 1);
  }

  function scrollToUpload() {
    document.getElementById("prescription")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="checkout" className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm animate-fade-in">
          {t("checkout.chip")}
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">{t("checkout.title")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t("checkout.subtitle")}</p>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="grid grid-cols-4 border-b border-border bg-surface">
          {stepDefs.map((s) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center justify-center gap-2 px-3 py-4 text-sm font-semibold transition-all duration-300 ${
                  active ? "bg-card text-foreground shadow-sm animate-fade-in" : done ? "text-primary hover:bg-primary/5" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs transition-all duration-300 ${
                  active ? "bg-primary text-primary-foreground scale-110" : done ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.id}
                </span>
                <span className="hidden sm:inline">{t(`checkout.steps.${s.key}`)}</span>
              </button>
            );
          })}
        </div>


        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div className="min-h-[280px]">
            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{t("checkout.yourCart")}</h3>
                  <span className="text-xs text-muted-foreground">
                    {itemCount} {t("checkout.items")}
                  </span>
                </div>
                {cart.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:bg-surface">
                    {t("checkout.cartEmpty")}
                  </div>
                ) : (
                  cart.map((i) => (
                    <div key={i.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary-soft text-primary">
                          <Pill className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{i.name}</p>
                            {i.isPrescriptionRequired && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                <AlertTriangle className="h-2.5 w-2.5" strokeWidth={3} />
                                {t("products.rx")}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {i.dosage} · {i.packSize}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatPrice(i.price, currency)} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-card shadow-sm">
                          <button onClick={() => updateQty(i.id, i.qty - 1)} className="grid h-8 w-8 place-items-center rounded-l-lg transition-colors duration-300 hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                          <button onClick={() => updateQty(i.id, i.qty + 1)} className="grid h-8 w-8 place-items-center rounded-r-lg transition-colors duration-300 hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button onClick={() => removeItem(i.id)} className="text-muted-foreground transition-all duration-300 hover:text-destructive hover:scale-110" aria-label="Remove">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {rxBlocked && (
                  <RxComplianceAlert
                    onUpload={scrollToUpload}
                    signedIn={!!user}
                    title={t("checkout.rxBlockTitle")}
                    message={t("checkout.rxBlockMessage")}
                    action={t("checkout.goToUpload")}
                    signInPrompt={t("checkout.signInPrompt")}
                  />
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">{t("checkout.shipping")}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full name" placeholder="Jane Doe" />
                  <Field label="Phone" placeholder="+251 91 234 5678" />
                  <Field label="Address" placeholder="Bole Road, Building 42" className="sm:col-span-2" />
                  <Field label="City" placeholder="Addis Ababa" />
                  <Field label="Postal code" placeholder="1000" />
                </div>
                <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                  <p className="font-semibold">{t("checkout.standardDelivery")}</p>
                  <p className="text-xs text-muted-foreground">{t("checkout.standardDeliveryHint")}</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">{t("checkout.payment")}</h3>
                {!user && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <Link to="/auth" className="font-semibold underline">{t("nav.signIn")}</Link> — {t("checkout.signInPrompt")}
                  </div>
                )}

                {rxBlocked && (
                  <RxComplianceAlert
                    onUpload={scrollToUpload}
                    signedIn={!!user}
                    title={t("checkout.rxBlockTitle")}
                    message={t("checkout.rxBlockMessage")}
                    action={t("checkout.goToUpload")}
                    signInPrompt={t("checkout.signInPrompt")}
                  />
                )}

                <div className="rounded-xl border-2 border-primary bg-primary-soft/40 p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Visa ending in 4242</span>
                    </div>
                    <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                  </div>
                </div>
                <Field label={t("checkout.cardNumber")} placeholder="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("checkout.expiry")} placeholder="12 / 28" />
                  <Field label={t("checkout.cvc")} placeholder="123" />
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> {t("checkout.encrypted")}
                </p>
                {orderError && (
                  <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{orderError}</div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="h-8 w-8" strokeWidth={3} />
                </div>
                <h3 className="mt-4 text-xl font-bold">{t("checkout.confirmed")}</h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  {user ? t("checkout.confirmedHintUser") : t("checkout.confirmedHintGuest")}
                </p>
              </div>
            )}
          </div>

          <aside className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("checkout.orderSummary")}</h4>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label={`${t("checkout.items")} (${itemCount})`} value={formatPrice(subtotal, currency)} />
              <Row label={t("checkout.subtotal")} value={formatPrice(subtotal, currency)} />
              <Row label={t("checkout.delivery")} value={deliveryFee === 0 ? t("checkout.free") : formatPrice(deliveryFee, currency)} />
              <Row label={t("checkout.tax")} value={formatPrice(tax, currency)} />
            </dl>
            <div className="my-4 border-t border-border" />
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold">{t("checkout.total")}</span>
              <div className="text-right">
                <div className="text-2xl font-extrabold leading-none">{formatPrice(total, currency)}</div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              {step > 1 && step < 4 && (
                <button onClick={() => setStep(step - 1)} className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold transition-all duration-300 hover:bg-muted hover:shadow-sm">
                  {t("checkout.back")}
                </button>
              )}
              <button
                onClick={nextStep}
                disabled={
                  placing ||
                  (step < 4 && cart.length === 0) ||
                  (step === 3 && rxBlocked)
                }
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                title={step === 3 && rxBlocked ? t("checkout.rxBlockMessage") : undefined}
              >
                {placing
                  ? t("checkout.placing")
                  : step === 4
                    ? t("checkout.startOver")
                    : step === 3
                      ? t("checkout.placeOrder")
                      : cart.length === 0
                        ? t("checkout.cartEmptyBtn")
                        : t("checkout.continue")}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function RxComplianceAlert({
  onUpload,
  signedIn,
  title,
  message,
  action,
  signInPrompt,
}: {
  onUpload: () => void;
  signedIn: boolean;
  title: string;
  message: string;
  action: string;
  signInPrompt: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-500 text-white">
        <AlertTriangle className="h-4 w-4" strokeWidth={3} />
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm font-semibold text-amber-900">{title}</p>
        <p className="text-xs text-amber-900/80">{message}</p>
        {signedIn ? (
          <button
            onClick={onUpload}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:bg-amber-700 hover:scale-105"
          >
            <Upload className="h-3.5 w-3.5" /> {action}
          </button>
        ) : (
          <Link
            to="/auth"
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:bg-amber-700 hover:scale-105"
          >
            <UserIcon className="h-3.5 w-3.5" /> {signInPrompt}
          </Link>
        )}
      </div>
    </div>
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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm animate-fade-in">
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
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary transition-transform duration-300 hover:scale-110">
            <UserIcon className="h-6 w-6" />
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Create a free M-Pharmacy account to upload prescriptions, view orders, and get refill reminders.
          </p>
          <Link
            to="/auth"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:opacity-90 hover:scale-105"
          >
            Sign in or create account
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Recent orders</h3>
              <a href="#" className="text-sm font-semibold text-primary transition-all duration-300 hover:opacity-80 hover:scale-105">See all</a>
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
                  <div key={o.id} className="group flex items-center justify-between rounded-xl py-3 px-3 transition-all duration-300 hover:bg-primary-soft/50 hover:-translate-x-1">
                    <div className="flex items-center gap-4">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-110">
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

          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary-soft/70 to-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Refill reminders</h3>
              <Bell className="h-5 w-5 text-primary transition-transform duration-300 hover:scale-110" />
            </div>
            <div className="mt-5 space-y-4">
              {refills.map((r) => (
                <div key={r.name} className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">Refill due {r.due}</p>
                    </div>
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground transition-all duration-300 hover:scale-110 hover:bg-primary/90">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all duration-300 group-hover:bg-primary/90" style={{ width: `${r.progress}%` }} />
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
