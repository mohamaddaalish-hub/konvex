import type {
  Product,
  Category,
  Brand,
  Application,
  Article,
  SiteSettings,
  Spec,
} from "../lib/types";

export const settings: SiteSettings = {
  name: "کانوکس",
  englishName: "KONVEX",
  tagline: "ابزارِ کارِ حرفه‌ای",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  hours: "",
  mapUrl: "",
  instagram: "",
  linkedin: "",
  sampleMode: true,
};
export const brands: Brand[] = [
  {
    id: "konvex",
    name: "کانوکس",
    english: "KONVEX",
    description:
      "ابزار و تجهیزات صنعتی؛ از انتخاب دقیق تا اجرای حرفه‌ای. کاتالوگ کانوکس، مشخصات و کاربرد ابزار را در مرکز تجربه انتخاب قرار می‌دهد.",
    logo: "",
  },
];
export const categories: Category[] = [
  {
    id: "concrete-chisels",
    slug: "concrete-chisels",
    name: "قلم بتن‌کن",
    english: "CONCRETE",
    description: "برای تخریب دقیق و پیشروی مطمئن در بتن",
    image: "/images/chisels.webp",
    order: 1,
    filters: [
      { key: "type", label: "نوع قلم" },
      { key: "shank", label: "نوع اتصال" },
      { key: "length", label: "طول", numeric: true },
      { key: "diameter", label: "قطر", numeric: true },
      { key: "material", label: "جنس" },
    ],
  },
  {
    id: "industrial-casters",
    slug: "industrial-casters",
    name: "چرخ صنعتی",
    english: "INDUSTRIAL",
    description: "حرکت روان، متناسب با بار و محیط کار",
    image: "/images/caster.webp",
    order: 2,
    filters: [
      { key: "diameter", label: "قطر چرخ", numeric: true },
      { key: "capacity", label: "ظرفیت هر چرخ", numeric: true },
      { key: "type", label: "نوع حرکت" },
      { key: "brake", label: "ترمز" },
      { key: "material", label: "جنس رویه" },
      { key: "height", label: "ارتفاع نصب", numeric: true },
    ],
  },
  {
    id: "spirit-levels",
    slug: "spirit-levels",
    name: "تراز",
    english: "LEVELLING",
    description: "وقتی کوچک‌ترین انحراف اهمیت دارد",
    image: "/images/level.webp",
    order: 3,
    filters: [
      { key: "length", label: "طول", numeric: true },
      { key: "accuracy", label: "دقت" },
      { key: "magnetic", label: "آهن‌ربا" },
      { key: "vials", label: "تعداد محفظه" },
      { key: "material", label: "جنس بدنه" },
    ],
  },
  {
    id: "laser-distance-meters",
    slug: "laser-distance-meters",
    name: "متر لیزری",
    english: "MEASUREMENT",
    description: "فاصله، مساحت و حجم؛ ساده و دقیق",
    image: "/images/laser.webp",
    order: 4,
    filters: [
      { key: "range", label: "برد اندازه‌گیری", numeric: true },
      { key: "accuracy", label: "دقت" },
      { key: "measurement", label: "نوع اندازه‌گیری" },
      { key: "protection", label: "درجه حفاظت" },
      { key: "battery", label: "نوع باتری" },
      { key: "bluetooth", label: "بلوتوث" },
    ],
  },
  {
    id: "abrasives",
    slug: "abrasives",
    name: "محصولات سایش",
    english: "ABRASIVES",
    description: "برش تمیز و پرداخت حرفه‌ای سطوح",
    image: "/images/abrasives.webp",
    order: 5,
    filters: [
      { key: "diameter", label: "قطر صفحه", numeric: true },
      { key: "thickness", label: "ضخامت", numeric: true },
      { key: "bore", label: "قطر سوراخ مرکزی" },
      { key: "workpiece", label: "جنس قطعه‌کار" },
      { key: "rpm", label: "حداکثر دور مجاز", numeric: true },
      { key: "type", label: "نوع صفحه" },
    ],
  },
  {
    id: "accessories",
    slug: "accessories",
    name: "متعلقات",
    english: "ACCESSORIES",
    description: "جزئیات تکمیلی برای یک مجموعه کاربردی",
    image: "/images/accessories.webp",
    order: 6,
    filters: [
      { key: "type", label: "نوع متعلقات" },
      { key: "material", label: "جنس" },
    ],
  },
];
export const applications: Application[] = [
  {
    id: "construction",
    slug: "construction",
    name: "ساختمان",
    title: "از اولین اندازه، تا آخرین جزئیات.",
    description:
      "برای اندازه‌گیری، تراز کردن و آماده‌سازی سطوح در پروژه‌های ساختمانی، ابزار را بر اساس مرحله کار انتخاب کنید.",
    image: "/images/measurement.webp",
    icon: "building",
    categories: ["laser-distance-meters", "spirit-levels", "concrete-chisels"],
  },
  {
    id: "workshop",
    slug: "workshop",
    name: "کارگاه",
    title: "همراهِ هر روزِ کارگاه شما.",
    description:
      "از برش و پرداخت تا جابه‌جایی تجهیزات؛ انتخاب‌های کاربردی برای یک کارگاه منظم و حرفه‌ای.",
    image: "/images/workshop.webp",
    icon: "workshop",
    categories: ["abrasives", "industrial-casters", "spirit-levels"],
  },
  {
    id: "industrial",
    slug: "industrial",
    name: "صنعت",
    title: "انتخابی متناسب با کارِ سنگین.",
    description:
      "ظرفیت بار، شرایط محیط و سازگاری را کنار هم بررسی کنید؛ برای تجهیز خطوط کار و نگهداری صنعتی.",
    image: "/images/hero.webp",
    icon: "factory",
    categories: ["industrial-casters", "abrasives"],
  },
  {
    id: "metalworking",
    slug: "metalworking",
    name: "فلزکاری",
    title: "دقتی که در نتیجه دیده می‌شود.",
    description:
      "برای هر آلیاژ و هر مرحله از کار، صفحه مناسب را پیدا کنید. برش، ساب و پرداخت را با مشخصات درست آغاز کنید.",
    image: "/images/workshop.webp",
    icon: "spark",
    categories: ["abrasives", "spirit-levels"],
  },
  {
    id: "concrete",
    slug: "concrete",
    name: "بتن",
    title: "برای سطوح سخت، انتخاب دقیق.",
    description:
      "نوع اتصال، شکل نوک و طول قلم، سه نقطه شروع انتخاب برای تخریب و شیارزنی بتن هستند.",
    image: "/images/hero.webp",
    icon: "blocks",
    categories: ["concrete-chisels", "abrasives", "laser-distance-meters"],
  },
  {
    id: "equipment",
    slug: "equipment",
    name: "تجهیزات",
    title: "حرکت بهتر، در هر گوشه کارگاه.",
    description:
      "چرخ مناسب را با توجه به وزن تجهیز، سطح زمین، جنس رویه و نیاز به ترمز انتخاب کنید.",
    image: "/images/caster.webp",
    icon: "settings",
    categories: ["industrial-casters", "accessories"],
  },
];
const s = (
  key: string,
  label: string,
  value: string,
  highlight = false,
): Spec => ({ key, label, value, highlight });
const base = (
  categoryId: string,
  index: number,
  fields: Partial<Product>,
): Product => {
  const category = categories.find((c) => c.id === categoryId)!;
  const id = `${categoryId}-${index}`;
  const stamp = `2026-08-${String(30 - index).padStart(2, "0")}T10:00:00.000Z`;
  return {
    id,
    sku: `KV-${category.order}${String(index).padStart(3, "0")}`,
    slug: id,
    brandId: "konvex",
    brand: "KONVEX",
    categoryId,
    subcategory: "",
    name: "",
    model: "",
    shortDescription: "",
    longDescription: "",
    specifications: [],
    applications: [],
    features: [],
    images: [
      {
        url: category.image,
        alt: `تصویر استودیویی نمونه از خانواده ${category.name} کانوکس`,
      },
      {
        url:
          categoryId === "laser-distance-meters"
            ? "/images/measurement.webp"
            : categoryId === "abrasives"
              ? "/images/workshop.webp"
              : "/images/hero.webp",
        alt: "تصویر مفهومی نمونه از کاربرد و مجموعه ابزار کانوکس",
      },
    ],
    videos: [],
    documents: [],
    manuals: [],
    warranty:
      "شرایط ضمانت این مدل هنوز تأیید نشده است. برای اطلاع از پوشش، مدت و شرایط خدمات، پیش از سفارش استعلام بگیرید.",
    availability: "inquiry",
    price: null,
    discount: 0,
    tags: [category.name, category.english, "کانوکس", "konvex"],
    relatedProductIds: [],
    compatibleProductIds: [],
    accessoryIds: [],
    included: ["یک عدد محصول نمونه معرفی‌شده"],
    faq: [
      {
        question: "آیا این مشخصات مبنای سفارش هستند؟",
        answer:
          "خیر. این صفحه بخشی از کاتالوگ نمونه است. مشخصات، تصاویر، موجودی و شرایط ضمانت باید پیش از سفارش از سوی کانوکس تأیید شوند.",
      },
      {
        question: "چطور قیمت و موجودی این مدل را بپرسم؟",
        answer:
          "از دکمه درخواست قیمت استفاده کنید و تعداد موردنیاز و توضیحات پروژه را بنویسید. در این نسخه، درخواست به‌صورت آزمایشی ثبت می‌شود و ارسال پیامک یا ایمیل فعال نیست.",
      },
    ],
    featured: index === 1,
    isNew: index === 1 || index === 2,
    popularityRank: 10 - index,
    isSample: true,
    seoTitle: "",
    seoDescription: "",
    createdAt: stamp,
    updatedAt: stamp,
    ...fields,
  };
};
const laserRanges = [60, 40, 80, 100, 30, 120];
const lasers = laserRanges.map((range, i) =>
  base("laser-distance-meters", i + 1, {
    slug: `konvex-lm-${range}${range >= 80 ? "-pro" : ""}`,
    model: `KV-LM${range}${range >= 80 ? " PRO" : ""}`,
    name: `متر لیزری ${range.toLocaleString("fa-IR")} متری${range >= 80 ? " حرفه‌ای" : ""}`,
    shortDescription:
      "اندازه‌گیری فاصله، مساحت و حجم؛ همراهی جمع‌وجور برای بازدید و اجرای پروژه.",
    longDescription:
      "برای برآورد دقیق‌تر فضا و کاهش رفت‌وآمدهای اندازه‌گیری، یک متر لیزری با برد متناسب با پروژه انتخاب کنید. این مدل نمونه، اندازه‌گیری فاصله و محاسبه مساحت و حجم را در بدنه‌ای جمع‌وجور معرفی می‌کند. برد اسمی در شرایط مناسب سطح و نور تعریف می‌شود؛ برای فضای بیرونی و سطوح بازتابنده، شرایط اندازه‌گیری را جداگانه بررسی کنید.",
    specifications: [
      s("range", "برد اندازه‌گیری", `${range} m`, true),
      s("accuracy", "دقت", range >= 60 ? "±1.5 mm" : "±2 mm", true),
      s("protection", "درجه حفاظت", range >= 80 ? "IP65" : "IP54", true),
      s("measurement", "نوع اندازه‌گیری", "فاصله، مساحت و حجم"),
      s("battery", "نوع باتری", range >= 80 ? "لیتیومی شارژی" : "2 × AAA"),
      s("bluetooth", "بلوتوث", range >= 80 ? "دارد" : "ندارد"),
      s("weight", "وزن", `${range >= 80 ? 165 : 120} g`),
      s("dimensions", "ابعاد", "115 × 50 × 28 mm"),
      s("laser", "کلاس لیزر", "Class 2"),
    ],
    applications: ["construction", "concrete", "workshop"],
    features: [
      "محاسبه فاصله، مساحت و حجم",
      "نمایشگر با نور پس‌زمینه برای خواندن در محیط کم‌نور",
      "اندازه‌گیری پیوسته برای پیدا کردن فاصله مناسب",
      "حافظه اندازه‌گیری و تغییر واحد",
    ],
    accessoryIds: ["accessories-1", "accessories-2"],
    included: ["متر لیزری", "کیف نگهداری نمونه", "بند مچی"],
    faq: [
      {
        question: "برای فضای داخلی، چه بردی مناسب است؟",
        answer:
          "برد را با توجه به بلندترین فاصله‌ای که معمولاً اندازه می‌گیرید انتخاب کنید. در بسیاری از فضاهای داخلی، بردهای کوتاه‌تر کافی‌اند؛ اما نور محیط، جنس سطح و روش اندازه‌گیری نیز بر نتیجه اثر دارند.",
      },
      {
        question: "آیا IP54 به معنی ضدآب بودن کامل است؟",
        answer:
          "خیر. درجه IP54 به حفاظت محدود در برابر گردوغبار و پاشش آب مربوط است؛ به معنی امکان غوطه‌وری نیست. درجه حفاظت این مدل نمونه است و باید در سند رسمی محصول تأیید شود.",
      },
      {
        question: "آیا می‌توان از لیزر به سمت چشم استفاده کرد؟",
        answer:
          "خیر. هرگز پرتو لیزر را به سمت چشم افراد یا سطوح بازتابنده هدایت نکنید. دستورالعمل ایمنی دستگاه را پیش از استفاده بخوانید.",
      },
    ],
  }),
);
const chiselData = [
  ["نوک‌تیز", 400, "SDS Max", 18],
  ["تخت", 250, "SDS Plus", 14],
  ["شیارزن", 400, "SDS Max", 18],
  ["تخت پهن", 600, "Hex 30", 30],
  ["نوک‌تیز", 280, "SDS Plus", 14],
  ["تخت", 400, "Hex 17", 17],
] as const;
const chisels = chiselData.map(([type, length, shank, diameter], i) =>
  base("concrete-chisels", i + 1, {
    slug: `konvex-chisel-${i + 1}-${length}`,
    model: `KV-CH${length}-${i + 1}`,
    name: `قلم بتن‌کن ${type} ${length.toLocaleString("fa-IR")} میلی‌متری`,
    subcategory: type,
    shortDescription: `قلم ${type} با اتصال ${shank}؛ برای کار روی بتن و مصالح سازگار.`,
    longDescription:
      "شکل نوک قلم و نوع اتصال باید با کار و دستگاه بتن‌کن هماهنگ باشند. مدل نوک‌تیز برای تمرکز نیرو، مدل تخت برای برداشت موضعی و مدل شیارزن برای ایجاد مسیر کاربرد دارند. جنس بتن، توان دستگاه و شرایط کار را پیش از انتخاب بررسی کنید. مشخصات این صفحه نمونه‌اند و جایگزین دستورالعمل سازنده نیستند.",
    specifications: [
      s("length", "طول", `${length} mm`, true),
      s("shank", "نوع اتصال", shank, true),
      s("diameter", "قطر بدنه", `${diameter} mm`, true),
      s("type", "نوع قلم", type),
      s("material", "جنس", "فولاد آلیاژی"),
      s("weight", "وزن", `${Math.round(length * 1.8)} g`),
    ],
    applications: ["concrete", "construction"],
    features: [
      "انتخاب شکل نوک متناسب با نوع تخریب",
      "اتصال مشخص برای بررسی سازگاری دستگاه",
      "بدنه فولادی با مقطع مناسب انتقال ضربه",
    ],
    included: ["یک عدد قلم بتن‌کن"],
  }),
);
const casterData = [
  [150, 400, "گردان", "دارد", "پلی‌یورتان"],
  [100, 200, "ثابت", "ندارد", "پلی‌یورتان"],
  [125, 250, "گردان", "دارد", "لاستیک"],
  [200, 600, "گردان", "ندارد", "پلی‌یورتان"],
  [100, 150, "گردان", "دارد", "نایلون"],
  [160, 500, "ثابت", "ندارد", "چدن"],
] as const;
const casters = casterData.map(
  ([diameter, capacity, type, brake, material], i) =>
    base("industrial-casters", i + 1, {
      slug: `konvex-caster-${diameter}-${i + 1}`,
      model: `KV-IC${diameter}-${i + 1}`,
      name: `چرخ صنعتی ${type}${brake === "دارد" ? " ترمزدار" : ""} ${diameter.toLocaleString("fa-IR")}`,
      subcategory: type,
      shortDescription: `رویه ${material}، ظرفیت اسمی نمونه ${capacity.toLocaleString("fa-IR")} کیلوگرم برای هر چرخ.`,
      longDescription:
        "برای انتخاب چرخ صنعتی، فقط وزن تجهیز کافی نیست. وضعیت کف، سرعت حرکت، توزیع بار، دمای محیط و نیاز به توقف ایمن را هم بررسی کنید. ظرفیت اعلام‌شده در این کاتالوگ نمونه مربوط به هر چرخ است و ظرفیت کل شاسی باید با درنظرگرفتن توزیع نامتوازن بار و شرایط واقعی محاسبه و تأیید شود.",
      specifications: [
        s("diameter", "قطر چرخ", `${diameter} mm`, true),
        s("capacity", "ظرفیت هر چرخ", `${capacity} kg`, true),
        s("material", "جنس رویه", material, true),
        s("type", "نوع حرکت", type),
        s("brake", "ترمز", brake),
        s("height", "ارتفاع نصب", `${diameter + 48} mm`),
        s("mount", "نوع نصب", "صفحه‌ای چهارپیچ"),
        s("weight", "وزن", `${(diameter / 70).toFixed(1)} kg`),
      ],
      applications: ["industrial", "equipment", "workshop"],
      features: [
        "انتخاب رویه متناسب با جنس کف و شرایط کار",
        "قابلیت بررسی ابعاد و ارتفاع نصب",
        "مدل ثابت یا گردان برای طراحی مسیر حرکت",
      ],
    }),
);
const levelLengths = [60, 40, 80, 100, 30, 120];
const levels = levelLengths.map((length, i) =>
  base("spirit-levels", i + 1, {
    slug: `konvex-level-${length}`,
    model: `KV-SL${length}`,
    name: `تراز حرفه‌ای ${length.toLocaleString("fa-IR")} سانتی‌متری`,
    shortDescription:
      "بدنه آلومینیومی و محفظه‌های خوانا برای بررسی تراز سطوح در نصب و اجرا.",
    longDescription:
      "یک تراز مناسب باید با طول سطح، فضای کار و دقت موردنیاز سازگار باشد. این خانواده نمونه، ترازهای بدنه آلومینیومی در طول‌های مختلف را معرفی می‌کند. پیش از شروع کار، سلامت بدنه و محفظه‌ها را بررسی کنید و صحت قرائت را با آزمون چرخش کنترل کنید.",
    specifications: [
      s("length", "طول", `${length} cm`, true),
      s("accuracy", "دقت", "±0.5 mm/m", true),
      s("vials", "تعداد محفظه", "3", true),
      s("magnetic", "آهن‌ربا", i % 2 ? "ندارد" : "دارد"),
      s("material", "جنس بدنه", "آلومینیوم"),
      s("weight", "وزن", `${length * 9} g`),
    ],
    applications: ["construction", "metalworking", "workshop"],
    features: [
      "سه محفظه برای بررسی جهت‌های مختلف",
      "ضربه‌گیر انتهایی برای محافظت از بدنه",
      "سطح تماس مناسب برای قرائت پایدار",
    ],
  }),
);
const abrasiveData = [
  [125, 1.2, "فلز", "برش", 12200],
  [115, 6, "فلز", "ساب", 13300],
  [180, 3, "سنگ", "برش", 8500],
  [230, 3, "بتن", "برش", 6600],
  [125, 6, "فلز", "ساب", 12200],
  [115, 1, "استیل", "برش", 13300],
] as const;
const abrasives = abrasiveData.map(
  ([diameter, thickness, workpiece, type, rpm], i) =>
    base("abrasives", i + 1, {
      slug: `konvex-disc-${diameter}-${i + 1}`,
      model: `KV-AD${diameter}-${i + 1}`,
      name: `صفحه ${type} ${workpiece} ${diameter.toLocaleString("fa-IR")} میلی‌متری`,
      subcategory: type,
      shortDescription: `قطر ${diameter.toLocaleString("fa-IR")} و ضخامت ${thickness.toLocaleString("fa-IR")} میلی‌متر؛ برای ${type} ${workpiece}.`,
      longDescription:
        "صفحه را با توجه به جنس قطعه‌کار، نوع عملیات، قطر مجاز دستگاه و سرعت آن انتخاب کنید. سرعت مجاز صفحه باید با سرعت دستگاه سازگار باشد و هرگز کمتر از آن نباشد. از صفحه برش برای ساب جانبی استفاده نکنید. محافظ دستگاه و تجهیزات حفاظت فردی باید مطابق دستورالعمل سازنده استفاده شوند. اطلاعات این مدل صرفاً نمونه است.",
      specifications: [
        s("diameter", "قطر صفحه", `${diameter} mm`, true),
        s("thickness", "ضخامت", `${thickness} mm`, true),
        s("rpm", "حداکثر دور مجاز", `${rpm} rpm`, true),
        s("bore", "قطر سوراخ مرکزی", "22.23 mm"),
        s("workpiece", "جنس قطعه‌کار", workpiece),
        s("type", "نوع صفحه", type),
        s(
          "material",
          "نوع ساینده",
          workpiece === "فلز" || workpiece === "استیل"
            ? "آلومینیوم اکسید"
            : "سیلیکون کارباید",
        ),
      ],
      applications: [
        "metalworking",
        "workshop",
        ...(workpiece === "بتن" ? ["concrete", "construction"] : []),
      ],
      features: [
        "انتخاب صفحه متناسب با جنس قطعه‌کار",
        "نمایش قطر و ضخامت برای تطبیق با دستگاه",
        "مشخص بودن حداکثر سرعت مجاز در کاتالوگ نمونه",
      ],
    }),
);
const accessories = [
  base("accessories", 1, {
    slug: "konvex-meter-case",
    model: "KV-BG01",
    name: "کیف نگهداری متر لیزری",
    shortDescription:
      "کیف محافظ برای نگهداری و حمل متر لیزری؛ سازگاری ابعاد پیش از سفارش بررسی شود.",
    longDescription:
      "برای حمل و نگهداری متر لیزری، کیف متناسب با ابعاد دستگاه انتخاب کنید. تصویر این محصول نمایشی است و تصویر مجموعه متعلقات برای معرفی خانواده محصول استفاده شده است.",
    specifications: [
      s("type", "نوع متعلقات", "کیف"),
      s("material", "جنس", "پارچه مقاوم"),
      s("dimensions", "ابعاد داخلی", "130 × 65 × 40 mm"),
    ],
    images: [
      {
        url: "/images/accessories.webp",
        alt: "تصویر نمونه متعلقات متر لیزری؛ کیف نگهداری و بند مچی",
      },
    ],
    applications: ["construction", "equipment"],
    featured: false,
    isNew: false,
    compatibleProductIds: lasers.map((p) => p.id),
  }),
  base("accessories", 2, {
    slug: "konvex-meter-wrist-strap",
    model: "KV-WS01",
    name: "بند مچی متر لیزری",
    shortDescription:
      "متعلقات نگهداری متر لیزری؛ نوع محل اتصال دستگاه باید بررسی شود.",
    longDescription:
      "بند مچی، جایگزین نگهداری صحیح دستگاه نیست. پیش از استفاده، سلامت بند و سازگاری محل اتصال را بررسی کنید. تصویر این محصول نمایشی است و تصویر مجموعه متعلقات برای معرفی خانواده محصول استفاده شده است.",
    specifications: [
      s("type", "نوع متعلقات", "بند مچی"),
      s("material", "جنس", "نایلون"),
    ],
    images: [
      {
        url: "/images/accessories.webp",
        alt: "تصویر نمونه متعلقات متر لیزری؛ بند مچی و کیف نگهداری",
      },
    ],
    applications: ["construction", "equipment"],
    featured: false,
    isNew: false,
    compatibleProductIds: lasers.map((p) => p.id),
  }),
];
export const products: Product[] = [
  ...chisels,
  ...casters,
  ...levels,
  ...lasers,
  ...abrasives,
  ...accessories,
].map((p) => ({
  ...p,
  seoTitle: `${p.name} ${p.model} | کانوکس`,
  seoDescription: `مشخصات فنی، کاربرد و مقایسه ${p.name} مدل ${p.model}. دریافت قیمت و بررسی سازگاری در کانوکس. کاتالوگ نمونه.`,
}));
export const articles: Article[] = [
  {
    id: "choose-laser",
    slug: "laser-distance-meter-buying-guide",
    title: "متر لیزری مناسب پروژه شما کدام است؟",
    excerpt:
      "برد بیشتر همیشه انتخاب بهتر نیست. دقت، شرایط محیط و قابلیت‌های واقعاً موردنیاز را بشناسید.",
    image: "/images/measurement.webp",
    category: "راهنمای انتخاب",
    readTime: 6,
    relatedCategory: "laser-distance-meters",
    publishedAt: "2026-08-24",
    seoTitle: "راهنمای انتخاب متر لیزری | دانشنامه کانوکس",
    seoDescription:
      "نکات کاربردی انتخاب متر لیزری بر اساس برد، دقت، شرایط محیط و حفاظت.",
    sections: [
      {
        title: "از فاصله‌های واقعی پروژه شروع کنید",
        body: "بلندترین فاصله‌ای را که به‌طور معمول اندازه می‌گیرید مشخص کنید. برد اسمی ابزار در شرایط آزمون مناسب تعریف می‌شود؛ نور شدید، سطح تیره یا بازتابنده و زاویه نامناسب می‌تواند قرائت را دشوار کند. صرفاً به بزرگ‌ترین عدد روی جعبه تکیه نکنید.",
      },
      {
        title: "برد و دقت، دو ویژگی متفاوت‌اند",
        body: "برد، محدوده قابل اندازه‌گیری است؛ دقت، میزان انحراف اعلام‌شده در شرایط مشخص. در برآورد ابعاد یک فضا و در نصب جزئیات ظریف، نیازها یکسان نیستند. دقت را همراه با روش اندازه‌گیری، مرجع جلویی یا پشتی دستگاه و شرایط اعلام‌شده در دفترچه بررسی کنید.",
      },
      {
        title: "قابلیت‌هایی که واقعاً استفاده می‌کنید",
        body: "محاسبه مساحت و حجم، اندازه‌گیری پیوسته، حافظه و انتقال داده می‌توانند کار را ساده‌تر کنند. اما برای انتخاب، ابتدا کارهای پرتکرار خود را بنویسید. قابلیت بیشتر بدون نیاز واقعی، الزاماً انتخاب بهتری نیست.",
      },
      {
        title: "ایمنی و حفاظت محیطی",
        body: "پرتو لیزر را به سمت چشم هدایت نکنید و به سطوح بازتابنده توجه کنید. درجه IP را از دفترچه رسمی بخوانید؛ مقاومت در برابر پاشش آب با امکان غوطه‌وری فرق دارد. ابزار را مطابق دستورالعمل نگهداری و در صورت نیاز کالیبره کنید.",
      },
    ],
  },
  {
    id: "choose-disc",
    slug: "cutting-and-grinding-disc-guide",
    title: "صفحه برش یا ساب؟ درست انتخاب کنید.",
    excerpt:
      "تفاوت فقط در ضخامت نیست؛ جنس قطعه‌کار، دور دستگاه و نوع عملیات تعیین‌کننده‌اند.",
    image: "/images/workshop.webp",
    category: "دانش فنی",
    readTime: 5,
    relatedCategory: "abrasives",
    publishedAt: "2026-08-20",
    seoTitle: "تفاوت صفحه برش و صفحه ساب | کانوکس",
    seoDescription:
      "راهنمای انتخاب صفحه مناسب برش و ساب و نکات مهم سازگاری و ایمنی.",
    sections: [
      {
        title: "نوع عملیات را مشخص کنید",
        body: "صفحه برش برای جدا کردن قطعه و صفحه ساب برای برداشت و پرداخت سطح طراحی شده است. فشار جانبی روی صفحه برش می‌تواند خطرناک باشد؛ از هر صفحه فقط برای کاربری تأییدشده سازنده استفاده کنید.",
      },
      {
        title: "چهار عدد مهم روی صفحه",
        body: "قطر، ضخامت، قطر سوراخ مرکزی و حداکثر دور مجاز را با مشخصات دستگاه تطبیق دهید. صفحه‌ای با قطر نامناسب یا سرعت مجاز کمتر از سرعت دستگاه انتخاب نکنید. نصب و محافظ باید دقیقاً مطابق دستورالعمل دستگاه باشد.",
      },
      {
        title: "جنس قطعه‌کار اهمیت دارد",
        body: "صفحه مناسب فلز، استیل، سنگ یا بتن یکسان نیست. ترکیب ساینده و نوع اتصال باید برای قطعه‌کار مجاز باشد. عبارت عمومی همه‌کاره را جایگزین بررسی برچسب رسمی و دفترچه نکنید.",
      },
      {
        title: "پیش از هر بار استفاده",
        body: "صفحه را از نظر ترک، آسیب، شرایط نگهداری و تاریخ مصرف احتمالی بررسی کنید. از محافظ دستگاه و تجهیزات حفاظت چشم، صورت، شنوایی و تنفس مطابق ارزیابی خطر و دستورالعمل استفاده کنید. قطعه‌کار باید مهار شده باشد.",
      },
    ],
  },
  {
    id: "choose-caster",
    slug: "industrial-caster-selection-guide",
    title: "پنج نکته برای انتخاب چرخ صنعتی",
    excerpt:
      "ظرفیت بار، جنس رویه و شرایط کف؛ جزئیاتی که حرکت تجهیزات را تغییر می‌دهند.",
    image: "/images/caster.webp",
    category: "راهنمای انتخاب",
    readTime: 7,
    relatedCategory: "industrial-casters",
    publishedAt: "2026-08-15",
    seoTitle: "راهنمای انتخاب چرخ صنعتی | کانوکس",
    seoDescription:
      "چگونه ظرفیت بار، نوع حرکت، ترمز و جنس چرخ صنعتی مناسب را انتخاب کنیم؟",
    sections: [
      {
        title: "ظرفیت را فقط تقسیم بر چهار نکنید",
        body: "وزن تجهیز به‌همراه بار، شرایط حرکت و توزیع نامتوازن وزن را در نظر بگیرید. روی سطح ناهموار ممکن است همه چرخ‌ها همزمان بار یکسانی تحمل نکنند. ضریب طراحی و ظرفیت مجموعه را با سازنده یا کارشناس تأیید کنید.",
      },
      {
        title: "جنس رویه و جنس کف",
        body: "پلی‌یورتان، لاستیک، نایلون و چدن رفتار متفاوتی از نظر صدا، مقاومت حرکت، اثر روی کف و تحمل شرایط محیطی دارند. رطوبت، مواد شیمیایی، دما و وضعیت سطح باید در انتخاب دیده شوند.",
      },
      {
        title: "ثابت، گردان یا ترکیبی؟",
        body: "چرخ ثابت حرکت خطی را هدایت می‌کند و چرخ گردان تغییر جهت را آسان‌تر می‌کند. آرایش مناسب به طول مسیر، فضای مانور و شکل شاسی وابسته است؛ انتخاب همه چرخ‌ها به یک شکل همیشه بهترین نتیجه را ندارد.",
      },
      {
        title: "ترمز و ارتفاع نصب",
        body: "نوع ترمز را بررسی کنید: بعضی مدل‌ها فقط چرخ را متوقف می‌کنند و برخی چرخ و گردان را قفل می‌کنند. ارتفاع کل، ابعاد صفحه نصب و فاصله سوراخ‌ها باید با تجهیز سازگار باشند.",
      },
      {
        title: "قبل از سفارش، شرایط را بنویسید",
        body: "وزن کل، نوع کف، سرعت و تناوب حرکت، شرایط محیطی و ابعاد نصب را در درخواست قیمت درج کنید. این اطلاعات انتخاب مدل سازگار و مقایسه پیشنهادها را ساده‌تر می‌کند.",
      },
    ],
  },
  {
    id: "choose-chisel",
    slug: "concrete-chisel-shank-guide",
    title: "راهنمای انتخاب قلم و اتصال بتن‌کن",
    excerpt: "تفاوت قلم نوک‌تیز، تخت و شیارزن و اهمیت اتصال سازگار با دستگاه.",
    image: "/images/chisels.webp",
    category: "راهنمای انتخاب",
    readTime: 5,
    relatedCategory: "concrete-chisels",
    publishedAt: "2026-08-10",
    seoTitle: "انتخاب قلم بتن‌کن و نوع اتصال | کانوکس",
    seoDescription:
      "مقایسه قلم تخت و نوک‌تیز و اتصال SDS Plus، SDS Max و شش‌گوش.",
    sections: [
      {
        title: "ابتدا نوع ابزارگیر را بررسی کنید",
        body: "SDS Plus، SDS Max و اتصال‌های شش‌گوش همگی قابل جایگزینی با یکدیگر نیستند. مدل دقیق دستگاه و اتصال مجاز را از دفترچه آن بخوانید و با مشخصات قلم تطبیق دهید.",
      },
      {
        title: "شکل نوک را متناسب با کار انتخاب کنید",
        body: "نوک‌تیز نیرو را روی ناحیه کوچک متمرکز می‌کند؛ تخت برای برداشت کنترل‌شده سطح و شیارزن برای ایجاد مسیر کاربرد دارد. کاربری دقیق هر قلم به طراحی و تأیید سازنده بستگی دارد.",
      },
      {
        title: "طول بیشتر همیشه بهتر نیست",
        body: "طول را بر اساس دسترسی و کنترل انتخاب کنید. در بسیاری از کارها، قلم بلندتر کنترل متفاوت و نیاز به توجه بیشتر به زاویه کار دارد. از قلم آسیب‌دیده استفاده نکنید و با ابزار بدون مهار مناسب کار نکنید.",
      },
    ],
  },
  {
    id: "choose-level",
    slug: "spirit-level-selection-guide",
    title: "تراز مناسب؛ از طول تا دقت قرائت",
    excerpt:
      "چگونه بین طول، دقت و قابلیت مغناطیسی انتخاب متناسب با کار داشته باشیم؟",
    image: "/images/level.webp",
    category: "دانش فنی",
    readTime: 4,
    relatedCategory: "spirit-levels",
    publishedAt: "2026-08-05",
    seoTitle: "راهنمای انتخاب تراز دستی | کانوکس",
    seoDescription: "انتخاب تراز بر اساس طول، دقت و جنس سطح کار.",
    sections: [
      {
        title: "طول متناسب با سطح",
        body: "برای سطوح بلند، طول مناسب می‌تواند ارزیابی بهتری از سطح بدهد؛ برای نصب در فضای محدود، تراز کوتاه‌تر کاربردی است. طول را با توجه به سطح تماس واقعی و فضای در دسترس انتخاب کنید.",
      },
      {
        title: "دقت را همراه واحد بخوانید",
        body: "دقت معمولاً به صورت میلی‌متر بر متر بیان می‌شود. عدد کوچک‌تر به‌تنهایی کافی نیست؛ سلامت بدنه، روش قرار دادن و شرایط قرائت نیز اهمیت دارند. مشخصه رسمی هر مدل را از سند سازنده بررسی کنید.",
      },
      {
        title: "سلامت ابزار را کنترل کنید",
        body: "سطح تماس و محفظه‌ها را تمیز نگه دارید. بعد از ضربه یا پیش از کار حساس، قرائت را با روش توصیه‌شده سازنده کنترل کنید. آهن‌ربا روی سطح فلزی می‌تواند نگهداری را ساده کند، اما جایگزین بررسی پایداری و صحت قرائت نیست.",
      },
    ],
  },
];
