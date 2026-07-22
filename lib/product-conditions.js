export const PRODUCT_CONDITIONS = ['New', 'Refurbished', 'Used'];

export const CONDITION_FILTER_OPTIONS = ['All', ...PRODUCT_CONDITIONS];

export function countProductsByCondition(products) {
  return products.reduce(
    (acc, { condition }) => {
      acc.total += 1;
      if (condition === 'New') acc.new += 1;
      else if (condition === 'Refurbished') acc.refurbished += 1;
      else if (condition === 'Used') acc.used += 1;
      else acc.other += 1;
      return acc;
    },
    { total: 0, new: 0, refurbished: 0, used: 0, other: 0 }
  );
}
