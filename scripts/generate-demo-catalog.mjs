/**
 * Generates fixtures/demo-catalog.json for NEXT_PUBLIC_DEMO_MODE.
 * Realistic RK Electronics sample catalog (small tree, shared placeholder image).
 * Run: node scripts/generate-demo-catalog.mjs
 */
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const fixturesDir = join(root, 'fixtures');
const publicDemoDir = join(root, 'public', 'demo');

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

/** Stable IDs so regenerating does not break bookmarks during local dev. */
const ID = {
  rootLaptops: 'a1000001-0000-4000-8000-000000000001',
  rootPhones: 'a1000001-0000-4000-8000-000000000002',
  rootDisplays: 'a1000001-0000-4000-8000-000000000003',
  rootAudio: 'a1000001-0000-4000-8000-000000000004',
  rootGaming: 'a1000001-0000-4000-8000-000000000005',
  subBusinessLaptops: 'a2000001-0000-4000-8000-000000000001',
  subConsumerLaptops: 'a2000001-0000-4000-8000-000000000002',
  subAndroid: 'a2000001-0000-4000-8000-000000000003',
  subIphone: 'a2000001-0000-4000-8000-000000000004',
  subTvs: 'a2000001-0000-4000-8000-000000000005',
  subMonitors: 'a2000001-0000-4000-8000-000000000006',
  subHeadphones: 'a2000001-0000-4000-8000-000000000007',
  subSpeakers: 'a2000001-0000-4000-8000-000000000008',
  subConsoles: 'a2000001-0000-4000-8000-000000000009',
  brandDellLaptop: 'a3000001-0000-4000-8000-000000000001',
  brandLenovo: 'a3000001-0000-4000-8000-000000000002',
  brandAppleLaptop: 'a3000001-0000-4000-8000-000000000003',
  brandAsus: 'a3000001-0000-4000-8000-000000000004',
  brandSamsungPhone: 'a3000001-0000-4000-8000-000000000005',
  brandOnePlus: 'a3000001-0000-4000-8000-000000000006',
  brandApplePhone: 'a3000001-0000-4000-8000-000000000007',
  brandSamsungTv: 'a3000001-0000-4000-8000-000000000008',
  brandLg: 'a3000001-0000-4000-8000-000000000009',
  brandDellMonitor: 'a3000001-0000-4000-8000-000000000010',
  brandBenq: 'a3000001-0000-4000-8000-000000000011',
  brandSonyAudio: 'a3000001-0000-4000-8000-000000000012',
  brandBose: 'a3000001-0000-4000-8000-000000000013',
  brandJbl: 'a3000001-0000-4000-8000-000000000014',
  brandSonyConsole: 'a3000001-0000-4000-8000-000000000015',
  brandMicrosoft: 'a3000001-0000-4000-8000-000000000016',
};

const CATALOG_TREE = [
  {
    id: ID.rootLaptops,
    name: 'Laptops & Computers',
    sort_order: 1,
    subs: [
      {
        id: ID.subBusinessLaptops,
        name: 'Business Laptops',
        sort_order: 1,
        brands: [
          { id: ID.brandDellLaptop, name: 'Dell', sort_order: 1 },
          { id: ID.brandLenovo, name: 'Lenovo', sort_order: 2 },
        ],
      },
      {
        id: ID.subConsumerLaptops,
        name: 'Consumer Laptops',
        sort_order: 2,
        brands: [
          { id: ID.brandAppleLaptop, name: 'Apple', sort_order: 1 },
          { id: ID.brandAsus, name: 'Asus', sort_order: 2 },
        ],
      },
    ],
  },
  {
    id: ID.rootPhones,
    name: 'Smartphones',
    sort_order: 2,
    subs: [
      {
        id: ID.subAndroid,
        name: 'Android',
        sort_order: 1,
        brands: [
          { id: ID.brandSamsungPhone, name: 'Samsung', sort_order: 1 },
          { id: ID.brandOnePlus, name: 'OnePlus', sort_order: 2 },
        ],
      },
      {
        id: ID.subIphone,
        name: 'iPhone',
        sort_order: 2,
        brands: [{ id: ID.brandApplePhone, name: 'Apple', sort_order: 1 }],
      },
    ],
  },
  {
    id: ID.rootDisplays,
    name: 'TVs & Displays',
    sort_order: 3,
    subs: [
      {
        id: ID.subTvs,
        name: 'Televisions',
        sort_order: 1,
        brands: [
          { id: ID.brandSamsungTv, name: 'Samsung', sort_order: 1 },
          { id: ID.brandLg, name: 'LG', sort_order: 2 },
        ],
      },
      {
        id: ID.subMonitors,
        name: 'Monitors',
        sort_order: 2,
        brands: [
          { id: ID.brandDellMonitor, name: 'Dell', sort_order: 1 },
          { id: ID.brandBenq, name: 'BenQ', sort_order: 2 },
        ],
      },
    ],
  },
  {
    id: ID.rootAudio,
    name: 'Audio',
    sort_order: 4,
    subs: [
      {
        id: ID.subHeadphones,
        name: 'Headphones',
        sort_order: 1,
        brands: [
          { id: ID.brandSonyAudio, name: 'Sony', sort_order: 1 },
          { id: ID.brandBose, name: 'Bose', sort_order: 2 },
        ],
      },
      {
        id: ID.subSpeakers,
        name: 'Speakers',
        sort_order: 2,
        brands: [{ id: ID.brandJbl, name: 'JBL', sort_order: 1 }],
      },
    ],
  },
  {
    id: ID.rootGaming,
    name: 'Gaming',
    sort_order: 5,
    subs: [
      {
        id: ID.subConsoles,
        name: 'Consoles',
        sort_order: 1,
        brands: [
          { id: ID.brandSonyConsole, name: 'Sony', sort_order: 1 },
          { id: ID.brandMicrosoft, name: 'Microsoft', sort_order: 2 },
        ],
      },
    ],
  },
];

const PRODUCT_FIXTURES = [
  {
    id: 'b1000001-0000-4000-8000-000000000001',
    brand_id: ID.brandDellLaptop,
    root_category_id: ID.rootLaptops,
    sub_category_id: ID.subBusinessLaptops,
    title: 'Dell Latitude 5420 — i5 / 16GB / 512GB SSD',
    sku_code: 'RK-LT-5420-001',
    price: 32999,
    condition: 'Refurbished',
    description:
      'Model: Dell Latitude 5420\nProcessor: Intel Core i5-1145G7 (11th Gen)\nRAM: 16 GB DDR4\nStorage: 512 GB NVMe SSD\nDisplay: 14" FHD (1920×1080)\nOS: Windows 11 Pro\nIncludes: Laptop, 65W USB-C charger\nWarranty: 6 months shop warranty',
    defect_notes:
      'Light keyboard shine. Minor scuffs on lid — screen and keyboard fully functional.',
    is_featured: true,
    sort_order: 1,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000002',
    brand_id: ID.brandDellLaptop,
    root_category_id: ID.rootLaptops,
    sub_category_id: ID.subBusinessLaptops,
    title: 'Dell Latitude 7430 — i7 / 16GB / 512GB SSD',
    sku_code: 'RK-LT-7430-001',
    price: 54999,
    condition: 'Refurbished',
    description:
      'Model: Dell Latitude 7430\nProcessor: Intel Core i7-1265U (12th Gen)\nRAM: 16 GB DDR4\nStorage: 512 GB NVMe SSD\nDisplay: 14" FHD+ (1920×1200)\nOS: Windows 11 Pro\nIncludes: Laptop, 65W USB-C charger\nWarranty: 6 months shop warranty',
    defect_notes: 'Small dent on bottom chassis. Battery holds ~4 hours under normal use.',
    is_featured: false,
    sort_order: 2,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000003',
    brand_id: ID.brandLenovo,
    root_category_id: ID.rootLaptops,
    sub_category_id: ID.subBusinessLaptops,
    title: 'Lenovo ThinkPad T14 Gen 2 — Ryzen 5 / 16GB / 512GB',
    sku_code: 'RK-LT-T14G2-001',
    price: 38999,
    condition: 'Refurbished',
    description:
      'Model: Lenovo ThinkPad T14 Gen 2\nProcessor: AMD Ryzen 5 Pro 5650U\nRAM: 16 GB DDR4\nStorage: 512 GB NVMe SSD\nDisplay: 14" FHD IPS\nIncludes: Laptop, 65W charger\nWarranty: 6 months shop warranty',
    defect_notes: 'TrackPoint cap replaced. Faint wear marks on palm rest.',
    is_featured: true,
    sort_order: 3,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000004',
    brand_id: ID.brandLenovo,
    root_category_id: ID.rootLaptops,
    sub_category_id: ID.subBusinessLaptops,
    title: 'Lenovo ThinkPad X1 Carbon Gen 9 — i5 / 16GB / 512GB',
    sku_code: 'RK-LT-X1C9-001',
    price: 62999,
    condition: 'Used',
    description:
      'Model: Lenovo ThinkPad X1 Carbon Gen 9\nProcessor: Intel Core i5-1135G7\nRAM: 16 GB LPDDR4X\nStorage: 512 GB NVMe SSD\nDisplay: 14" FHD IPS\nWeight: ~1.13 kg\nIncludes: Laptop, USB-C charger\nWarranty: 3 months shop warranty',
    defect_notes: 'Minor bezel scratch. All ports tested and working.',
    is_featured: false,
    sort_order: 4,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000005',
    brand_id: ID.brandAppleLaptop,
    root_category_id: ID.rootLaptops,
    sub_category_id: ID.subConsumerLaptops,
    title: 'MacBook Air M1 (2020) — 8GB / 256GB Space Gray',
    sku_code: 'RK-LT-MBA-M1-001',
    price: 54999,
    condition: 'Refurbished',
    description:
      'Model: MacBook Air (M1, 2020)\nChip: Apple M1\nRAM: 8 GB unified memory\nStorage: 256 GB SSD\nDisplay: 13.3" Retina\nIncludes: Laptop, 30W USB-C charger\nWarranty: 6 months shop warranty',
    defect_notes: 'Light scratches on lid. Cycle count ~180. Keyboard and display excellent.',
    is_featured: true,
    sort_order: 5,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000006',
    brand_id: ID.brandAsus,
    root_category_id: ID.rootLaptops,
    sub_category_id: ID.subConsumerLaptops,
    title: 'Asus VivoBook 15 — i5 / 8GB / 512GB SSD',
    sku_code: 'RK-LT-VB15-001',
    price: 34999,
    condition: 'Refurbished',
    description:
      'Model: Asus VivoBook 15 X1502\nProcessor: Intel Core i5-1235U\nRAM: 8 GB DDR4 (upgradeable)\nStorage: 512 GB NVMe SSD\nDisplay: 15.6" FHD\nIncludes: Laptop, charger\nWarranty: 6 months shop warranty',
    defect_notes: null,
    is_featured: false,
    sort_order: 6,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000007',
    brand_id: ID.brandSamsungPhone,
    root_category_id: ID.rootPhones,
    sub_category_id: ID.subAndroid,
    title: 'Samsung Galaxy S21 5G — 128GB Phantom Gray',
    sku_code: 'RK-PH-S21-001',
    price: 18999,
    condition: 'Used',
    description:
      'Model: Samsung Galaxy S21 5G (SM-G991B)\nStorage: 128 GB\nDisplay: 6.2" Dynamic AMOLED\nBattery health: ~87%\nIncludes: Phone only (no box)\nWarranty: 3 months shop warranty',
    defect_notes: 'Small scratch on rear glass near camera. Face unlock and fingerprint work normally.',
    is_featured: false,
    sort_order: 7,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000008',
    brand_id: ID.brandSamsungPhone,
    root_category_id: ID.rootPhones,
    sub_category_id: ID.subAndroid,
    title: 'Samsung Galaxy A54 5G — 8GB / 256GB Awesome Violet',
    sku_code: 'RK-PH-A54-001',
    price: 22999,
    condition: 'Refurbished',
    description:
      'Model: Samsung Galaxy A54 5G\nRAM: 8 GB\nStorage: 256 GB\nDisplay: 6.4" Super AMOLED 120Hz\nIncludes: Phone, 25W charger, USB-C cable\nWarranty: 6 months shop warranty',
    defect_notes: 'Screen protector applied. Minor edge wear on frame.',
    is_featured: true,
    sort_order: 8,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000009',
    brand_id: ID.brandOnePlus,
    root_category_id: ID.rootPhones,
    sub_category_id: ID.subAndroid,
    title: 'OnePlus 9 — 12GB / 256GB Astral Black',
    sku_code: 'RK-PH-OP9-001',
    price: 19999,
    condition: 'Used',
    description:
      'Model: OnePlus 9 (LE2111)\nRAM: 12 GB\nStorage: 256 GB\nDisplay: 6.55" Fluid AMOLED 120Hz\nIncludes: Phone, 65W Warp Charge adapter\nWarranty: 3 months shop warranty',
    defect_notes: 'Battery health ~82%. Small nick on corner — no impact on display.',
    is_featured: false,
    sort_order: 9,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000010',
    brand_id: ID.brandOnePlus,
    root_category_id: ID.rootPhones,
    sub_category_id: ID.subAndroid,
    title: 'OnePlus Nord CE 3 — 8GB / 128GB Chromatic Gray',
    sku_code: 'RK-PH-NCE3-001',
    price: 16999,
    condition: 'Refurbished',
    description:
      'Model: OnePlus Nord CE 3\nRAM: 8 GB\nStorage: 128 GB\nDisplay: 6.7" AMOLED 120Hz\nIncludes: Phone, 80W SUPERVOOC charger\nWarranty: 6 months shop warranty',
    defect_notes: null,
    is_featured: false,
    sort_order: 10,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000011',
    brand_id: ID.brandApplePhone,
    root_category_id: ID.rootPhones,
    sub_category_id: ID.subIphone,
    title: 'Apple iPhone 12 — 128GB Black',
    sku_code: 'RK-PH-IP12-001',
    price: 27999,
    condition: 'Refurbished',
    description:
      'Model: iPhone 12 (A2403)\nStorage: 128 GB\nDisplay: 6.1" Super Retina XDR\nBattery health: 88%\nIncludes: Phone only\nWarranty: 6 months shop warranty',
    defect_notes: 'Replaced battery. Light scratches on sides — screen clean.',
    is_featured: true,
    sort_order: 11,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000012',
    brand_id: ID.brandApplePhone,
    root_category_id: ID.rootPhones,
    sub_category_id: ID.subIphone,
    title: 'Apple iPhone 13 — 256GB Blue',
    sku_code: 'RK-PH-IP13-001',
    price: 42999,
    condition: 'Refurbished',
    description:
      'Model: iPhone 13\nStorage: 256 GB\nDisplay: 6.1" Super Retina XDR\nBattery health: 91%\nIncludes: Phone, Lightning cable\nWarranty: 6 months shop warranty',
    defect_notes: 'Minor scuff on back glass. Face ID and cameras fully tested.',
    is_featured: false,
    sort_order: 12,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000013',
    brand_id: ID.brandSamsungTv,
    root_category_id: ID.rootDisplays,
    sub_category_id: ID.subTvs,
    title: 'Samsung 43" Crystal 4K UA43AU7700',
    sku_code: 'RK-TV-S43-001',
    price: 24999,
    condition: 'Refurbished',
    description:
      'Model: Samsung UA43AU7700\nSize: 43"\nResolution: 4K UHD (3840×2160)\nSmart TV: Tizen OS\nIncludes: TV, stand, remote (no wall mount)\nWarranty: 6 months shop warranty',
    defect_notes: 'Stand feet show light wear. Panel uniform — no dead pixels.',
    is_featured: false,
    sort_order: 13,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000014',
    brand_id: ID.brandLg,
    root_category_id: ID.rootDisplays,
    sub_category_id: ID.subTvs,
    title: 'LG 55" 4K UHD Smart TV 55UQ7500',
    sku_code: 'RK-TV-LG55-001',
    price: 38999,
    condition: 'Refurbished',
    description:
      'Model: LG 55UQ7500\nSize: 55"\nResolution: 4K UHD\nSmart TV: webOS\nIncludes: TV, stand, Magic Remote\nWarranty: 6 months shop warranty',
    defect_notes: 'Remote battery cover missing — remote works. Minor bezel mark.',
    is_featured: true,
    sort_order: 14,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000015',
    brand_id: ID.brandDellMonitor,
    root_category_id: ID.rootDisplays,
    sub_category_id: ID.subMonitors,
    title: 'Dell UltraSharp U2722D — 27" QHD IPS',
    sku_code: 'RK-MN-U2722D-001',
    price: 27999,
    condition: 'Refurbished',
    description:
      'Model: Dell U2722D\nSize: 27"\nResolution: QHD (2560×1440)\nPanel: IPS, 60Hz\nPorts: USB-C (90W PD), HDMI, DisplayPort\nIncludes: Monitor, stand, power cable\nWarranty: 6 months shop warranty',
    defect_notes: 'One faint pressure mark visible on solid gray — not noticeable in normal use.',
    is_featured: false,
    sort_order: 15,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000016',
    brand_id: ID.brandBenq,
    root_category_id: ID.rootDisplays,
    sub_category_id: ID.subMonitors,
    title: 'BenQ GW2480 — 24" Full HD IPS',
    sku_code: 'RK-MN-GW2480-001',
    price: 7999,
    condition: 'Used',
    description:
      'Model: BenQ GW2480\nSize: 24"\nResolution: FHD (1920×1080)\nPanel: IPS\nFeatures: Low blue light, flicker-free\nIncludes: Monitor, stand, HDMI cable\nWarranty: 3 months shop warranty',
    defect_notes: 'Stand has light scratches. No backlight bleed.',
    is_featured: false,
    sort_order: 16,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000017',
    brand_id: ID.brandSonyAudio,
    root_category_id: ID.rootAudio,
    sub_category_id: ID.subHeadphones,
    title: 'Sony WH-1000XM4 — Black',
    sku_code: 'RK-AU-XM4-001',
    price: 16999,
    condition: 'New',
    description:
      'Model: Sony WH-1000XM4\nColour: Black\nFeatures: Active noise cancellation, 30hr battery, multipoint Bluetooth\nIncludes: Headphones, carry case, USB-C cable\nWarranty: 1 year manufacturer warranty',
    defect_notes: null,
    is_featured: true,
    sort_order: 17,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000018',
    brand_id: ID.brandBose,
    root_category_id: ID.rootAudio,
    sub_category_id: ID.subHeadphones,
    title: 'Bose QuietComfort 45 — Black',
    sku_code: 'RK-AU-QC45-001',
    price: 18999,
    condition: 'Refurbished',
    description:
      'Model: Bose QuietComfort 45\nColour: Black\nFeatures: ANC, 24hr battery, Aware Mode\nIncludes: Headphones, case, USB-C cable\nWarranty: 6 months shop warranty',
    defect_notes: 'Ear pads replaced. Headband padding in good condition.',
    is_featured: false,
    sort_order: 18,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000019',
    brand_id: ID.brandJbl,
    root_category_id: ID.rootAudio,
    sub_category_id: ID.subSpeakers,
    title: 'JBL Flip 6 — Portable Bluetooth Speaker',
    sku_code: 'RK-AU-FLIP6-001',
    price: 7499,
    condition: 'Refurbished',
    description:
      'Model: JBL Flip 6\nColour: Blue\nFeatures: IP67 waterproof, 12hr playtime, PartyBoost\nIncludes: Speaker, USB-C cable\nWarranty: 6 months shop warranty',
    defect_notes: 'Small scuff on grill mesh. Sound tested — no distortion.',
    is_featured: false,
    sort_order: 19,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000020',
    brand_id: ID.brandSonyConsole,
    root_category_id: ID.rootGaming,
    sub_category_id: ID.subConsoles,
    title: 'Sony PlayStation 5 (Disc Edition)',
    sku_code: 'RK-GM-PS5-001',
    price: 42999,
    condition: 'Used',
    description:
      'Model: PlayStation 5 (CFI-1200 series)\nEdition: Disc\nStorage: 825 GB SSD\nIncludes: Console, one DualSense controller, power cable, HDMI cable\nWarranty: 3 months shop warranty',
    defect_notes: 'Console only — no original box. Fan cleaned; runs quietly.',
    is_featured: true,
    sort_order: 20,
  },
  {
    id: 'b1000001-0000-4000-8000-000000000021',
    brand_id: ID.brandMicrosoft,
    root_category_id: ID.rootGaming,
    sub_category_id: ID.subConsoles,
    title: 'Microsoft Xbox Series S — 512GB',
    sku_code: 'RK-GM-XSS-001',
    price: 24999,
    condition: 'Refurbished',
    description:
      'Model: Xbox Series S\nStorage: 512 GB SSD\nResolution: Up to 1440p\nIncludes: Console, one wireless controller, power cable, HDMI cable\nWarranty: 6 months shop warranty',
    defect_notes: 'Controller thumbsticks show light wear. Console fully updated and tested.',
    is_featured: false,
    sort_order: 21,
  },
];

const categories = [];

for (const rootCat of CATALOG_TREE) {
  categories.push({
    id: rootCat.id,
    name: rootCat.name,
    type: 'root',
    parent_id: null,
    image_url: DEMO_IMAGE,
    sort_order: rootCat.sort_order,
    created_at: now,
  });

  for (const sub of rootCat.subs) {
    categories.push({
      id: sub.id,
      name: sub.name,
      type: 'sub',
      parent_id: rootCat.id,
      image_url: DEMO_IMAGE,
      sort_order: sub.sort_order,
      created_at: now,
    });

    for (const brand of sub.brands) {
      categories.push({
        id: brand.id,
        name: brand.name,
        type: 'brand',
        parent_id: sub.id,
        image_url: DEMO_IMAGE,
        sort_order: brand.sort_order,
        created_at: now,
      });
    }
  }
}

const products = PRODUCT_FIXTURES.map((p, index) => {
  // Stagger ages: ~half within 30 days (new arrivals), half older for realistic filtering.
  const daysAgo = index % 2 === 0 ? index % 20 : 35 + (index % 45);
  const createdAt = new Date(now);
  createdAt.setDate(createdAt.getDate() - daysAgo);

  return {
    ...p,
    image_urls: [DEMO_IMAGE],
    created_at: createdAt.toISOString(),
  };
});

const connections = [
  {
    id: 'c1000001-0000-4000-8000-000000000001',
    label: 'Sales — WhatsApp',
    type: 'Chat Link',
    value: 'https://wa.me/919876543210',
    is_active: true,
    created_at: now,
  },
  {
    id: 'c1000001-0000-4000-8000-000000000002',
    label: 'Phone inquiries',
    type: 'Phone',
    value: 'tel:+919876543210',
    is_active: true,
    created_at: now,
  },
  {
    id: 'c1000001-0000-4000-8000-000000000003',
    label: 'Email',
    type: 'Email',
    value: 'mailto:sales@rkelectronics.in',
    is_active: true,
    created_at: now,
  },
  {
    id: 'c1000001-0000-4000-8000-000000000004',
    label: 'Instagram — new arrivals',
    type: 'Social Channel',
    value: 'https://instagram.com/rkelectronics',
    is_active: true,
    created_at: now,
  },
  {
    id: 'c1000001-0000-4000-8000-000000000005',
    label: 'YouTube',
    type: 'Social Channel',
    value: 'https://youtube.com/@rkelectronics',
    is_active: true,
    created_at: now,
  },
  {
    id: 'c1000001-0000-4000-8000-000000000006',
    label: 'WhatsApp Channel',
    type: 'Social Channel',
    value: 'https://whatsapp.com/channel/rkelectronics',
    is_active: true,
    created_at: now,
  },
];

const rootCount = categories.filter((c) => c.type === 'root').length;
const subCount = categories.filter((c) => c.type === 'sub').length;
const brandCount = categories.filter((c) => c.type === 'brand').length;

const catalog = {
  meta: {
    generatedAt: now,
    rootCount,
    subCount,
    brandCount,
    productCount: products.length,
    note: 'Realistic local demo fixtures — not written to Supabase',
  },
  categories,
  products,
  connections,
};

const outPath = join(fixturesDir, 'demo-catalog.json');
writeFileSync(outPath, JSON.stringify(catalog, null, 2));

console.log(`Wrote ${outPath}`);
console.log(`  roots=${rootCount} subs=${subCount} brands=${brandCount} products=${products.length}`);
console.log(`  placeholder: public/demo/demo_image.webp`);
