/**
 * Generates fixtures/demo-catalog.json for NEXT_PUBLIC_DEMO_MODE.
 * Run: node scripts/generate-demo-catalog.mjs
 */
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const fixturesDir = join(root, 'fixtures');
const publicDemoDir = join(root, 'public', 'demo');

const CONDITIONS = ['New', 'Refurbished', 'Used'];
const ADJECTIVES = [
  'Prime', 'Elite', 'Studio', 'Compact', 'Pro', 'Lite', 'Max', 'Ultra',
  'Core', 'Edge', 'Swift', 'Nova', 'Apex', 'Pulse', 'Flux', 'Orbit',
];
const NOUNS = [
  'Laptop', 'Monitor', 'Keyboard', 'Mouse', 'SSD', 'HDD', 'Router', 'Tablet',
  'Phone', 'Headset', 'Speaker', 'Webcam', 'GPU', 'PSU', 'Motherboard', 'RAM Kit',
];

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function sku(n) {
  return `SKU-DEMO${String(n).padStart(4, '0')}`;
}

mkdirSync(fixturesDir, { recursive: true });
mkdirSync(publicDemoDir, { recursive: true });

const demoImageSrc = join(root, 'demo_image.webp');
const demoImageDest = join(publicDemoDir, 'demo_image.webp');
if (existsSync(demoImageSrc)) {
  copyFileSync(demoImageSrc, demoImageDest);
} else if (!existsSync(demoImageDest)) {
  throw new Error('Missing demo_image.webp (repo root or public/demo/demo_image.webp)');
}

const DEMO_IMAGE = '/demo/demo_image.webp';
const now = new Date().toISOString();

const categories = [];
const products = [];
const brandsFlat = []; // { id, rootId, subId, name }

const ROOT_COUNT = 30;
const HEAVY_ROOT_COUNT = 3; // 30 subs each
const HEAVY_SUB_COUNT = 30;

for (let r = 0; r < ROOT_COUNT; r++) {
  const rootId = randomUUID();
  const rootName = `Root Cat ${String(r + 1).padStart(2, '0')}`;
  categories.push({
    id: rootId,
    name: rootName,
    type: 'root',
    parent_id: null,
    sort_order: r + 1,
    created_at: now,
  });

  const isHeavyRoot = r < HEAVY_ROOT_COUNT;
  const subCount = isHeavyRoot ? HEAVY_SUB_COUNT : randInt(1, 5);

  for (let s = 0; s < subCount; s++) {
    const subId = randomUUID();
    categories.push({
      id: subId,
      name: isHeavyRoot
        ? `${rootName} Sub ${String(s + 1).padStart(2, '0')}`
        : `Sub ${r + 1}.${s + 1}`,
      type: 'sub',
      parent_id: rootId,
      sort_order: s + 1,
      created_at: now,
    });

    const brandCount = randInt(1, 3);
    for (let b = 0; b < brandCount; b++) {
      const brandId = randomUUID();
      const brandName = `Brand ${r + 1}-${s + 1}-${b + 1}`;
      categories.push({
        id: brandId,
        name: brandName,
        type: 'brand',
        parent_id: subId,
        sort_order: b + 1,
        created_at: now,
      });
      brandsFlat.push({ id: brandId, rootId, subId, name: brandName });
    }
  }
}

// Ensure at least 2 brands exist for heavy product lists
if (brandsFlat.length < 2) {
  throw new Error('Not enough brands generated');
}

const heavyBrandA = brandsFlat[0];
const heavyBrandB = brandsFlat[Math.min(1, brandsFlat.length - 1)];
const HEAVY_PRODUCT_COUNT = 40;
const TARGET_TOTAL = 520;

let productIndex = 1;

function addProduct(brand, overrides = {}) {
  const n = productIndex++;
  const condition = pick(CONDITIONS);
  const title = `${pick(ADJECTIVES)} ${pick(NOUNS)} ${brand.name} #${n}`;
  products.push({
    id: randomUUID(),
    title,
    sku_code: sku(n),
    description: `Demo unit ${n}: ${title}. Generated for local UI testing only.`,
    price: randInt(999, 89999),
    condition,
    defect_notes:
      condition === 'New'
        ? null
        : `Minor cosmetic wear on sample ${n}. Demo fixture — not a real listing.`,
    is_featured: false,
    image_urls: [DEMO_IMAGE],
    root_category_id: brand.rootId,
    sub_category_id: brand.subId,
    brand_id: brand.id,
    sort_order: n,
    created_at: now,
    ...overrides,
  });
}

for (let i = 0; i < HEAVY_PRODUCT_COUNT; i++) addProduct(heavyBrandA);
for (let i = 0; i < HEAVY_PRODUCT_COUNT; i++) addProduct(heavyBrandB);

const remainingBrands = brandsFlat.filter(
  (b) => b.id !== heavyBrandA.id && b.id !== heavyBrandB.id
);

while (products.length < TARGET_TOTAL && remainingBrands.length > 0) {
  const brand = pick(remainingBrands);
  addProduct(brand);
}

// Mark ~12 featured
const featuredIdx = new Set();
while (featuredIdx.size < Math.min(12, products.length)) {
  featuredIdx.add(randInt(0, products.length - 1));
}
for (const i of featuredIdx) {
  products[i].is_featured = true;
}

const connections = [
  {
    id: randomUUID(),
    label: 'Demo Sales Line',
    type: 'Phone',
    value: 'tel:+911234567890',
    is_active: true,
    created_at: now,
  },
  {
    id: randomUUID(),
    label: 'Demo Support',
    type: 'Email',
    value: 'mailto:demo@rkelectronics.local',
    is_active: true,
    created_at: now,
  },
  {
    id: randomUUID(),
    label: 'Demo WhatsApp',
    type: 'Chat Link',
    value: 'https://wa.me/911234567890',
    is_active: true,
    created_at: now,
  },
];

const catalog = {
  meta: {
    generatedAt: now,
    rootCount: ROOT_COUNT,
    productCount: products.length,
    heavyRoots: HEAVY_ROOT_COUNT,
    heavySubsPerRoot: HEAVY_SUB_COUNT,
    heavyProductsPerBrand: HEAVY_PRODUCT_COUNT,
    note: 'Local demo fixtures — not written to Supabase',
  },
  categories,
  products,
  connections,
};

const outPath = join(fixturesDir, 'demo-catalog.json');
writeFileSync(outPath, JSON.stringify(catalog));

const rootStats = categories.filter((c) => c.type === 'root').length;
const subStats = categories.filter((c) => c.type === 'sub').length;
const brandStats = categories.filter((c) => c.type === 'brand').length;

console.log(`Wrote ${outPath}`);
console.log(`  roots=${rootStats} subs=${subStats} brands=${brandStats} products=${products.length}`);
console.log(`  heavy brand products: ${HEAVY_PRODUCT_COUNT} x 2`);
console.log(`  placeholder: public/demo/demo_image.webp`);
