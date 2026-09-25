/* eslint-disable @typescript-eslint/no-explicit-any */
// Static blog posts shown until the Sanity project is provisioned — same
// pattern as the catalog's static dataset in lib/catalog-data.ts. Once
// NEXT_PUBLIC_SANITY_PROJECT_ID is set these are ignored entirely; editors
// then own the blog from /studio.

import type { PostDetail, PostListItem } from "@/sanity/queries";

let k = 0;
const key = () => `fb${(k++).toString(36)}`;

type BlockStyle = "normal" | "h2" | "h3" | "blockquote";

function block(text: string, style: BlockStyle = "normal") {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

type FallbackPost = PostDetail & { language: string };

const AUTHOR = { name: "MİNADA Ekibi" };
const AUTHOR_EN = { name: "MİNADA Team" };

const POSTS: FallbackPost[] = [
  // --- TR -----------------------------------------------------------------
  {
    _id: "fb-tr-catida-ges",
    language: "tr",
    title: "Çatı GES yatırımı 2026'da ne kadar tutar, kaç yılda geri döner?",
    slug: "catida-ges-maliyeti-2026",
    excerpt:
      "Konut ve işletme çatıları için güncel kurulum maliyetleri, sistemi etkileyen kalemler ve gerçekçi bir geri ödeme hesabı.",
    coverImage: "/images/v2/calc-2.jpg",
    publishedAt: "2026-06-28",
    category: { title: "Rehber" },
    author: AUTHOR,
    body: [
      block(
        "Çatı tipi güneş enerjisi santrali (GES) yatırımında en sık duyduğumuz soru aynı: “Kaç paraya mal olur, kaç yılda kendini amorti eder?” Cevap çatınıza, tüketiminize ve seçilen ekipmana göre değişir; ama hesap şeffaf bir şekilde yapılabilir.",
      ),
      block("Maliyeti belirleyen üç ana kalem", "h2"),
      block(
        "Toplam bedelin yaklaşık yarısını paneller ve inverter oluşturur. Kalanı konstrüksiyon, DC/AC kablolama, pano-şalt ekipmanı ve işçiliktir. Çatının tipi (kiremit, sandviç panel, teras) konstrüksiyon maliyetini; şebeke bağlantı noktasına uzaklık ise kablolama maliyetini doğrudan etkiler.",
      ),
      block(
        "Aynı güçteki iki sistem arasında ciddi fiyat farkı görüyorsanız, farkın nereden geldiğini sorun: panel sınıfı, inverter markası, konstrüksiyonun statik hesabı ve işçilik garantisi çoğu zaman cevabın kendisidir.",
        "blockquote",
      ),
      block("Geri ödeme süresi nasıl hesaplanır?", "h2"),
      block(
        "Yıllık üretiminizi (kWh) mevcut elektrik tarifenizle çarptığınızda yıllık tasarrufunuzu bulursunuz. Kurulum bedelini bu tasarrufa böldüğünüzde kaba geri ödeme süresi çıkar. Türkiye'de iyi projelendirilmiş bir çatı GES bugün tipik olarak 4-6 yıl aralığında kendini geri öder; sistem ömrü ise 25 yılın üzerindedir.",
      ),
      block(
        "Kesin rakam için çatınızın PVsyst simülasyonuna ve son 12 aylık faturanıza bakmak gerekir. Keşif ve etüt aşamasında bu hesabı sizin için kalem kalem çıkarıyoruz.",
      ),
    ],
  },
  {
    _id: "fb-tr-mahsuplasma",
    language: "tr",
    title: "Aylık mahsuplaşma rehberi: Ürettiğiniz elektrik faturanızı nasıl düşürür?",
    slug: "aylik-mahsuplasma-rehberi",
    excerpt:
      "Lisanssız üretimde aylık mahsuplaşmanın işleyişi, çağrı mektubundan sisteme geçişe kadar adım adım süreç.",
    coverImage: "/images/v2/how/licensing.jpg",
    publishedAt: "2026-06-14",
    category: { title: "Mevzuat" },
    author: AUTHOR,
    body: [
      block(
        "Çatınızda ürettiğiniz elektriğin tüketiminizden fazlası şebekeye verilir; eksik kaldığınız saatlerde ise şebekeden çekersiniz. Aylık mahsuplaşma, ay sonunda bu iki miktarın netleştirilmesidir: verdiğiniz enerji, çektiğinizden düşülür.",
      ),
      block("Süreç nasıl işler?", "h2"),
      block(
        "Başvuru dağıtım şirketine yapılır; uygun bulunursa çağrı mektubu düzenlenir. Proje onayı ve geçici kabulün ardından çift yönlü sayaç takılır ve mahsuplaşma başlar. Evrak trafiği gözünüzü korkutmasın — doğru hazırlanmış bir dosya ile süreç öngörülebilirdir ve biz baştan sona takip ediyoruz.",
      ),
      block("Fazla üretim ne olur?", "h2"),
      block(
        "Ay sonunda tüketiminizi aşan üretim, görevli tedarik şirketine mevzuatta belirlenen bedel üzerinden satılır. Bu yüzden sistemi tüketim profilinize göre boyutlandırmak kritik: ne atıl kapasite, ne de karşılanmayan tüketim kalmalı.",
      ),
      block(
        "Doğru boyutlandırılmış bir sistemde hedef, faturayı sıfıra yaklaştırmak değil; yatırımın toplam getirisini en yükseğe taşımaktır.",
        "blockquote",
      ),
    ],
  },
  {
    _id: "fb-tr-panel-secimi",
    language: "tr",
    title: "Panel seçerken etikete değil şu 5 kaleme bakın",
    slug: "panel-secimi-5-kriter",
    excerpt:
      "Watt değeri tek başına bir şey söylemez. Verimlilik, sıcaklık katsayısı, garanti yapısı ve degradasyon üzerinden pratik bir seçim rehberi.",
    coverImage: "/images/v2/how/procurement.jpg",
    publishedAt: "2026-05-30",
    category: { title: "Teknoloji" },
    author: AUTHOR,
    body: [
      block(
        "Panel kataloglarında en büyük puntoyla yazan şey watt değeridir; oysa iki 550 W panel sahada çok farklı performans gösterebilir. Satın alma kararını etkilemesi gereken kalemler etikette daha küçük yazar.",
      ),
      block("1. Verimlilik ve alan ilişkisi", "h3"),
      block(
        "Verimlilik, aynı çatı alanından ne kadar güç alacağınızı belirler. Alanı kısıtlı çatılarda yüzde 1'lik verim farkı, toplamda ciddi kurulu güç farkı yaratır.",
      ),
      block("2. Sıcaklık katsayısı", "h3"),
      block(
        "Paneller ısındıkça güç kaybeder. Sıcaklık katsayısı düşük (örn. -0,29 %/°C) bir panel, Türkiye yazında belirgin şekilde daha fazla üretir.",
      ),
      block("3. Garanti yapısı", "h3"),
      block(
        "Ürün garantisi ile performans garantisi ayrı şeylerdir. 12-15 yıl ürün, 25-30 yıl performans garantisi bugün iyi bir çizgidir; garantiyi verenin Türkiye'de muhatabı olup olmadığı da en az süre kadar önemlidir.",
      ),
      block("4. Yıllık degradasyon", "h3"),
      block(
        "İlk yıl ve sonraki yıllık güç kaybı oranları toplam üretimi 25 yıl boyunca etkiler. Düşük degradasyon, uzun vadede sessizce para kazandırır.",
      ),
      block("5. Bankabilite", "h3"),
      block(
        "Üreticinin finansal sağlamlığı, 25 yıllık garantinin gerçek değerini belirler. Tier-1 listeleri tek başına yeterli değil ama iyi bir başlangıç filtresidir. Tedarik aşamasında yalnızca bankabilitesi kanıtlanmış markalarla çalışıyoruz.",
      ),
    ],
  },
  {
    _id: "fb-tr-tesvikler",
    language: "tr",
    title: "İşletmeler için 2026 GES teşvik ve finansman haritası",
    slug: "isletmeler-icin-ges-tesvikleri-2026",
    excerpt:
      "KOSGEB ve kalkınma ajansı destekleri, yeşil dönüşüm kredileri ve vergisel avantajlar — hangi işletme neye başvurabilir?",
    coverImage: "/images/v2/area-ticari-saha.jpg",
    publishedAt: "2026-05-12",
    category: { title: "Teşvikler" },
    author: AUTHOR,
    body: [
      block(
        "Öz tüketime dönük GES yatırımları, enerji maliyetini sabitlemenin ötesinde bir dizi destek mekanizmasından yararlanabiliyor. Doğru kurgu, yatırımın geri ödeme süresini belirgin şekilde kısaltır.",
      ),
      block("Hibe ve destek programları", "h2"),
      block(
        "KOSGEB'in imalatçı KOBİ'lere yönelik yeşil dönüşüm destekleri ile bölgesel kalkınma ajanslarının dönemsel çağrıları, çatı GES yatırımlarında öne çıkan iki kanal. Çağrılar dönemseldir; başvuru dosyasının teknik eklerini (etüt, simülasyon, tek hat şeması) önceden hazır tutmak süreci hızlandırır.",
      ),
      block("Finansman tarafı", "h2"),
      block(
        "Kamu ve özel bankaların yenilenebilir enerji kredi paketleri, uzun vadeli ve öz kaynağı koruyan bir alternatif sunar. Leasing modeli ise ekipmanı bilanço dışında tutmak isteyen işletmelerde tercih ediliyor.",
      ),
      block(
        "Teşvik dosyası, projenin teknik dosyasıyla aynı titizlikte hazırlanmalı. Reddedilen başvuruların çoğu teknik ekler eksik olduğu için reddediliyor.",
        "blockquote",
      ),
      block(
        "Hangi programın işletmenize uyduğunu keşif aşamasında birlikte netleştiriyor, başvuru evraklarının teknik kısmını biz üstleniyoruz.",
      ),
    ],
  },
  {
    _id: "fb-tr-kis-uretim",
    language: "tr",
    title: "Güneş panelleri kışın çalışır mı? Verilerle mevsimsel üretim",
    slug: "gunes-panelleri-kisin-calisir-mi",
    excerpt:
      "Kar, bulut ve düşük güneş açısının üretime etkisi — ve iyi bir projelendirmenin kış aylarını neden dert etmediği.",
    coverImage: "/images/v2/how/install.jpg",
    publishedAt: "2026-04-21",
    category: { title: "Teknoloji" },
    author: AUTHOR,
    body: [
      block(
        "“Kışın panel çalışmaz” yaygın ama yanlış bir inanış. Paneller ışıkla çalışır, ısıyla değil; hatta soğuk havada verimleri artar. Kış üretimini düşüren şey sıcaklık değil, gün ışığı süresinin kısalması ve bulutluluktur.",
      ),
      block("Rakamlarla mevsimsel dağılım", "h2"),
      block(
        "Türkiye genelinde yıllık üretimin kabaca %60-65'i nisan-eylül arasında gerçekleşir. Aralık ve ocak en düşük aylardır; ancak yıllık hesap yapıldığında kış aylarının payı zaten simülasyona dahildir. PVsyst çıktısında gördüğünüz yıllık kWh, on iki ayın gerçekçi ortalamasıdır.",
      ),
      block("Kar örtüsü ne yapar?", "h2"),
      block(
        "Eğimli çatılarda kar çoğu zaman kendiliğinden kayar; panellerin koyu yüzeyi erimeyi hızlandırır. Yoğun kar bölgelerinde montaj açısı ve panel dizilimi buna göre projelendirilir — bu da keşif aşamasında statik hesapla birlikte netleşir.",
      ),
      block(
        "Kısacası: sistem doğru boyutlandırıldıysa kış ayları sürpriz değil, hesabın parçasıdır.",
      ),
    ],
  },
  {
    _id: "fb-tr-bakim",
    language: "tr",
    title: "GES bakımı ve uzaktan izleme: Üretim kaybını erken yakalamak",
    slug: "ges-bakim-ve-uzaktan-izleme",
    excerpt:
      "Panel temizliğinden inverter arıza bildirimlerine — santralinizin 25 yıl boyunca beklenen üretimde kalması için ne gerekir?",
    coverImage: "/images/v2/how/om.jpg",
    publishedAt: "2026-03-18",
    category: { title: "Bakım" },
    author: AUTHOR,
    body: [
      block(
        "GES kurulduktan sonra unutulmaya en müsait yatırımdır — ta ki üretim sessizce düşene kadar. Kirlenme, gölgelenme, gevşeyen bir DC konnektör veya arızalı bir optimizer, fark edilmediğinde aylarca kayıp yaratabilir.",
      ),
      block("İzleme neyi görünür kılar?", "h2"),
      block(
        "Modern inverterler string bazında üretim verisi yayınlar. İzleme platformuna düşen anlık veriler beklenen üretim eğrisiyle karşılaştırıldığında, sapma daha faturaya yansımadan alarm üretir. Aylık raporlarda ise performans oranı (PR) trendi takip edilir.",
      ),
      block("Periyodik bakımda neler var?", "h2"),
      block(
        "Yılda en az bir kez termal kamera kontrolü, konstrüksiyon ve topraklama ölçümleri, pano-şalt kontrolü ve bölgeye göre panel temizliği önerilir. Tozlu ve polenli bölgelerde temizlik sıklığı üretim verisine bakılarak ayarlanır.",
      ),
      block(
        "İşletme & bakım sözleşmelerimizde izleme, periyodik bakım ve arıza müdahalesi tek pakette toplanır; siz sadece raporu okursunuz.",
        "blockquote",
      ),
    ],
  },
  // --- EN -----------------------------------------------------------------
  {
    _id: "fb-en-rooftop-cost",
    language: "en",
    title: "What does rooftop solar cost in 2026 — and how fast does it pay back?",
    slug: "catida-ges-maliyeti-2026",
    excerpt:
      "Current installation costs for homes and businesses, the line items that move the price, and a realistic payback calculation.",
    coverImage: "/images/v2/calc-2.jpg",
    publishedAt: "2026-06-28",
    category: { title: "Guide" },
    author: AUTHOR_EN,
    body: [
      block(
        "The first question we hear about rooftop solar is always the same: “What does it cost, and when does it pay for itself?” The answer depends on your roof, your consumption and the equipment — but the math is transparent.",
      ),
      block("The three cost drivers", "h2"),
      block(
        "Panels and the inverter make up roughly half of the total. The rest is mounting structure, DC/AC cabling, switchgear and labour. Roof type drives structural cost; distance to the grid connection point drives cabling cost.",
      ),
      block("Calculating payback", "h2"),
      block(
        "Multiply your annual production (kWh) by your electricity tariff to get yearly savings, then divide the installation cost by that figure. A well-engineered rooftop system in Türkiye typically pays back in 4–6 years, against a service life beyond 25 years.",
      ),
      block(
        "For an exact number you need a PVsyst simulation of your roof and your last 12 months of bills — both of which we prepare during the survey phase.",
      ),
    ],
  },
  {
    _id: "fb-en-net-metering",
    language: "en",
    title: "Monthly net metering explained: how your production cuts your bill",
    slug: "aylik-mahsuplasma-rehberi",
    excerpt:
      "How monthly netting works for unlicensed generation in Türkiye, from the call letter to commissioning, step by step.",
    coverImage: "/images/v2/how/licensing.jpg",
    publishedAt: "2026-06-14",
    category: { title: "Regulation" },
    author: AUTHOR_EN,
    body: [
      block(
        "Surplus electricity from your roof flows to the grid; when production falls short, you draw from it. Monthly net metering settles the two at the end of each month — what you exported is deducted from what you imported.",
      ),
      block("How the process works", "h2"),
      block(
        "You apply to the distribution company; if approved, a call letter is issued. After project approval and provisional acceptance, a bidirectional meter is installed and netting begins. With a properly prepared file the process is predictable — and we manage it end to end.",
      ),
      block("What happens to excess production?", "h2"),
      block(
        "Production beyond your monthly consumption is sold to the incumbent supplier at the regulated rate. That's why sizing the system to your consumption profile matters: no idle capacity, no unmet demand.",
      ),
    ],
  },
  {
    _id: "fb-en-panel-selection",
    language: "en",
    title: "Choosing solar panels: look past the label at these 5 specs",
    slug: "panel-secimi-5-kriter",
    excerpt:
      "Wattage alone tells you little. A practical guide to efficiency, temperature coefficient, warranty structure and degradation.",
    coverImage: "/images/v2/how/procurement.jpg",
    publishedAt: "2026-05-30",
    category: { title: "Technology" },
    author: AUTHOR_EN,
    body: [
      block(
        "The biggest number on a panel datasheet is the wattage — yet two 550 W panels can perform very differently in the field. The specs that should drive your decision are printed smaller.",
      ),
      block("1. Efficiency", "h3"),
      block(
        "Efficiency decides how much power you get from a limited roof. On tight roofs, one percentage point of efficiency compounds into a real capacity difference.",
      ),
      block("2. Temperature coefficient", "h3"),
      block(
        "Panels lose power as they heat up. A lower coefficient (e.g. −0.29 %/°C) means measurably more production through a Turkish summer.",
      ),
      block("3. Warranty structure", "h3"),
      block(
        "Product and performance warranties are different things. 12–15 years product and 25–30 years performance is a good baseline today — and a local warranty counterpart matters as much as the number.",
      ),
      block("4. Annual degradation", "h3"),
      block(
        "First-year and subsequent annual power loss rates shape total output over 25 years. Low degradation quietly earns money in the long run.",
      ),
      block("5. Bankability", "h3"),
      block(
        "The manufacturer's financial strength is what a 25-year warranty is actually worth. Tier-1 lists aren't sufficient on their own, but they are a sensible first filter.",
      ),
    ],
  },
  {
    _id: "fb-en-incentives",
    language: "en",
    title: "The 2026 incentive and financing map for commercial solar",
    slug: "isletmeler-icin-ges-tesvikleri-2026",
    excerpt:
      "Grant programmes, green transition loans and tax advantages — which businesses qualify for what?",
    coverImage: "/images/v2/area-ticari-saha.jpg",
    publishedAt: "2026-05-12",
    category: { title: "Incentives" },
    author: AUTHOR_EN,
    body: [
      block(
        "Self-consumption solar investments can tap a range of support mechanisms beyond fixing your energy cost. The right structure shortens payback considerably.",
      ),
      block("Grants and support programmes", "h2"),
      block(
        "KOSGEB's green transition support for manufacturing SMEs and the periodic calls of regional development agencies are the two main channels for rooftop projects. Calls are seasonal; keeping the technical annexes ready in advance speeds everything up.",
      ),
      block("Financing", "h2"),
      block(
        "Renewable energy loan packages from public and private banks offer long tenors that protect working capital. Leasing is preferred by businesses that want the equipment off the balance sheet.",
      ),
      block(
        "We map the right programme to your business during the survey phase and prepare the technical side of the application file ourselves.",
      ),
    ],
  },
  {
    _id: "fb-en-winter",
    language: "en",
    title: "Do solar panels work in winter? Seasonal production, with data",
    slug: "gunes-panelleri-kisin-calisir-mi",
    excerpt:
      "What snow, clouds and low sun angles really do to production — and why good engineering already accounts for winter.",
    coverImage: "/images/v2/how/install.jpg",
    publishedAt: "2026-04-21",
    category: { title: "Technology" },
    author: AUTHOR_EN,
    body: [
      block(
        "“Panels don't work in winter” is a common myth. Panels run on light, not heat — cold weather actually improves their efficiency. What lowers winter output is shorter daylight and cloud cover, not temperature.",
      ),
      block("The seasonal split in numbers", "h2"),
      block(
        "Across Türkiye, roughly 60–65% of annual production happens between April and September. December and January are the lowest months — but the annual kWh figure in your PVsyst report already averages all twelve months realistically.",
      ),
      block("What about snow?", "h2"),
      block(
        "On pitched roofs snow usually slides off on its own, and the dark panel surface speeds up melting. In heavy-snow regions, tilt and layout are engineered accordingly during the survey.",
      ),
    ],
  },
  {
    _id: "fb-en-om",
    language: "en",
    title: "Solar O&M and remote monitoring: catching production loss early",
    slug: "ges-bakim-ve-uzaktan-izleme",
    excerpt:
      "From panel cleaning to inverter fault alerts — what it takes to keep your plant at expected output for 25 years.",
    coverImage: "/images/v2/how/om.jpg",
    publishedAt: "2026-03-18",
    category: { title: "Maintenance" },
    author: AUTHOR_EN,
    body: [
      block(
        "A solar plant is the easiest investment to forget — until production quietly drops. Soiling, shading, a loose DC connector or a failed optimizer can cost you for months if nobody is watching.",
      ),
      block("What monitoring makes visible", "h2"),
      block(
        "Modern inverters publish string-level production data. Compared against the expected curve, deviations raise alarms before they ever reach your bill; monthly reports track the performance ratio trend.",
      ),
      block("What periodic maintenance covers", "h2"),
      block(
        "At least once a year: thermal camera inspection, structural and earthing checks, switchgear inspection, and panel cleaning scheduled by region. In dusty or high-pollen areas, cleaning frequency is tuned to the production data.",
      ),
    ],
  },
];

// ~1100 chars/min is a rough Turkish/English silent-reading speed.
function textLength(body: any[]): number {
  return body.reduce(
    (sum, b) =>
      sum + (b.children ?? []).reduce((s: number, c: any) => s + (c.text?.length ?? 0), 0),
    0,
  );
}

export function fallbackReadMinutes(body: any[] | undefined): number {
  if (!body?.length) return 1;
  return Math.max(1, Math.round(textLength(body) / 1100));
}

export function fallbackPosts(locale: string): PostListItem[] {
  return POSTS.filter((p) => p.language === locale)
    .map(({ body, ...p }) => ({ ...p, readMinutes: fallbackReadMinutes(body) }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function fallbackPost(slug: string, locale: string): PostDetail | null {
  const post = POSTS.find((p) => p.slug === slug && p.language === locale);
  return post ? { ...post, readMinutes: fallbackReadMinutes(post.body) } : null;
}

export function fallbackSlugs(): { slug: string; language: string }[] {
  return POSTS.map((p) => ({ slug: p.slug, language: p.language }));
}
