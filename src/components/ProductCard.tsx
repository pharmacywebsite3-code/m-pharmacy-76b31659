import { Plus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Product } from "@/lib/products.data";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { t } = useLanguage();
  const isOutOfStock = !product.inStock || product.stockCount === 0;
  const isLowStock = product.stockCount > 0 && product.stockCount < 5;

  const stockStatus =
    isOutOfStock
      ? t('products.outOfStock')
      : isLowStock
        ? t('products.lowStock')
        : `${product.stockCount} ${t('products.inStock')}`;

  const stockStatusColor = isOutOfStock
    ? 'text-red-600'
    : isLowStock
      ? 'text-amber-600'
      : 'text-green-600';

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md ${
        isOutOfStock ? 'opacity-50' : ''
      }`}
    >
      {/* Product Image Placeholder */}
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary-soft to-surface transition-all duration-300 group-hover:border-primary/30">
        <span className="text-5xl">💊</span>

        {/* OTC/Rx Badge - Top Left */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur ${
            product.isPrescriptionRequired
              ? 'bg-amber-100/95 text-amber-900'
              : 'bg-green-100/95 text-green-900'
          }`}
        >
          {product.isPrescriptionRequired ? t('products.rx') : t('products.otc')}
        </span>

        {/* Stock Status - Top Right */}
        <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur ${
          isOutOfStock
            ? 'bg-red-100/95 text-red-700'
            : isLowStock
              ? 'bg-amber-100/95 text-amber-700'
              : 'bg-green-100/95 text-green-700'
        }`}>
          {stockStatus}
        </span>
      </div>

      {/* Product Info */}
      <div className="mt-4 flex flex-1 flex-col">
        {/* Category */}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="mt-1 font-serif text-[17px] font-medium leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>

        {/* NEW: Dosage & Quantity Section */}
        <div className="mt-2 rounded-lg bg-muted/30 p-2 text-xs text-muted-foreground space-y-0.5">
          <div>
            <span className="font-semibold">{t('products.dosage')}:</span> {product.dosage}
          </div>
          <div>
            <span className="font-semibold">{t('products.quantity')}:</span> {product.quantity}
          </div>
        </div>

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {product.isPrescriptionRequired && ' (Rx)'}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
          {isOutOfStock ? t('products.outOfStock') : t('products.addToCart')}
        </button>
      </div>
    </article>
  );
}
