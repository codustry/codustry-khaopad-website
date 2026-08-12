/**
 * Homepage marketing copy, per locale.
 *
 * This is deliberately NOT Paraglide: these are structured content blocks
 * (arrays of works, pillars, stats) rather than app-shell UI strings.
 * Keeping them as one typed object per locale keeps the EN/TH structures
 * provably parallel and easy to edit in one sitting.
 */
import type { Locale } from "$lib/server/content/types";

export interface Work {
  key: string;
  name: string;
  /** Film-style story title — the emotional headline of the case. */
  story: string;
  tagline: string;
  description: string;
  tags: string[];
  href?: string;
  /** Brand accent — one of the Codustry logo tile colors. */
  color: string;
  /** Cover illustration under /images/works/ (16:9). */
  image?: string;
}

export interface Pillar {
  title: string;
  description: string;
  color: string;
}

export interface Stat {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
}

export interface Client {
  name: string;
  /** Official logo under /images/brands/; omit to render the name as text. */
  logo?: string;
  /** Tailwind sizing — logos have wildly different aspect ratios. */
  logoClass?: string;
  /** For light/cream logos that vanish on white: render as a dark silhouette. */
  darken?: boolean;
  /** For icon-only marks: render the name alongside the logo. */
  withName?: boolean;
}

export interface DistributionBrand {
  name: string;
  /** Official logo under /images/brands/. */
  logo: string;
  /** Tailwind sizing for the logo img (logos have different aspect ratios). */
  logoClass: string;
  /** One-line what-it-is. */
  note: string;
  /** The highlight: where/how we sell it. */
  channelLabel: string;
  channelHref: string;
  /** Accent color from the logo tile palette. */
  color: string;
}

export interface HomeContent {
  hero: {
    kicker: string;
    /** Lines of the main headline, revealed line-by-line. */
    headline: string[];
    sub: string;
    cta: string;
    ctaWorks: string;
  };
  marquee: string[];
  /** Short manifesto stanzas — the company story, told big. */
  manifesto: string[];
  pillarsTitle: string;
  pillarsKicker: string;
  pillars: Pillar[];
  worksTitle: string;
  worksKicker: string;
  works: Work[];
  stats: Stat[];
  clientsTitle: string;
  clients: Client[];
  distributionTitle: string;
  distributionSub: string;
  /** Brands we officially distribute or resell in Thailand. */
  distribution: DistributionBrand[];
  contact: {
    kicker: string;
    headline: string;
    sub: string;
    cta: string;
    email: string;
    phone: string;
    phoneHref: string;
    address: string;
    mapsUrl: string;
  };
}

/** Codustry logo tile palette. */
export const BRAND = {
  ink: "#181C38",
  mint: "#5AEDC5",
  cyan: "#25CBFF",
  pink: "#FA8098",
  indigo: "#4F65F1",
  amber: "#FFC15D",
} as const;

const en: HomeContent = {
  hero: {
    kicker: "Engineering for the real world",
    headline: ["Codustry is a", "small team building", "big technology."],
    sub: "From factory floors to storefronts — a small team amplified by AI-driven tools, designing, building and running technology end-to-end, with 10+ years of engineering behind it.",
    cta: "Talk with us",
    ctaWorks: "See our work",
  },
  marquee: [
    "AI",
    "Robotics",
    "Industrial IoT",
    "Smart Factory",
    "Computer Vision",
    "ERP",
    "Cloud Platforms",
    "Automation",
  ],
  manifesto: [
    "People expect more from technology than ever before. They shouldn't need an agency-sized budget to get it.",
    "We're a small team amplified by AI-driven tools, engineering at the intersections of hardware, software and design — big-agency experiences at your friendly neighbour's price.",
    "Codustry makes machines, businesses, and the people who run them smarter.",
  ],
  pillarsKicker: "What we do",
  pillarsTitle: "Most factories don't need new machines. They need their machines to talk.",
  pillars: [
    {
      title: "Concrete technology ecosystem",
      description:
        "REDBLU (เรดบลู) brings AI, robotics and smart-factory thinking to ready-mix concrete plants — an industry technology forgot for decades.",
      color: BRAND.cyan,
    },
    {
      title: "Automated cranes & remote control",
      description:
        "Vision systems and layered safety for the jobs that are dangerous, repetitive, and hard to hire for.",
      color: BRAND.pink,
    },
    {
      title: "Factory monitoring & control",
      description:
        "Sensors, digital weighing, silo level measurement and real-time dashboards — visibility your existing plant never had.",
      color: BRAND.amber,
    },
    {
      title: "Enterprise software & ERP",
      description:
        "ERP for Thai manufacturers that runs real production — inventory, pricing, catalogues — built on the software-house foundation we started with.",
      color: BRAND.indigo,
    },
    {
      title: "Computer vision & AI safety",
      description:
        "Object detection and monitoring for site safety — cameras that watch the dangerous zones so people don't have to.",
      color: BRAND.mint,
    },
    {
      title: "Web, commerce & chat platforms",
      description:
        "Websites, ecommerce, POS and marketplace/chat integrations — Shopee, Lazada, TikTok Shop, LINE — under one roof.",
      color: BRAND.pink,
    },
  ],
  worksKicker: "Our work",
  worksTitle: "Brands we build and run.",
  works: [
    {
      key: "redblu",
      story: "The industry technology forgot",
      name: "REDBLU (เรดบลู)",
      tagline: "Ecosystem for the concrete industry",
      description:
        "A connected ecosystem for ready-mix concrete plants — SiloScale streams silo weight, temperature and pressure to the cloud in real time, while plant monitoring and control tie the yard together. Born inside a ready-mix family business, built for the whole industry.",
      tags: ["Industrial IoT", "Smart Factory", "SvelteKit", "Cloud"],
      href: "https://redblu.io",
      color: BRAND.cyan,
      image: "/images/works/redblu.webp",
    },
    {
      key: "autoscale",
      story: "Every weighbridge, not just concrete",
      name: "REDBLU AutoScale",
      tagline: "Automated truck weighing for any factory",
      description:
        "Cameras and OCR read plates and weigh tickets automatically, syncing straight into existing ERP — no more manual logbooks at the gate. Born in the concrete yard as part of the REDBLU ecosystem, it works at any plant with a truck scale or weighbridge: agri, steel, waste, quarry, logistics.",
      tags: ["AI · OCR", "Computer Vision", "Weighbridge", "ERP sync"],
      href: "https://redblu.io",
      color: BRAND.mint,
      image: "/images/works/autoscale.webp",
    },
    {
      key: "tonbab",
      story: "Made to run a real factory",
      name: "Tonbab (ต้นแบบ) ERP",
      tagline: "ERP for Thai manufacturers",
      description:
        "Multi-tenant ERP that runs real production — inventory, pricing, catalogues and storefront sync — for brands like 183 Degree.",
      tags: ["ERP", "Supabase", "Multi-tenant"],
      color: BRAND.indigo,
      image: "/images/works/tonbab.webp",
    },
    {
      key: "183degree",
      story: "Teaching machines to see",
      name: "183 Degree",
      tagline: "Technology distribution & OEM",
      description:
        "Official distribution of world-class technology in Thailand — including Stereolabs 3D cameras — plus our own 183-INS and EdgeBox hardware lines, with commerce run on our own stack.",
      tags: ["Distribution", "OEM hardware", "Ecommerce"],
      href: "https://183degree.com",
      color: BRAND.amber,
      image: "/images/works/183degree.webp",
    },
    {
      key: "bactrack",
      story: "Safety you can measure",
      name: "BACtrack Thailand",
      tagline: "Official distributor",
      description:
        "Bringing the world's best-selling breathalyzers to Thailand — retail, corporate and safety-compliance markets.",
      tags: ["Distribution", "Safety"],
      href: "https://www.bactrack.in.th",
      color: BRAND.pink,
      image: "/images/works/bactrack.webp",
    },
    {
      key: "khaopad",
      story: "The platform we gave away",
      name: "Khao Pad",
      tagline: "Open-source website platform",
      description:
        "Our MIT-licensed website platform for Cloudflare — CMS, SEO, analytics and forms on Workers, D1, R2 and KV. This site runs on it.",
      tags: ["Open source", "Cloudflare", "SvelteKit"],
      href: "https://github.com/codustry/khaopad",
      color: BRAND.mint,
      image: "/images/works/khaopad.webp",
    },
  ],
  stats: [
    { value: 10, suffix: "+", label: "years of engineering" },
    { value: 3.5, prefix: "฿", suffix: "M", label: "TED Fund grants across two rounds — PoC & Market Scale-Up" },
    { value: 2024, suffix: "", label: "Thailand ICT Award (TICTA)" },
    { value: 1, suffix: "", label: "team, hardware to cloud" },
  ],
  clientsTitle: "Clients & partners",
  clients: [
    { name: "AIS", logo: "/images/brands/ais.png", logoClass: "h-9 md:h-10" },
    { name: "SCG", logo: "/images/brands/scg.svg", logoClass: "h-8 md:h-9" },
    { name: "CPAC", logo: "/images/brands/cpac.svg", logoClass: "h-9 md:h-10" },
    { name: "GISTDA", logo: "/images/brands/gistda.svg", logoClass: "h-12 md:h-14" },
    { name: "DMCR", logo: "/images/brands/dmcr.png", logoClass: "h-11 md:h-12", withName: true },
    { name: "MQDC", logo: "/images/brands/mqdc.webp", logoClass: "h-9 md:h-10" },
    { name: "KMUTT", logo: "/images/brands/kmutt.png", logoClass: "h-12 md:h-14" },
    { name: "Kinetic Engineering", logo: "/images/brands/kinetic.svg", logoClass: "h-6 md:h-7" },
    { name: "Dr.Vakuum", logo: "/images/brands/drvakuum.png", logoClass: "h-8 md:h-9" },
    { name: "Skyviv", logo: "/images/brands/skyviv.svg", logoClass: "h-7 md:h-8" },
    { name: "LE HORM", logo: "/images/brands/lehorm.png", logoClass: "h-9 md:h-10" },
    { name: "Kirirhom Khao Kho", logo: "/images/brands/kirirhom.png", logoClass: "h-12 md:h-14", darken: true },
    { name: "Pakjai Clinic", logo: "/images/brands/pakjai.png", logoClass: "h-9 md:h-10", withName: true },
  ],
  distributionTitle: "Brands we distribute",
  distributionSub: "World-class technology, sold and supported by us in Thailand — each through its own channel.",
  distribution: [
    {
      name: "183 Degree",
      logo: "/images/brands/183degree.svg",
      logoClass: "h-9 w-auto md:h-10",
      note: "Our own ecommerce store — industrial electronics and the technology we distribute, built and run on our own stack.",
      channelLabel: "Shop at 183degree.com",
      channelHref: "https://www.183degree.com",
      color: BRAND.amber,
    },
    {
      name: "BACtrack",
      logo: "/images/brands/bactrack.png",
      logoClass: "h-8 w-auto md:h-9",
      note: "The world's best-selling breathalyzers.",
      channelLabel: "Shop at bactrack.in.th",
      channelHref: "https://www.bactrack.in.th",
      color: BRAND.pink,
    },
    {
      name: "Stereolabs",
      logo: "/images/brands/stereolabs.svg",
      logoClass: "h-6 w-auto md:h-7",
      note: "AI stereo-vision and 3D perception cameras.",
      channelLabel: "Shop at 183degree.com",
      channelHref: "https://www.183degree.com",
      color: BRAND.cyan,
    },
    {
      name: "Bigin by Zoho CRM",
      logo: "/images/brands/bigin.png",
      logoClass: "h-11 w-auto md:h-12",
      note: "CRM built for small businesses.",
      channelLabel: "Sold through our own channel — talk to us",
      channelHref: "#contact",
      color: BRAND.indigo,
    },
  ],
  contact: {
    kicker: "Contact",
    headline: "Let's build something real.",
    sub: "Tell us about your plant, your process, or your product — we'll tell you what's possible.",
    cta: "hello@codustry.com",
    email: "hello@codustry.com",
    phone: "+66 2 873 4448",
    phoneHref: "tel:+6628734448",
    address: "75 Moo 3, Bangkru, Phra Pradaeng, Samut Prakan 10130, Thailand",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Codustry%2075%20Moo%203%20Bangkru%20Phra%20Pradaeng%20Samut%20Prakan%2010130",
  },
};

const th: HomeContent = {
  hero: {
    kicker: "วิศวกรรมเพื่อโลกจริง",
    headline: ["โคดัสทรี คือทีมเล็ก", "ที่สร้างเทคโนโลยี", "ระดับใหญ่"],
    sub: "จากพื้นโรงงานถึงหน้าร้านออนไลน์ — ทีมเล็ก ๆ ที่ขยายพลังด้วยเครื่องมือ AI ออกแบบ สร้าง และดูแลเทคโนโลยีแบบครบวงจร ด้วยประสบการณ์วิศวกรรมกว่า 10 ปี",
    cta: "คุยกับเรา",
    ctaWorks: "ดูผลงาน",
  },
  marquee: [
    "AI",
    "Robotics",
    "Industrial IoT",
    "Smart Factory",
    "Computer Vision",
    "ERP",
    "Cloud Platforms",
    "Automation",
  ],
  manifesto: [
    "ผู้คนคาดหวังจากเทคโนโลยีมากกว่าที่เคย — และไม่ควรต้องใช้งบระดับเอเจนซีเพื่อให้ได้มัน",
    "เราคือทีมเล็ก ๆ ที่ขยายพลังด้วยเครื่องมือ AI สร้างงานตรงจุดตัดของฮาร์ดแวร์ ซอฟต์แวร์ และดีไซน์ — ประสบการณ์ระดับเอเจนซีใหญ่ ในราคาแบบเพื่อนบ้านที่เป็นมิตร",
    "โคดัสทรีทำให้เครื่องจักร ธุรกิจ และผู้คนที่ขับเคลื่อนมัน ฉลาดขึ้น",
  ],
  pillarsKicker: "สิ่งที่เราทำ",
  pillarsTitle: "โรงงานส่วนใหญ่ไม่ต้องซื้อเครื่องจักรใหม่ แค่ต้องทำให้ของเดิมสื่อสารกันได้",
  pillars: [
    {
      title: "Ecosystem เทคโนโลยีคอนกรีต",
      description:
        "REDBLU (เรดบลู) นำ AI, Robotics และแนวคิด Smart Factory เข้าสู่โรงงานคอนกรีตผสมเสร็จ — อุตสาหกรรมที่เทคโนโลยีไม่ได้พัฒนามานานนับทศวรรษ",
      color: BRAND.cyan,
    },
    {
      title: "เครนอัตโนมัติและควบคุมระยะไกล",
      description:
        "ระบบวิชันและระบบความปลอดภัยหลายชั้น สำหรับงานที่เสี่ยง ซ้ำซาก และหาคนทำยาก",
      color: BRAND.pink,
    },
    {
      title: "ระบบมอนิเตอร์และควบคุมในโรงงาน",
      description:
        "เซ็นเซอร์ ระบบชั่งน้ำหนักดิจิทัล ระบบวัดระดับไซโล และแดชบอร์ดเรียลไทม์ — มองเห็นข้อมูลที่โรงงานเดิมไม่เคยเห็น",
      color: BRAND.amber,
    },
    {
      title: "ซอฟต์แวร์องค์กรและ ERP",
      description:
        "ERP สำหรับผู้ผลิตไทยที่ใช้งานจริงในสายการผลิต — สต๊อก ราคา แคตตาล็อก — ต่อยอดจากรากฐาน Software House ที่เราเริ่มมา",
      color: BRAND.indigo,
    },
    {
      title: "Computer Vision และ AI ความปลอดภัย",
      description:
        "ระบบตรวจจับวัตถุและมอนิเตอร์ความปลอดภัยหน้างาน — ให้กล้องเฝ้าจุดเสี่ยงแทนคน",
      color: BRAND.mint,
    },
    {
      title: "เว็บ คอมเมิร์ซ และแชตแพลตฟอร์ม",
      description:
        "เว็บไซต์ อีคอมเมิร์ซ POS และการเชื่อมต่อมาร์เก็ตเพลส/แชต — Shopee, Lazada, TikTok Shop, LINE — ครบในที่เดียว",
      color: BRAND.pink,
    },
  ],
  worksKicker: "ผลงานของเรา",
  worksTitle: "แบรนด์ที่เราสร้างและดูแล",
  works: [
    {
      key: "redblu",
      story: "อุตสาหกรรมที่เทคโนโลยีลืม",
      name: "REDBLU (เรดบลู)",
      tagline: "Ecosystem สำหรับอุตสาหกรรมคอนกรีต",
      description:
        "Ecosystem ที่เชื่อมโรงงานคอนกรีตผสมเสร็จเข้าด้วยกัน — SiloScale ส่งข้อมูลน้ำหนัก อุณหภูมิ และแรงดันของไซโลขึ้นคลาวด์แบบเรียลไทม์ พร้อมระบบมอนิเตอร์และควบคุมที่ร้อยทั้งลานเข้าด้วยกัน เกิดในธุรกิจครอบครัวคอนกรีตผสมเสร็จ สร้างเพื่อทั้งอุตสาหกรรม",
      tags: ["Industrial IoT", "Smart Factory", "SvelteKit", "Cloud"],
      href: "https://redblu.io",
      color: BRAND.cyan,
      image: "/images/works/redblu.webp",
    },
    {
      key: "autoscale",
      story: "ทุกเครื่องชั่ง ไม่ใช่แค่คอนกรีต",
      name: "REDBLU AutoScale",
      tagline: "ระบบชั่งน้ำหนักรถบรรทุกอัตโนมัติ สำหรับทุกโรงงาน",
      description:
        "กล้องและ OCR อ่านทะเบียนและบัตรชั่งอัตโนมัติ ซิงก์เข้า ERP เดิมได้ทันที — ไม่ต้องจดสมุดที่หน้าโรงงานอีกต่อไป เกิดในลานคอนกรีตในฐานะส่วนหนึ่งของ ecosystem REDBLU และใช้ได้กับทุกโรงงานที่มีเครื่องชั่งรถบรรทุก ทั้งเกษตร เหล็ก ของเสีย เหมือง และโลจิสติกส์",
      tags: ["AI · OCR", "Computer Vision", "เครื่องชั่งรถบรรทุก", "เชื่อม ERP"],
      href: "https://redblu.io",
      color: BRAND.mint,
      image: "/images/works/autoscale.webp",
    },
    {
      key: "tonbab",
      story: "สร้างมาเพื่อโรงงานจริง",
      name: "Tonbab (ต้นแบบ) ERP",
      tagline: "ERP สำหรับผู้ผลิตไทย",
      description:
        "ERP แบบ multi-tenant ที่ใช้งานจริงในสายการผลิต — สต๊อก ราคา แคตตาล็อก และซิงก์หน้าร้านออนไลน์ ให้แบรนด์อย่าง 183 Degree",
      tags: ["ERP", "Supabase", "Multi-tenant"],
      color: BRAND.indigo,
      image: "/images/works/tonbab.webp",
    },
    {
      key: "183degree",
      story: "สอนเครื่องจักรให้มองเห็น",
      name: "183 Degree",
      tagline: "ตัวแทนจำหน่ายเทคโนโลยีและ OEM",
      description:
        "ตัวแทนจำหน่ายเทคโนโลยีระดับโลกในประเทศไทย รวมถึงกล้อง 3 มิติ Stereolabs พร้อมสายผลิตภัณฑ์ของเราเอง 183-INS และ EdgeBox บนระบบคอมเมิร์ซที่เราสร้างเอง",
      tags: ["Distribution", "OEM hardware", "Ecommerce"],
      href: "https://183degree.com",
      color: BRAND.amber,
      image: "/images/works/183degree.webp",
    },
    {
      key: "bactrack",
      story: "ความปลอดภัยที่วัดได้",
      name: "BACtrack Thailand",
      tagline: "ตัวแทนจำหน่ายอย่างเป็นทางการ",
      description:
        "นำเครื่องวัดแอลกอฮอล์ที่ขายดีที่สุดในโลกสู่ประเทศไทย — ทั้งตลาดค้าปลีก องค์กร และงานความปลอดภัย",
      tags: ["Distribution", "Safety"],
      href: "https://www.bactrack.in.th",
      color: BRAND.pink,
      image: "/images/works/bactrack.webp",
    },
    {
      key: "khaopad",
      story: "แพลตฟอร์มที่เราแจกให้โลก",
      name: "Khao Pad",
      tagline: "แพลตฟอร์มเว็บไซต์โอเพนซอร์ส",
      description:
        "แพลตฟอร์มเว็บไซต์สัญญาอนุญาต MIT สำหรับ Cloudflare — CMS, SEO, analytics และฟอร์ม บน Workers, D1, R2 และ KV เว็บไซต์นี้ก็รันด้วยมัน",
      tags: ["Open source", "Cloudflare", "SvelteKit"],
      href: "https://github.com/codustry/khaopad",
      color: BRAND.mint,
      image: "/images/works/khaopad.webp",
    },
  ],
  stats: [
    { value: 10, suffix: "+", label: "ปีของงานวิศวกรรม" },
    { value: 3.5, prefix: "฿", suffix: "M", label: "ทุน TED Fund รวมสองรอบ — PoC และ Market Scale-Up" },
    { value: 2024, suffix: "", label: "รางวัล Thailand ICT Award (TICTA)" },
    { value: 1, suffix: "", label: "ทีมเดียว ตั้งแต่ฮาร์ดแวร์ถึงคลาวด์" },
  ],
  clientsTitle: "ลูกค้าและพาร์ตเนอร์",
  clients: [
    { name: "AIS", logo: "/images/brands/ais.png", logoClass: "h-9 md:h-10" },
    { name: "SCG", logo: "/images/brands/scg.svg", logoClass: "h-8 md:h-9" },
    { name: "CPAC", logo: "/images/brands/cpac.svg", logoClass: "h-9 md:h-10" },
    { name: "GISTDA", logo: "/images/brands/gistda.svg", logoClass: "h-12 md:h-14" },
    { name: "DMCR", logo: "/images/brands/dmcr.png", logoClass: "h-11 md:h-12", withName: true },
    { name: "MQDC", logo: "/images/brands/mqdc.webp", logoClass: "h-9 md:h-10" },
    { name: "KMUTT", logo: "/images/brands/kmutt.png", logoClass: "h-12 md:h-14" },
    { name: "Kinetic Engineering", logo: "/images/brands/kinetic.svg", logoClass: "h-6 md:h-7" },
    { name: "Dr.Vakuum", logo: "/images/brands/drvakuum.png", logoClass: "h-8 md:h-9" },
    { name: "Skyviv", logo: "/images/brands/skyviv.svg", logoClass: "h-7 md:h-8" },
    { name: "LE HORM", logo: "/images/brands/lehorm.png", logoClass: "h-9 md:h-10" },
    { name: "คีรีรมย์ เขาค้อ", logo: "/images/brands/kirirhom.png", logoClass: "h-12 md:h-14", darken: true },
    { name: "พักใจคลินิก", logo: "/images/brands/pakjai.png", logoClass: "h-9 md:h-10", withName: true },
  ],
  distributionTitle: "แบรนด์ที่เราเป็นตัวแทนจำหน่าย",
  distributionSub: "เทคโนโลยีระดับโลก จำหน่ายและซัพพอร์ตโดยเราในประเทศไทย — แต่ละแบรนด์ผ่านช่องทางของตัวเอง",
  distribution: [
    {
      name: "183 Degree",
      logo: "/images/brands/183degree.svg",
      logoClass: "h-9 w-auto md:h-10",
      note: "ร้านค้าออนไลน์ของเราเอง — อิเล็กทรอนิกส์อุตสาหกรรมและเทคโนโลยีที่เราจัดจำหน่าย สร้างและดูแลด้วยระบบของเราเอง",
      channelLabel: "ช้อปได้ที่ 183degree.com",
      channelHref: "https://www.183degree.com",
      color: BRAND.amber,
    },
    {
      name: "BACtrack",
      logo: "/images/brands/bactrack.png",
      logoClass: "h-8 w-auto md:h-9",
      note: "เครื่องวัดแอลกอฮอล์ขายดีที่สุดในโลก",
      channelLabel: "ช้อปได้ที่ bactrack.in.th",
      channelHref: "https://www.bactrack.in.th",
      color: BRAND.pink,
    },
    {
      name: "Stereolabs",
      logo: "/images/brands/stereolabs.svg",
      logoClass: "h-6 w-auto md:h-7",
      note: "กล้อง Stereo Vision และ 3D Perception ระดับ AI",
      channelLabel: "ช้อปได้ที่ 183degree.com",
      channelHref: "https://www.183degree.com",
      color: BRAND.cyan,
    },
    {
      name: "Bigin by Zoho CRM",
      logo: "/images/brands/bigin.png",
      logoClass: "h-11 w-auto md:h-12",
      note: "CRM สำหรับธุรกิจขนาดเล็ก",
      channelLabel: "จำหน่ายผ่านช่องทางของเราเอง — คุยกับเรา",
      channelHref: "#contact",
      color: BRAND.indigo,
    },
  ],
  contact: {
    kicker: "ติดต่อ",
    headline: "มาสร้างของจริงด้วยกัน",
    sub: "เล่าให้เราฟังเรื่องโรงงาน กระบวนการ หรือผลิตภัณฑ์ของคุณ — เราจะบอกว่าอะไรเป็นไปได้",
    cta: "hello@codustry.com",
    email: "hello@codustry.com",
    phone: "+66 2 873 4448",
    phoneHref: "tel:+6628734448",
    address: "75 หมู่ 3 ต.บางครุ อ.พระประแดง จ.สมุทรปราการ 10130",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Codustry%2075%20Moo%203%20Bangkru%20Phra%20Pradaeng%20Samut%20Prakan%2010130",
  },
};

const CONTENT: Record<Locale, HomeContent> = { en, th };

export function homeContent(locale: Locale): HomeContent {
  return CONTENT[locale] ?? en;
}

// ─────────────────────────────────────────────────────────────
// About page — the founder's story, told Ogilvy-About style.
// ─────────────────────────────────────────────────────────────

export interface AboutChapter {
  kicker: string;
  paragraphs: string[];
}

export interface AboutContent {
  /** The giant opening statement — the company's central lesson. */
  statement: string;
  chapters: AboutChapter[];
  closing: { headline: string; cta: string; href: string };
}

const aboutEn: AboutContent = {
  statement: "Ambitious engineering only counts once it meets the field.",
  chapters: [
    {
      kicker: "Singapore",
      paragraphs: [
        "Codustry began in Singapore before COVID — a small team of computer science and computer engineering graduates building bespoke systems where software and hardware had to work as one.",
      ],
    },
    {
      kicker: "The lesson",
      paragraphs: [
        "That combination came from experience. Thunpisit Amnuaikiatloet's graduate research on mHealth at the University of Missouri–Columbia meant building instruments that had to survive a real clinic. Before that, he led SpaceBox Laboratory's STEP-1, one of Thailand's earliest CubeSats.",
        "It never flew — but it taught the lesson that still shapes us: ambitious engineering only counts once it meets the field.",
      ],
    },
    {
      kicker: "The rebuild",
      paragraphs: [
        "When COVID came, we rebuilt where the work actually was: Codustry (Thailand) Co., Ltd.",
        "Bespoke projects kept us busy, but each solved one problem once. We wanted to build something that compounded — for the parts of Thai industry technology had passed over.",
      ],
    },
    {
      kicker: "The compounding bet",
      paragraphs: [
        "The first answer was concrete. REDBLU (เรดบลู) began inside a family ready-mix plant and grew into a technology ecosystem for an industry that hadn't seen real innovation in decades. Tonbab (ต้นแบบ) ERP followed — ERP that runs actual production. Then 183 Degree, BACtrack Thailand, and Khao Pad — the platform this site runs on, given away as open source.",
        "Today we are still a small team — now amplified by AI-driven tools — with two TED Fund grants, a Thailand ICT Award, and machines in the field to show for it.",
      ],
    },
  ],
  closing: {
    headline: "The field is waiting. Let's build something real.",
    cta: "Talk with us",
    href: "/#contact",
  },
};

const aboutTh: AboutContent = {
  statement: "วิศวกรรมที่ทะเยอทะยาน จะมีความหมายก็ต่อเมื่อได้ลงสนามจริง",
  chapters: [
    {
      kicker: "สิงคโปร์",
      paragraphs: [
        "โคดัสทรีเริ่มต้นที่สิงคโปร์ก่อนยุคโควิด — ทีมเล็ก ๆ ของบัณฑิตวิทยาการคอมพิวเตอร์และวิศวกรรมคอมพิวเตอร์ ที่สร้างระบบเฉพาะทางซึ่งซอฟต์แวร์และฮาร์ดแวร์ต้องทำงานเป็นหนึ่งเดียว",
      ],
    },
    {
      kicker: "บทเรียน",
      paragraphs: [
        "ส่วนผสมนั้นมาจากประสบการณ์จริง งานวิจัยระดับบัณฑิตศึกษาด้าน mHealth ของ Thunpisit Amnuaikiatloet ที่ University of Missouri–Columbia คือการสร้างเครื่องมือที่ต้องอยู่รอดในคลินิกจริง และก่อนหน้านั้นเขาเป็นหัวหน้าโครงการ STEP-1 ของ SpaceBox Laboratory หนึ่งใน CubeSat ยุคแรกของประเทศไทย",
        "ดาวเทียมดวงนั้นไม่เคยได้ขึ้นบิน — แต่มันสอนบทเรียนที่ยังหล่อหลอมเราถึงทุกวันนี้: วิศวกรรมที่ทะเยอทะยานจะมีความหมายก็ต่อเมื่อได้ลงสนามจริง",
      ],
    },
    {
      kicker: "เริ่มใหม่",
      paragraphs: [
        "เมื่อโควิดมาถึง เราย้ายมาสร้างใหม่ในที่ที่งานจริงอยู่: บริษัท โคดัสทรี (ประเทศไทย) จำกัด",
        "งานสั่งทำทำให้เรามีงานตลอด แต่แต่ละงานแก้ปัญหาเดียวได้เพียงครั้งเดียว เราอยากสร้างสิ่งที่ทบต้นได้ — เพื่อส่วนของอุตสาหกรรมไทยที่เทคโนโลยีเดินผ่านไป",
      ],
    },
    {
      kicker: "เดิมพันที่ทบต้น",
      paragraphs: [
        "คำตอบแรกคือคอนกรีต REDBLU (เรดบลู) เริ่มต้นในโรงงานคอนกรีตผสมเสร็จของครอบครัว แล้วเติบโตเป็น ecosystem เทคโนโลยีสำหรับอุตสาหกรรมที่ไม่ได้เห็นนวัตกรรมจริงมานานหลายทศวรรษ ตามด้วย Tonbab (ต้นแบบ) ERP — ERP ที่รันสายการผลิตจริง แล้วก็ 183 Degree, BACtrack Thailand และ Khao Pad — แพลตฟอร์มที่เว็บไซต์นี้รันอยู่ ซึ่งเราแจกเป็นโอเพนซอร์ส",
        "วันนี้เรายังเป็นทีมเล็ก ๆ — ที่ขยายพลังด้วยเครื่องมือ AI — พร้อมทุน TED Fund สองรอบ รางวัล Thailand ICT Award และเครื่องจักรที่ทำงานอยู่ในสนามจริงเป็นเครื่องพิสูจน์",
      ],
    },
  ],
  closing: {
    headline: "สนามจริงรออยู่ มาสร้างของจริงด้วยกัน",
    cta: "คุยกับเรา",
    href: "/#contact",
  },
};

const ABOUT: Record<Locale, AboutContent> = { en: aboutEn, th: aboutTh };

export function aboutContent(locale: Locale): AboutContent {
  return ABOUT[locale] ?? aboutEn;
}
