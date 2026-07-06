import { createServerFn } from "@tanstack/react-start";

/**
 * Pharmaceutical catalog with a live OpenFDA lookup for generic therapeutic
 * classes, and a curated, clinically-accurate fallback for categories that
 * OpenFDA does not serve cleanly (Baby Care, Cold & Flu, Herbal, Vitamins).
 */

export const ETB_PER_USD = 120;

export type ExternalMedication = {
  id: string;
  sku: string;
  name: string;
  category: string;
  amountUSD: number;
  amountETB: number;
  fxRate: number;
  inStock: boolean;
  stockCount: number;
  badge: string | null;
  manufacturer: string;
  dosage: string;
  packSize: string;
  isPrescriptionRequired: boolean;
  description: string;
  updatedAt: string;
};

type CatalogItem = Omit<
  ExternalMedication,
  "amountUSD" | "amountETB" | "fxRate" | "inStock" | "stockCount" | "updatedAt"
> & { basePrice: number };

const CATALOG: CatalogItem[] = [
  // Wellness (OTC)
  { id: "med-001", sku: "RX-PARA-500", name: "Paracetamol 500mg", category: "Wellness", badge: "OTC", manufacturer: "Acme Labs", dosage: "500 mg", packSize: "30 Tablets", isPrescriptionRequired: false, description: "Pain relief and fever reducer for adults.", basePrice: 4.99 },
  { id: "med-002", sku: "RX-ASPI-100", name: "Aspirin 100mg", category: "Wellness", badge: "OTC", manufacturer: "Bayer", dosage: "100 mg", packSize: "60 Tablets", isPrescriptionRequired: false, description: "Low-dose aspirin for cardiovascular support.", basePrice: 5.49 },
  { id: "med-006", sku: "RX-OMG3-60", name: "Omega-3 Fish Oil", category: "Wellness", badge: "New", manufacturer: "NaturePharm", dosage: "1000 mg", packSize: "60 Softgels", isPrescriptionRequired: false, description: "High-purity EPA/DHA for heart and brain health.", basePrice: 18.99 },
  { id: "med-011", sku: "RX-IBUP-200", name: "Ibuprofen 200mg", category: "Wellness", badge: null, manufacturer: "Bayer", dosage: "200 mg", packSize: "50 Caplets", isPrescriptionRequired: false, description: "NSAID for pain, inflammation, and fever.", basePrice: 7.25 },
  { id: "med-020", sku: "RX-PROT-PWD", name: "Whey Protein Powder", category: "Wellness", badge: null, manufacturer: "NaturePharm", dosage: "24 g protein / scoop", packSize: "900 g Tub", isPrescriptionRequired: false, description: "Grass-fed whey isolate for daily nutrition.", basePrice: 29.5 },

  // Vitamins (OTC)
  { id: "med-003", sku: "RX-VTD3-1K", name: "Vitamin D3 1000 IU", category: "Vitamins", badge: "Best Seller", manufacturer: "NaturePharm", dosage: "1000 IU", packSize: "90 Softgels", isPrescriptionRequired: false, description: "Supports bone health and immune function.", basePrice: 12.5 },
  { id: "med-004", sku: "RX-VTC-500", name: "Vitamin C 500mg", category: "Vitamins", badge: "Popular", manufacturer: "NaturePharm", dosage: "500 mg", packSize: "100 Tablets", isPrescriptionRequired: false, description: "Antioxidant support with sustained release.", basePrice: 9.99 },
  { id: "med-009", sku: "RX-MAGN-CX", name: "Magnesium Complex", category: "Vitamins", badge: null, manufacturer: "NaturePharm", dosage: "400 mg", packSize: "60 Capsules", isPrescriptionRequired: false, description: "Chelated magnesium for muscle and nerve function.", basePrice: 14.0 },

  // First Aid (OTC)
  { id: "med-005", sku: "RX-BAND-24", name: "Sterile Bandages", category: "First Aid", badge: null, manufacturer: "MediCare", dosage: "Assorted sizes", packSize: "24 Bandages", isPrescriptionRequired: false, description: "Latex-free, sterile adhesive bandages.", basePrice: 6.75 },
  { id: "med-010", sku: "RX-ANTI-SPR", name: "Antiseptic Spray", category: "First Aid", badge: null, manufacturer: "MediCare", dosage: "0.13% Benzalkonium", packSize: "120 mL Bottle", isPrescriptionRequired: false, description: "Kills germs on minor cuts and abrasions.", basePrice: 5.5 },
  { id: "med-019", sku: "RX-FAK-DLX", name: "Deluxe First Aid Kit", category: "First Aid", badge: "Best Seller", manufacturer: "MediCare", dosage: "N/A", packSize: "85-Piece Kit", isPrescriptionRequired: false, description: "Complete family first aid essentials in one case.", basePrice: 24.99 },

  // Herbal (OTC)
  { id: "med-013", sku: "RX-GING-TEA", name: "Ginger Herbal Tea", category: "Herbal", badge: null, manufacturer: "GreenLeaf", dosage: "2 g per bag", packSize: "20 Tea Bags", isPrescriptionRequired: false, description: "Warming ginger blend for digestion and immunity.", basePrice: 5.99 },
  { id: "med-014", sku: "RX-CHAM-TEA", name: "Chamomile Calm Tea", category: "Herbal", badge: "Popular", manufacturer: "GreenLeaf", dosage: "1.5 g per bag", packSize: "20 Tea Bags", isPrescriptionRequired: false, description: "Classic chamomile for evening relaxation.", basePrice: 6.49 },
  { id: "med-015", sku: "RX-ECHI-EXT", name: "Echinacea Extract", category: "Herbal", badge: null, manufacturer: "GreenLeaf", dosage: "400 mg", packSize: "60 Capsules", isPrescriptionRequired: false, description: "Traditional immune support during cold season.", basePrice: 10.25 },

  // Baby Care — realistic pediatric OTC inventory
  { id: "med-021", sku: "RX-INF-ACET", name: "Infant Acetaminophen Suspension", category: "Baby Care", badge: "OTC", manufacturer: "TenderCare Pediatrics", dosage: "160 mg / 5 mL", packSize: "60 mL Bottle", isPrescriptionRequired: false, description: "Cherry-flavored fever and pain relief for infants 2–11 months. Includes dosing syringe.", basePrice: 8.99 },
  { id: "med-022", sku: "RX-BABY-MST", name: "Baby Moisturizing Lotion", category: "Baby Care", badge: null, manufacturer: "TenderCare", dosage: "Fragrance-free formula", packSize: "400 mL Pump Bottle", isPrescriptionRequired: false, description: "Hypoallergenic daily lotion enriched with colloidal oatmeal.", basePrice: 12.5 },
  { id: "med-023", sku: "RX-PED-ELEC", name: "Pediatric Electrolyte Solution", category: "Baby Care", badge: "Popular", manufacturer: "HydraKids", dosage: "45 mmol Na / L", packSize: "1 L Bottle", isPrescriptionRequired: false, description: "Rehydrates children during illness, vomiting or diarrhea. Grape flavor.", basePrice: 7.75 },

  // Cold & Flu — three distinct seasonal medications (no duplicates)
  { id: "med-031", sku: "RX-GUAI-600", name: "Guaifenesin 600mg ER", category: "Cold & Flu", badge: "OTC", manufacturer: "RespirCare", dosage: "600 mg extended release", packSize: "40 Bi-Layer Tablets", isPrescriptionRequired: false, description: "Expectorant that loosens chest congestion for up to 12 hours.", basePrice: 11.25 },
  { id: "med-032", sku: "RX-DXM-SYR", name: "Dextromethorphan HBr Cough Syrup", category: "Cold & Flu", badge: null, manufacturer: "RespirCare", dosage: "15 mg / 5 mL", packSize: "200 mL Bottle", isPrescriptionRequired: false, description: "Non-drowsy cough suppressant for dry, hacking coughs.", basePrice: 9.4 },
  { id: "med-033", sku: "RX-PSE-30", name: "Pseudoephedrine HCl 30mg", category: "Cold & Flu", badge: "Rx", manufacturer: "RespirCare", dosage: "30 mg", packSize: "24 Tablets", isPrescriptionRequired: true, description: "Nasal decongestant. Pharmacist-verified purchase required.", basePrice: 8.9 },

  // Prescription-only items (demonstrate Rx flow)
  { id: "med-041", sku: "RX-AMOX-500", name: "Amoxicillin 500mg", category: "Wellness", badge: "Rx", manufacturer: "Acme Labs", dosage: "500 mg", packSize: "21 Capsules", isPrescriptionRequired: true, description: "Broad-spectrum antibiotic. Requires valid prescription.", basePrice: 14.2 },
  { id: "med-042", sku: "RX-LORA-10", name: "Loratadine 10mg", category: "Cold & Flu", badge: "OTC", manufacturer: "Acme Labs", dosage: "10 mg", packSize: "30 Tablets", isPrescriptionRequired: false, description: "Non-drowsy 24-hour allergy relief.", basePrice: 11.75 },
];

// Deterministic per-request "live" jitter for dynamic-feeling stable pricing.
function jitter(seed: string, range: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000 - 0.5) * 2 * range;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

async function simulateLatency() {
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 240));
}

// OpenFDA categories that yield clean, real data. Baby Care, Cold & Flu, Herbal
// and Vitamins are served exclusively from the curated CATALOG above because
// OpenFDA returns inconsistent product-type entries for those verticals.
const CATEGORY_QUERIES: Record<string, string> = {
  Wellness: 'openfda.pharm_class_epc:"Nonsteroidal Anti-inflammatory Drug"',
  "First Aid": 'openfda.pharm_class_epc:"Antiseptic"',
};

const CATEGORIES = [
  "Wellness",
  "Vitamins",
  "First Aid",
  "Herbal",
  "Baby Care",
  "Cold & Flu",
];

type OpenFdaResult = {
  id?: string;
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_type?: string[];
    pharm_class_epc?: string[];
    route?: string[];
  };
  dosage_and_administration?: string[];
  package_label_principal_display_panel?: string[];
};

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function pickName(r: OpenFdaResult): string | null {
  const brand = r.openfda?.brand_name?.[0];
  const generic = r.openfda?.generic_name?.[0];
  const raw = brand || generic;
  if (!raw) return null;
  return titleCase(raw.split(/[,;]/)[0].trim()).slice(0, 48);
}

async function fetchFromOpenFda(category: string): Promise<ExternalMedication[]> {
  const query = CATEGORY_QUERIES[category];
  if (!query) return [];
  const url = `https://api.fda.gov/drug/label.json?search=${query}&limit=12`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`OpenFDA ${res.status}`);
  const json = (await res.json()) as { results?: OpenFdaResult[] };
  const results = json.results ?? [];
  const stamp = new Date().toISOString();
  const dayKey = stamp.slice(0, 13);

  return results
    .map((r, i): ExternalMedication | null => {
      const name = pickName(r);
      if (!name) return null;
      const id = r.id ?? `${category}-${i}`;
      const sku = `RX-${(r.openfda?.generic_name?.[0] ?? name).replace(/[^A-Z0-9]/gi, "").slice(0, 8).toUpperCase() || "MED"}-${i}`;
      const basePrice = 4 + ((Math.abs(hash(id)) % 2600) / 100);
      const amountUSD = Math.max(0.5, +(basePrice + jitter(id + dayKey, 0.4)).toFixed(2));
      const amountETB = +(amountUSD * ETB_PER_USD).toFixed(2);
      const stockCount = Math.floor(20 + (jitter(sku + dayKey, 80) + 80));
      const manufacturer = titleCase(r.openfda?.manufacturer_name?.[0] ?? "Generic Labs").slice(0, 40);
      const productType = (r.openfda?.product_type?.[0] ?? "").toUpperCase();
      const isRx = productType.includes("PRESCRIPTION");
      return {
        id,
        sku,
        name,
        category,
        amountUSD,
        amountETB,
        fxRate: ETB_PER_USD,
        inStock: stockCount > 0,
        stockCount,
        badge: isRx ? "Rx" : "OTC",
        manufacturer,
        dosage: "As directed",
        packSize: "Standard pack",
        isPrescriptionRequired: isRx,
        description: `${name} sourced live from the OpenFDA drug label registry.`,
        updatedAt: stamp,
      };
    })
    .filter((x): x is ExternalMedication => x !== null);
}

function priceCatalog(items: CatalogItem[]): ExternalMedication[] {
  const stamp = new Date().toISOString();
  const dayKey = stamp.slice(0, 13);
  return items.map((item) => {
    const amountUSD = Math.max(0.5, +(item.basePrice + jitter(item.id + dayKey, 0.3)).toFixed(2));
    const amountETB = +(amountUSD * ETB_PER_USD).toFixed(2);
    const stockCount = Math.floor(20 + (jitter(item.sku + dayKey, 80) + 80));
    const { basePrice: _basePrice, ...rest } = item;
    void _basePrice;
    return {
      ...rest,
      amountUSD,
      amountETB,
      fxRate: ETB_PER_USD,
      stockCount,
      inStock: stockCount > 0,
      updatedAt: stamp,
    };
  });
}

function catalogFor(category?: string): ExternalMedication[] {
  const filtered = category ? CATALOG.filter((c) => c.category === category) : CATALOG;
  return priceCatalog(filtered);
}

export const fetchMedications = createServerFn({ method: "GET" })
  .inputValidator((input: { search?: string; category?: string } | undefined) => input ?? {})
  .handler(async ({ data }): Promise<ExternalMedication[]> => {
    await simulateLatency();

    let results: ExternalMedication[] = [];

    if (data.category) {
      // Curated categories are served entirely from the internal catalog.
      const curated = catalogFor(data.category);
      if (CATEGORY_QUERIES[data.category]) {
        try {
          const live = await fetchFromOpenFda(data.category);
          // Merge: curated first (guaranteed clean), then live extras.
          results = [...curated, ...live];
        } catch (err) {
          console.error("[medications] OpenFDA fetch failed, using catalog:", err);
          results = curated;
        }
      } else {
        results = curated;
      }
    } else {
      // "All Products" — full curated catalog plus live extras from the two
      // OpenFDA-backed categories where available.
      const curated = priceCatalog(CATALOG);
      try {
        const liveChunks = await Promise.all(
          Object.keys(CATEGORY_QUERIES).map((cat) =>
            fetchFromOpenFda(cat).catch(() => [] as ExternalMedication[]),
          ),
        );
        results = [...curated, ...liveChunks.flat()];
      } catch {
        results = curated;
      }
    }

    const q = data.search?.trim().toLowerCase();
    if (q) {
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q),
      );
    }
    return results;
  });

export const CATEGORY_LIST = CATEGORIES;
