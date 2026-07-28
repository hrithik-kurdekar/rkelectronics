import { ArrowDown } from 'lucide-react';
import { discountPercent, formatInr, productShowsMrp } from '@/lib/product-price';

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
    wrap: 'gap-x-4 gap-y-2',
    mrpStack: 'flex flex-col gap-0.5 shrink-0',
    mrpLabel: 'text-xs font-semibold uppercase tracking-wide text-zinc-500',
    mrp: 'text-lg font-medium text-zinc-500 line-through',
    price: 'text-3xl font-black text-white leading-none',
    discount:
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-bold shrink-0 self-end',
    discountIcon: 'w-3.5 h-3.5',
  },
  storefront: {
    wrap: 'gap-x-4 gap-y-1',
    mrpStack: 'flex flex-col gap-0.5 shrink-0',
    mrpGroup: 'inline-flex items-baseline gap-1',
    mrpLabel: 'text-[10px] font-semibold uppercase tracking-wide text-zinc-500',
    mrp: 'text-xs font-medium text-zinc-500 line-through leading-tight',
    price: 'text-base sm:text-lg font-black text-white leading-none',
    discount:
      'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold leading-none shrink-0 self-center',
    discountIcon: 'w-3 h-3',
  },
};

export default function ProductPriceDisplay({
  product,
  size = 'md',
  align = 'left',
  layout = 'stack',
  variant = 'default',
  className = '',
  priceFractionDigits = 0,
}) {
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md;
  const showMrp = productShowsMrp(product);
  const discount = showMrp ? discountPercent(product.price, product.mrp) : null;

  const alignClass =
    align === 'right'
      ? layout === 'inline' || variant === 'detailed'
        ? 'justify-end text-right'
        : 'items-end text-right'
      : align === 'center'
        ? layout === 'inline' || variant === 'detailed'
          ? 'justify-center text-center'
          : 'items-center text-center'
        : layout === 'inline' || variant === 'detailed'
          ? 'justify-start text-left'
          : 'items-start text-left';

  if (variant === 'detailed') {
    const discountIconClass = styles.discountIcon || 'w-3.5 h-3.5';
    const priceText = `₹${formatInr(product.price, { minimumFractionDigits: priceFractionDigits })}`;
    const mrpText = showMrp
      ? `₹${formatInr(product.mrp, { minimumFractionDigits: priceFractionDigits })}`
      : null;

    if (size === 'storefront') {
      return (
        <div className={`flex items-end w-full ${className}`.trim()}>
          {showMrp && styles.mrpStack ? (
            <div className={`${styles.mrpStack} w-[40%] shrink-0 text-left`}>
              <span className={styles.mrpLabel}>MRP</span>
              <span className={styles.mrp}>{mrpText}</span>
            </div>
          ) : null}
          <span
            className={`${styles.price} ${showMrp ? 'w-[60%] text-left pl-1 sm:pl-2 -translate-x-px' : 'w-full text-left'}`}
          >
            {priceText}
          </span>
        </div>
      );
    }

    return (
      <div className={`flex flex-wrap items-end ${styles.wrap} ${alignClass} ${className}`.trim()}>
        {showMrp && styles.mrpStack ? (
          <div className={styles.mrpStack}>
            <span className={styles.mrpLabel}>MRP</span>
            <span className={styles.mrp}>{mrpText}</span>
          </div>
        ) : null}
        <span className={styles.price}>{priceText}</span>
        {discount != null &&
        discount > 0 &&
        styles.discount &&
        size !== 'storefront' ? (
          <span className={styles.discount}>
            <ArrowDown className={discountIconClass} aria-hidden="true" />
            {discount}%
          </span>
        ) : null}
      </div>
    );
  }

  const layoutClass =
    layout === 'inline'
      ? `flex flex-row flex-wrap items-baseline ${styles.wrap} ${alignClass}`
      : `flex flex-col ${styles.wrap} ${alignClass}`;

  const showListPriceLabel = Boolean(showMrp && layout === 'inline' && styles.mrpGroup && styles.mrpLabel);

  return (
    <div className={`${layoutClass} ${className}`.trim()}>
      {showMrp ? (
        showListPriceLabel ? (
          <span className={styles.mrpGroup}>
            <span className={styles.mrpLabel}>Price</span>
            <span className={styles.mrp}>
              ₹{formatInr(product.mrp, { minimumFractionDigits: priceFractionDigits })}
            </span>
          </span>
        ) : (
          <span className={styles.mrp}>
            ₹{formatInr(product.mrp, { minimumFractionDigits: priceFractionDigits })}
          </span>
        )
      ) : null}
      <span className={styles.price}>
        ₹{formatInr(product.price, { minimumFractionDigits: priceFractionDigits })}
      </span>
    </div>
  );
}
