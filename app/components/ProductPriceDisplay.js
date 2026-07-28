import { formatInr, productShowsMrp } from '@/lib/product-price';

const SIZE_STYLES = {
  sm: {
    wrap: 'gap-1',
    mrp: 'text-[10px] font-medium text-zinc-500 line-through font-mono',
    price: 'text-xs font-bold text-emerald-300 font-mono',
  },
  md: {
    wrap: 'gap-1',
    mrp: 'text-xs font-medium text-zinc-500 line-through font-mono',
    price: 'text-base font-extrabold text-emerald-400 font-mono',
  },
  lg: {
    wrap: 'gap-1.5',
    mrp: 'text-lg font-medium text-zinc-500 line-through',
    price: 'text-3xl font-black text-white',
  },
  storefront: {
    wrap: 'gap-1',
    mrp: 'text-xs font-medium text-zinc-500 line-through',
    price: 'text-sm sm:text-base font-extrabold text-white',
  },
};

export default function ProductPriceDisplay({
  product,
  size = 'md',
  align = 'left',
  className = '',
  priceFractionDigits = 0,
}) {
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md;
  const showMrp = productShowsMrp(product);
  const alignClass =
    align === 'right' ? 'items-end text-right' : align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col ${styles.wrap} ${alignClass} ${className}`.trim()}>
      {showMrp ? (
        <span className={styles.mrp}>₹{formatInr(product.mrp, { minimumFractionDigits: priceFractionDigits })}</span>
      ) : null}
      <span className={styles.price}>
        ₹{formatInr(product.price, { minimumFractionDigits: priceFractionDigits })}
      </span>
    </div>
  );
}
