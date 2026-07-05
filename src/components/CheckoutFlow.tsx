import { useState } from "react";
import { ShoppingCart, Truck, CreditCard, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { RxUploadModal } from "./RxUploadModal";
import type { CartItem } from "@/routes/index";

interface CheckoutFlowProps {
  cart: CartItem[];
  total: number;
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
}

const steps = [
  { id: 1, title: "Cart", icon: ShoppingCart },
  { id: 2, title: "Shipping", icon: Truck },
  { id: 3, title: "Payment", icon: CreditCard },
  { id: 4, title: "Confirm", icon: Check },
];

export function CheckoutFlow({
  cart,
  total,
  onUpdateQty,
  onRemoveItem,
}: CheckoutFlowProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  // Check if cart has Rx items
  const hasRxItems = cart.some((item) => item.isPrescriptionRequired);
  const canProceedToPayment = !hasRxItems || prescriptionUploaded;

  const handleRxUploadSuccess = () => {
    setPrescriptionUploaded(true);
    setRxModalOpen(false);
  };

  const handleNextStep = async () => {
    if (step === 3 && hasRxItems && !prescriptionUploaded) {
      setRxModalOpen(true);
      return;
    }

    if (step === 3) {
      setPlacing(true);
      // Simulate order placement
      setTimeout(() => {
        setPlacing(false);
        setStep(4);
      }, 1500);
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Reset for new order
      setStep(1);
      setPrescriptionUploaded(false);
    }
  };

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {t('checkout.title')}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          {t('checkout.subtitle')}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-10 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-4 border-b border-border bg-surface">
          {steps.map((s) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center justify-center gap-2 px-3 py-4 text-sm font-semibold transition-all duration-300 ${
                  active
                    ? 'bg-card text-foreground shadow-sm'
                    : done
                      ? 'text-primary hover:bg-primary/5'
                      : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs transition-all duration-300 ${
                    active
                      ? 'bg-primary text-primary-foreground scale-110'
                      : done
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.id}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
          {/* Main Content */}
          <div className="min-h-[280px]">
            {step === 1 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold">{t('checkout.cart')}</h3>
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('checkout.cartEmpty')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
                      >
                        <div>
                          <p className="font-semibold">
                            {item.name}
                            {item.isPrescriptionRequired && (
                              <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                {t('products.rx')}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} × {item.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) =>
                              onUpdateQty(item.id, parseInt(e.target.value) || 1)
                            }
                            className="w-12 rounded border border-border bg-background p-1 text-center text-sm"
                          />
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">{t('checkout.shipping')}</h3>
                <div className="space-y-3">
                  <input
                    placeholder="Full Name"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Address"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="City"
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Postal Code"
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="font-semibold">{t('checkout.delivery')}</p>
                  <p className="text-xs text-muted-foreground">
                    Standard delivery · Free over $35
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">{t('checkout.payment')}</h3>

                {/* Rx Alert */}
                {hasRxItems && !prescriptionUploaded && (
                  <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">
                      ⚠️ {t('checkout.rxRequired')}
                    </p>
                    <button
                      onClick={() => setRxModalOpen(true)}
                      className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                    >
                      {t('checkout.uploadRx')}
                    </button>
                  </div>
                )}

                {prescriptionUploaded && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-900 font-semibold">
                    ✓ {t('checkout.prescriptionUploaded')}
                  </div>
                )}

                <div className="rounded-xl border-2 border-primary bg-primary-soft/40 p-4">
                  <p className="font-semibold">Visa ending in 4242</p>
                </div>
                <div className="space-y-3">
                  <input
                    placeholder="Card Number"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="MM/YY"
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="CVC"
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600">
                  <Check className="h-8 w-8" strokeWidth={3} />
                </div>
                <h3 className="mt-4 text-xl font-bold">
                  {t('checkout.confirm')}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Your order has been received and will be processed shortly.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="rounded-xl border border-border bg-muted/30 p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Order Summary
            </h4>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items ({itemCount})</dt>
                <dd className="font-semibold">${total.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('checkout.tax')}</dt>
                <dd className="font-semibold">${(total * 0.08).toFixed(2)}</dd>
              </div>
            </dl>
            <div className="my-4 border-t border-border" />
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold">Total</span>
              <div className="text-right">
                <div className="text-2xl font-extrabold">
                  ${(total * 1.08).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-2">
              {step > 1 && step < 4 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold transition-all hover:bg-muted"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNextStep}
                disabled={
                  placing ||
                  (step === 1 && cart.length === 0) ||
                  (step === 3 && hasRxItems && !prescriptionUploaded)
                }
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing
                  ? 'Placing…'
                  : step === 4
                    ? 'Start Over'
                    : step === 3
                      ? t('checkout.proceedPayment')
                      : t('checkout.continueCheckout')}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Rx Upload Modal */}
      <RxUploadModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        onUploadSuccess={handleRxUploadSuccess}
      />
    </section>
  );
}
