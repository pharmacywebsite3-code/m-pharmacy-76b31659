import { createServerFn } from "@tanstack/react-start";

/**
 * Mock external pharmaceutical database API.
 *
 * In production this handler would call a real upstream (e.g. RxNorm,
 * OpenFDA, a wholesaler feed) using a hidden API key:
 *
 *   const apiKey = process.env.PHARMA_API_KEY;
 *   const res = await fetch("https://api.pharma-provider.com/v1/medications", {
 *     headers: { Authorization: `Bearer ${apiKey}` },
 *   });
 *
 * For now we simulate a remote response — latency, live-ish pricing jitter,
 * and stock availability — so the frontend can integrate against the real
 * service shape without exposing any secrets to the browser.
 */

// Mock FX rate. In production this would come from a live FX feed.
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
  updatedAt: string;
};

const CATALOG: Omit<ExternalMedication, "amountUSD" | "amountETB" | "fxRate" | "inStock" | "stockCount" | "updatedAt">[] = [
  { id: "med-001", sku: "RX-PARA-500", name: "Paracetamol 500mg", category: "Wellness", badge: "OTC", manufacturer: "Acme Labs" },
  { id: "med-002", sku: "RX-ASPI-100", name: "Aspirin 100mg", category: "Wellness", badge: "OTC", manufacturer: "Bayer" },
  { id: "med-003", sku: "RX-VTD3-1K", name: "Vitamin D3 1000 IU", category: "Vitamins", badge: "Best Seller", manufacturer: "NaturePharm" },
  { id: "med-004", sku: "RX-VTC-500", name: "Vitamin C 500mg", category: "Vitamins", badge: "Popular", manufacturer: "NaturePharm" },
  { id: "med-005", sku: "RX-BAND-24", name: "Sterile Bandages (24pk)", category: "First Aid", badge: null, manufacturer: "MediCare" },
  { id: "med-006", sku: "RX-OMG3-60", name: "Omega-3 Fish Oil", category: "Wellness", badge: "New", manufacturer: "NaturePharm" },
  { id: "med-007", sku: "RX-COUG-200", name: "Cough Syrup 200ml", category: "Cold & Flu", badge: null, manufacturer: "Acme Labs" },
  { id: "med-008", sku: "RX-BABY-LOT", name: "Baby Gentle Lotion", category: "Baby Care", badge: null, manufacturer: "TenderCare" },
  { id: "med-009", sku: "RX-MAGN-CX", name: "Magnesium Complex", category: "Vitamins", badge: null, manufacturer: "NaturePharm" },
  { id: "med-010", sku: "RX-ANTI-SPR", name: "Antiseptic Spray", category: "First Aid", badge: null, manufacturer: "MediCare" },
  { id: "med-011", sku: "RX-IBUP-200", name: "Ibuprofen 200mg", category: "Wellness", badge: null, manufacturer: "Bayer" },
  { id: "med-012", sku: "RX-LORA-10", name: "Loratadine 10mg", category: "Cold & Flu", badge: "New", manufacturer: "Acme Labs" },
  { id: "med-013", sku: "RX-GING-TEA", name: "Ginger Herbal Tea", category: "Herbal", badge: null, manufacturer: "GreenLeaf" },
  { id: "med-014", sku: "RX-CHAM-TEA", name: "Chamomile Calm Tea", category: "Herbal", badge: "Popular", manufacturer: "GreenLeaf" },
  { id: "med-015", sku: "RX-ECHI-EXT", name: "Echinacea Extract", category: "Herbal", badge: null, manufacturer: "GreenLeaf" },
  { id: "med-016", sku: "RX-BABY-SHM", name: "Baby Gentle Shampoo", category: "Baby Care", badge: null, manufacturer: "TenderCare" },
  { id: "med-017", sku: "RX-DIAP-CRM", name: "Diaper Rash Cream", category: "Baby Care", badge: null, manufacturer: "TenderCare" },
  { id: "med-018", sku: "RX-THRO-LOZ", name: "Throat Lozenges", category: "Cold & Flu", badge: null, manufacturer: "Acme Labs" },
  { id: "med-019", sku: "RX-FAK-DLX", name: "Deluxe First Aid Kit", category: "First Aid", badge: "Best Seller", manufacturer: "MediCare" },
  { id: "med-020", sku: "RX-PROT-PWD", name: "Whey Protein Powder", category: "Wellness", badge: null, manufacturer: "NaturePharm" },
];

const BASE_PRICES: Record<string, number> = {
  "med-001": 4.99, "med-002": 5.49, "med-003": 12.5, "med-004": 9.99,
  "med-005": 6.75, "med-006": 18.99, "med-007": 8.4, "med-008": 9.2,
  "med-009": 14.0, "med-010": 5.5, "med-011": 7.25, "med-012": 11.75,
};

// Deterministic "live" jitter per request so prices feel dynamic but stable
// within a session window.
function jitter(seed: string, range: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000 - 0.5) * 2 * range;
}

async function simulateLatency() {
  await new Promise((r) => setTimeout(r, 250 + Math.random() * 250));
}

export const fetchMedications = createServerFn({ method: "GET" })
  .inputValidator((input: { search?: string; category?: string } | undefined) => input ?? {})
  .handler(async ({ data }): Promise<ExternalMedication[]> => {
    // const apiKey = process.env.PHARMA_API_KEY; // wired for real upstream
    await simulateLatency();

    const stamp = new Date().toISOString();
    const dayKey = stamp.slice(0, 13); // hourly jitter window

    let results: ExternalMedication[] = CATALOG.map((item) => {
      const base = BASE_PRICES[item.id] ?? 9.99;
      const amountUSD = Math.max(0.5, +(base + jitter(item.id + dayKey, 0.4)).toFixed(2));
      const amountETB = +(amountUSD * ETB_PER_USD).toFixed(2);
      const stockCount = Math.floor(20 + (jitter(item.sku + dayKey, 80) + 80));
      return {
        ...item,
        amountUSD,
        amountETB,
        fxRate: ETB_PER_USD,
        stockCount,
        inStock: stockCount > 0,
        updatedAt: stamp,
      };
    });

    const q = data.search?.trim().toLowerCase();
    if (q) {
      results = results.filter(
        (m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
      );
    }
    if (data.category) {
      results = results.filter((m) => m.category === data.category);
    }
    return results;
  });
