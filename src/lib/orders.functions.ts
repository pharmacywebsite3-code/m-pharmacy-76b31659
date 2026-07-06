import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_ITEMS = 50;
const MAX_QTY_PER_ITEM = 99;
const MAX_PRICE = 500; // USD sanity cap per unit
const MAX_NAME_LEN = 200;

export type PlaceOrderInput = {
  items: Array<{ id: string; name: string; price: number; qty: number }>;
};

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PlaceOrderInput) => {
    if (!input || !Array.isArray(input.items)) throw new Error("items required");
    if (input.items.length === 0) throw new Error("Cart is empty");
    if (input.items.length > MAX_ITEMS) throw new Error("Too many items");
    const cleaned = input.items.map((it, i) => {
      if (!it || typeof it !== "object") throw new Error(`Invalid item ${i}`);
      if (typeof it.id !== "string" || !it.id) throw new Error(`Invalid item id ${i}`);
      if (typeof it.name !== "string" || !it.name) throw new Error(`Invalid item name ${i}`);
      if (it.name.length > MAX_NAME_LEN) throw new Error(`Item ${i} name too long`);
      if (typeof it.price !== "number" || !Number.isFinite(it.price) || it.price < 0 || it.price > MAX_PRICE) {
        throw new Error(`Invalid price for item ${i}`);
      }
      if (!Number.isInteger(it.qty) || it.qty < 1 || it.qty > MAX_QTY_PER_ITEM) {
        throw new Error(`Invalid qty for item ${i}`);
      }
      return { id: it.id, name: it.name, price: +it.price.toFixed(2), qty: it.qty };
    });
    return { items: cleaned };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Server-side recomputation — ignore any client-supplied total/status.
    const subtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    const itemCount = data.items.reduce((s, i) => s + i.qty, 0);

    const { data: inserted, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        items: data.items,
        item_count: itemCount,
        total,
        status: "Processing", // server-controlled
      })
      .select("id, order_number")
      .single();

    if (error) throw new Error(error.message);
    return { id: inserted.id, order_number: inserted.order_number, total };
  });
