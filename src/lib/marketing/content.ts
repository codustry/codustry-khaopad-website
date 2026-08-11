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
  clients: string[];
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
    address: string;
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
    kicker: "Codustry (Thailand) Co., Ltd.",
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
        "REDBLU brings AI, robotics and smart-factory thinking to ready-mix concrete plants — an industry technology forgot for decades.",
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
      name: "REDBLU",
      tagline: "Concrete technology ecosystem",
      description:
        "SiloScale streams silo weight, temperature and pressure to the cloud in real time. AutoScale automates truck weighing with cameras and OCR, synced to legacy ERP. Born inside a ready-mix family business, built for the whole industry.",
      tags: ["Industrial IoT", "AI · OCR", "SvelteKit", "Cloud"],
      href: "https://redblu.io",
      color: BRAND.cyan,
      image: "/images/works/redblu.webp",
    },
    {
      key: "tonbab",
      story: "Made to run a real factory",
      name: "Tonbab",
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
      key: "nanapos",
      story: "Cashless, the Thai way",
      name: "Nana POS",
      tagline: "Thailand-first point of sale",
      description:
        "POS for Thai SMBs with Thai QR payments and Beam Checkout — lower fees, faster transactions, built for Sunmi terminals and iPads.",
      tags: ["POS", "Payments", "SMB"],
      color: BRAND.pink,
      image: "/images/works/nanapos.webp",
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
    { value: 2, suffix: "×", label: "TED Fund grants — PoC & Market Scale-Up" },
    { value: 2024, suffix: "", label: "Thailand ICT Award (TICTA)" },
    { value: 1, suffix: "", label: "team, hardware to cloud" },
  ],
  clientsTitle: "Clients & partners",
  clients: [
    "AIS",
    "GISTDA",
    "MQDC",
    "KMUTT",
    "Kinetic Engineering",
    "Dr.Vakuum",
    "Kirirhom Khao Kho",
    "Pakjai Clinic",
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
    address: "75 Moo 3, Bangkru, Phra Pradaeng, Samut Prakan 10130, Thailand",
  },
};

const th: HomeContent = {
  hero: {
    kicker: "บริษัท โคดัสทรี (ประเทศไทย) จำกัด",
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
        "REDBLU นำ AI, Robotics และแนวคิด Smart Factory เข้าสู่โรงงานคอนกรีตผสมเสร็จ — อุตสาหกรรมที่เทคโนโลยีไม่ได้พัฒนามานานนับทศวรรษ",
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
      name: "REDBLU",
      tagline: "Ecosystem เทคโนโลยีคอนกรีต",
      description:
        "SiloScale ส่งข้อมูลน้ำหนัก อุณหภูมิ และแรงดันของไซโลขึ้นคลาวด์แบบเรียลไทม์ AutoScale ชั่งน้ำหนักรถบรรทุกอัตโนมัติด้วยกล้องและ OCR เชื่อมกับ ERP เดิม — เกิดในธุรกิจครอบครัวคอนกรีตผสมเสร็จ สร้างเพื่อทั้งอุตสาหกรรม",
      tags: ["Industrial IoT", "AI · OCR", "SvelteKit", "Cloud"],
      href: "https://redblu.io",
      color: BRAND.cyan,
      image: "/images/works/redblu.webp",
    },
    {
      key: "tonbab",
      story: "สร้างมาเพื่อโรงงานจริง",
      name: "Tonbab",
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
      key: "nanapos",
      story: "แคชเลสแบบไทย",
      name: "Nana POS",
      tagline: "POS สัญชาติไทยเพื่อ SMB",
      description:
        "ระบบขายหน้าร้านสำหรับ SMB ไทย รองรับ Thai QR Payment และ Beam Checkout — ค่าธรรมเนียมต่ำกว่า เร็วกว่า บน Sunmi และ iPad",
      tags: ["POS", "Payments", "SMB"],
      color: BRAND.pink,
      image: "/images/works/nanapos.webp",
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
    { value: 2, suffix: "×", label: "ทุน TED Fund — PoC และ Market Scale-Up" },
    { value: 2024, suffix: "", label: "รางวัล Thailand ICT Award (TICTA)" },
    { value: 1, suffix: "", label: "ทีมเดียว ตั้งแต่ฮาร์ดแวร์ถึงคลาวด์" },
  ],
  clientsTitle: "ลูกค้าและพาร์ตเนอร์",
  clients: [
    "AIS",
    "GISTDA",
    "MQDC",
    "KMUTT",
    "Kinetic Engineering",
    "Dr.Vakuum",
    "คีรีรมย์ เขาค้อ",
    "ภักดิ์ใจคลินิก",
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
    address: "75 หมู่ 3 ต.บางครุ อ.พระประแดง จ.สมุทรปราการ 10130",
  },
};

const CONTENT: Record<Locale, HomeContent> = { en, th };

export function homeContent(locale: Locale): HomeContent {
  return CONTENT[locale] ?? en;
}
