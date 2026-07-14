import Image from "next/image";

// Add image URLs here to make this section visible.
// Leave empty to keep it hidden.
const SHIPPING_IMAGES: string[] = [];

export default function ShippingHighlights() {
  if (SHIPPING_IMAGES.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
          Proof of Work
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Shipping Highlights</h2>
        <p className="mt-2 text-sm text-slate-500">
          Real shipments. Real clients. Real deliveries.
        </p>
      </div>

      <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4">
        {SHIPPING_IMAGES.map((src, i) => (
          <div key={i} className="mb-4 overflow-hidden rounded-xl break-inside-avoid">
            <Image
              src={src}
              alt={`Shipping proof ${i + 1}`}
              width={400}
              height={300}
              className="w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
