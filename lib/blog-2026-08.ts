/* eslint-disable @typescript-eslint/no-explicit-any */
// 06.08.2026 Notion listesindeki 15 blog konusunun TR makaleleri.
// `scripts/seed-posts-0826.mjs` ile Sanity'ye basılır; site bunları Sanity'den
// okur (fallback dosyasına bilerek eklenmedi, orası 6+6'lık dev yedeği).
// EN çevirileri ayrı tur — istenirse aynı slug'larla language:"en" basılacak.

let k = 0;
const key = () => `s8${(k++).toString(36)}`;

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

const AUTHOR = { name: "MİNADA Ekibi" };

export type SeedPost = {
  _id: string;
  language: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  category: { title: string };
  author: { name: string };
  body: ReturnType<typeof block>[];
};

export const POSTS_0826: SeedPost[] = [
  {
    _id: "s8-tr-ges-urun-secimi",
    language: "tr",
    title: "Güneş enerji santralinde ürün seçimi: Neye, neden karar veriyorsunuz?",
    slug: "ges-urun-secimi",
    excerpt:
      "Panel, inverter, konstrüksiyon ve kablolamada doğru seçim kriterleri: veri sayfasında neye bakılır, ucuz teklif nerede pahalıya patlar?",
    coverImage: "/images/v2/how/procurement.jpg",
    publishedAt: "2026-07-04",
    category: { title: "Rehber" },
    author: AUTHOR,
    body: [
      block(
        "Bir GES projesinde ekipman listesi, sistemin 25 yıllık performansının ta kendisidir. Panel, inverter, konstrüksiyon ve kablolama; dört kalemin her birinde verilen karar üretimi, güvenliği ve bakım maliyetini doğrudan etkiler.",
      ),
      block("Panelde neye bakılır?", "h2"),
      block(
        "Etiket gücünden çok; hücre teknolojisi (bugün ağırlıkla TOPCon N-Type), sıcaklık katsayısı, yıllık degradasyon değeri ve ürün-performans garantilerinin süresi önemlidir. Aynı watt değerindeki iki panel, sıcak bir çatıda yıl sonunda ciddi biçimde farklı üretim yapabilir. Tier-1 üretici listesi bir kalite sertifikası değildir; ama tedarik sürekliliği ve garanti muhatabı bulabilmek için iyi bir ön filtredir.",
      ),
      block("İnverter: sistemin beyni", "h2"),
      block(
        "İnverter seçiminde DC/AC oranı, MPPT sayısı, verim eğrisi ve servis ağı belirleyicidir. Gölgelenmesi olan ya da farklı yönlere bakan çatılarda MPPT sayısı ve string tasarımı, üretici broşüründeki verimden daha fazla üretim kazandırır. İleride batarya düşünülüyorsa hibrit hazırlığı olan bir model baştan seçilmelidir.",
      ),
      block(
        "Ucuz teklifin farkı çoğu zaman görünmeyen kalemlerdedir: statik hesabı yapılmamış konstrüksiyon, sınıfı düşük DC kablo, markasız pano ekipmanı. Fark ilk gün değil, beşinci yıl ortaya çıkar.",
        "blockquote",
      ),
      block("Konstrüksiyon ve dengesi", "h2"),
      block(
        "Konstrüksiyonda malzeme (alüminyum/paslanmaz bağlantı), çatı tipine uygun bağlantı detayı ve rüzgar-kar yükü hesabı esastır. Sızdırmazlık detayı atlanmış bir kiremit çatı bağlantısı, kazandırdığından fazlasını su hasarı olarak geri alır.",
      ),
      block(
        "MİNADA tekliflerinde ekipman listesi marka ve model bazında yazılıdır; keşif sonrasında her kalemin neden seçildiğini tek tek anlatıyoruz.",
      ),
    ],
  },
  {
    _id: "s8-tr-on-grid-hibrit-fark",
    language: "tr",
    title: "On-grid mi, hibrit mi? Şebeke bağlantılı ve bataryalı sistemlerin farkı",
    slug: "on-grid-hibrit-fark",
    excerpt:
      "Şebeke bağlantılı (on-grid) sistemle bataryalı hibrit sistemin çalışma mantığı, maliyet farkı ve hangi profile hangisinin uyduğu.",
    coverImage: "/images/v2/hero-solar.jpeg",
    publishedAt: "2026-07-07",
    category: { title: "Teknoloji" },
    author: AUTHOR,
    body: [
      block(
        "İki sistemin de kalbi aynıdır: çatıdaki paneller gün boyu üretir. Fark, üretimin tüketimle buluşma şeklindedir. On-grid sistemde fazla üretim şebekeye verilir ve mahsuplaşma ile faturadan düşülür; hibrit sistemde ise önce bataryaya yazılır, akşam kendi enerjinizi kullanırsınız.",
      ),
      block("On-grid: en kısa geri ödeme", "h2"),
      block(
        "Batarya maliyeti olmadığı için kurulum bedeli düşüktür ve geri ödeme süresi en kısadır. Mahsuplaşma mekanizması sağlıklı işlediği sürece şebeke, adeta yüzde yüz verimli bir depo gibi davranır. Zayıf noktası da buradadır: şebeke kesildiğinde sistem güvenlik gereği durur ve tarife-mevzuat değişikliklerine karşı hassastır.",
      ),
      block("Hibrit: öz tüketim ve süreklilik", "h2"),
      block(
        "Bataryalı sistemde gündüz üretimin kullanılmayan kısmı akşama taşınır; kesinti anında ise kritik yükler bataryadan beslenmeye devam eder. Karşılığı ek yatırım maliyetidir. Kesintinin sık yaşandığı bölgelerde, akşam tüketimi yüksek evlerde ve saatlik mahsuplaşmaya tabi yeni projelerde hibrit kurulum giderek daha anlamlı hale geliyor.",
      ),
      block(
        "Doğru soru \"hangisi daha iyi\" değil, \"benim tüketim profilime hangisi uyuyor\" sorusudur. Son 12 aylık fatura ve gün içi kullanım alışkanlığı, cevabın neredeyse tamamıdır.",
        "blockquote",
      ),
      block(
        "Keşif aşamasında iki senaryoyu da aynı tabloda gösteriyoruz: kurulum bedeli, yıllık tasarruf ve geri ödeme süresi yan yana; karar size kalıyor.",
      ),
    ],
  },
  {
    _id: "s8-tr-saatlik-aylik-mahsuplasma-farki",
    language: "tr",
    title: "Saatlik mahsuplaşma ile aylık mahsuplaşma arasındaki fark nedir?",
    slug: "saatlik-aylik-mahsuplasma-farki",
    excerpt:
      "İki mahsuplaşma modelinin işleyişi, projeye etkisi ve yatırım kararını neden değiştirdiği; sade bir örnekle.",
    coverImage: "/images/v2/area-ticari.jpg",
    publishedAt: "2026-07-10",
    category: { title: "Mevzuat" },
    author: AUTHOR,
    body: [
      block(
        "Mahsuplaşma, şebekeye verdiğiniz enerji ile şebekeden çektiğiniz enerjinin netleştirilmesidir. Kritik soru şu: bu netleştirme hangi zaman aralığında yapılıyor? Aylık modelde ay toplamları, saatlik modelde her saatin kendi içi karşılaştırılır.",
      ),
      block("Aylık mahsuplaşma nasıl çalışır?", "h2"),
      block(
        "Ay boyunca gündüz verdiğiniz enerji, gece çektiğinizden düşülür. Üretimin ve tüketimin gün içindeki dağılımı önemsizdir; toplamlar eşleşiyorsa faturanız sıfıra yaklaşır. Bu model, şebekeyi ücretsiz bir mevsimlik depo gibi kullanmanıza izin verir.",
      ),
      block("Saatlik mahsuplaşmada ne değişir?", "h2"),
      block(
        "Saatlik modelde öğlen ürettiğiniz fazla enerji, akşam çektiğiniz enerjiyle birebir netleşmez; her saat kendi içinde değerlendirilir ve saatler arası fark farklı bedellerle sonuçlanır. Yani üretimi tüketimle aynı saatlere denk getirmek, ya da getiremiyorsanız bataryayla taşımak önem kazanır.",
      ),
      block(
        "Aylık modelde \"çatıya sığan en büyük sistem\" çoğu zaman doğru cevaptı; saatlik modelde doğru cevap \"tüketim profiline en iyi oturan sistem\" haline geliyor.",
        "blockquote",
      ),
      block(
        "Hangi modele tabi olacağınız; başvuru tarihi, bağlantı türü ve mevzuatın güncel durumuna göre belirlenir. Projelendirme öncesinde bunu netleştirmek, geri ödeme hesabının sağlıklı olmasının ön koşuludur.",
      ),
    ],
  },
  {
    _id: "s8-tr-saatlik-mahsuplasma-ges-profil",
    language: "tr",
    title: "Saatlik mahsuplaşmaya göre kurulacak GES'lerde nelere dikkat edilmeli?",
    slug: "saatlik-mahsuplasma-ges-uretim-tuketim-profili",
    excerpt:
      "Üretim-tüketim profili neden projenin merkezine oturdu? Boyutlandırma, batarya ve yük kaydırma üzerine pratik bir rehber.",
    coverImage: "/images/v2/business-hero.jpeg",
    publishedAt: "2026-07-13",
    category: { title: "Rehber" },
    author: AUTHOR,
    body: [
      block(
        "Saatlik mahsuplaşmaya tabi bir projede artık tek bir soru her şeyi belirliyor: ürettiğiniz saatte tüketiyor musunuz? Cevap hayırsa, fazla üretimin değeri düşer ve kağıt üstünde parlak görünen sistem sahada beklentiyi karşılamaz.",
      ),
      block("Üretim-tüketim profili çıkarmak", "h2"),
      block(
        "İlk adım, tüketimin saatlik dağılımını görmektir. Sayaç verisi ya da yük analiziyle; hafta içi/hafta sonu, yaz/kış profilleri çıkarılır. Gündüz yoğun çalışan bir işletme ile akşam yoğun bir konutun doğru sistemi aynı değildir.",
      ),
      block("Boyutlandırma: büyük değil, isabetli", "h2"),
      block(
        "Saatlik modelde sistemi öz tüketim oranını yüksek tutacak şekilde boyutlandırmak esastır. Gündüz taban yükünüzü karşılayan, fazlayı sınırlı tutan bir güç çoğu zaman daha kısa geri ödeme verir. Çatı daha fazlasını kaldırıyor diye daha büyük kurmak, bu modelde her zaman daha fazla kazandırmaz.",
      ),
      block("Batarya ve yük kaydırma", "h2"),
      block(
        "Profil uyuşmuyorsa iki kaldıraç var: fazla üretimi akşama taşıyan batarya ve tüketimi güneş saatlerine çeken yük kaydırma (sıcak su, sulama, şarj gibi planlanabilir yükler). İkisinin doğru karışımı, fizibilitenin en değerli sayfasıdır.",
      ),
      block(
        "MİNADA projelerinde saatlik simülasyon standarttır: PVsyst üretim modeli, tüketim profilinizle saat saat çakıştırılır ve batarya senaryoları aynı tabloda karşılaştırılır.",
      ),
    ],
  },
  {
    _id: "s8-tr-lisansli-depolamali-ges-fizibilite",
    language: "tr",
    title: "Lisanslı depolamalı GES'lerde fizibilite analizi nasıl yapılır?",
    slug: "lisansli-depolamali-ges-fizibilite",
    excerpt:
      "Depolamalı lisanslı santral yatırımında gelir kalemleri, maliyet yapısı ve fizibiliteyi belirleyen kritik varsayımlar.",
    coverImage: "/images/v2/how/engineering.jpg",
    publishedAt: "2026-07-16",
    category: { title: "Rehber" },
    author: AUTHOR,
    body: [
      block(
        "Depolamalı lisanslı GES, klasik santral fizibilitesinden daha çok katmanlı bir hesap ister: üretim gelirine bataryanın sağladığı esneklik değeri eklenir, karşısına ise ciddi bir ek yatırım kalemi oturur.",
      ),
      block("Gelir tarafı", "h2"),
      block(
        "Ana gelir, üretilen enerjinin satışıdır. Batarya bunun üstüne; üretimi fiyatın yüksek olduğu saatlere kaydırma, dengesizlik maliyetlerini azaltma ve ileride yan hizmet piyasalarına katılım gibi ek değerler koyar. Fizibilitede bu kalemlerin hangi fiyat varsayımıyla hesaplandığı açıkça yazılmalıdır; iyimser fiyat eğrisi, kağıt üstünde her projeyi karlı gösterir.",
      ),
      block("Maliyet tarafı", "h2"),
      block(
        "Panel ve inverter maliyetine batarya hücreleri, PCS, BMS/EMS ve entegrasyon eklenir. Bataryada yatırım bedeli kadar önemli iki parametre daha vardır: çevrim ömrü ve garanti kapsamındaki kapasite kaybı. On yıl sonunda elde kalacak kullanılabilir kapasite, fizibilitenin görünmeyen ana girdisidir.",
      ),
      block(
        "Depolamalı fizibilitede en sık yapılan hata, bataryayı tam kapasiteyle sonsuza kadar çalışıyor saymaktır. Degradasyon ve çevrim sınırı hesaba girmeden çıkan geri ödeme süresi gerçekçi değildir.",
        "blockquote",
      ),
      block(
        "Sağlıklı bir fizibilite; saatlik üretim modeli, batarya işletme stratejisi ve duyarlılık analizini (fiyat, kur, degradasyon) birlikte içerir. Tek senaryolu sunumlara mesafeli yaklaşın.",
      ),
    ],
  },
  {
    _id: "s8-tr-yerli-aksam-destegi",
    language: "tr",
    title: "Yerli aksam desteğinin depolamalı GES yatırımlarına etkisi",
    slug: "yerli-aksam-destegi-depolamali-ges",
    excerpt:
      "Yerli aksam teşviki ne sağlar, hangi bileşenleri kapsar ve depolamalı projelerin fizibilitesini nasıl değiştirir?",
    coverImage: "/images/v2/hero-night.jpeg",
    publishedAt: "2026-07-19",
    category: { title: "Teşvikler" },
    author: AUTHOR,
    body: [
      block(
        "Türkiye'de yenilenebilir enerji yatırımlarını destekleyen mekanizmaların en önemlilerinden biri yerli aksam desteğidir: santralde kullanılan bileşenlerin yurt içinde üretilmesi halinde, üretilen enerji için ek bir katkı sağlanır.",
      ),
      block("Mekanizma nasıl çalışır?", "h2"),
      block(
        "Destek, bileşen bazında tanımlanır; panel, hücre, konstrüksiyon, inverter gibi kalemlerin her birinin yerlilik şartları ve katkı payları ayrı ayrı belirlenir. Depolamalı projelerde batarya tarafındaki yerli üretim kapasitesinin gelişmesiyle, desteğin kapsamı yatırım kararlarında giderek daha görünür bir kalem haline geldi.",
      ),
      block("Fizibiliteye etkisi", "h2"),
      block(
        "Yerli aksam katkısı, gelir tarafına eklenen ve yıllara yayılan bir kalemdir; doğru kurgulandığında geri ödeme süresini kayda değer biçimde kısaltır. Ancak iki dikkat noktası var: yerli bileşenin fiyat farkı ile desteğin sağladığı ek gelirin karşılaştırılması ve destekten yararlanma şartlarının (belgelendirme, süreler, başvuru) eksiksiz yönetilmesi.",
      ),
      block(
        "Teşvik, kötü bir projeyi iyi yapmaz; iyi bir projeyi daha iyi yapar. Karar, teşviksiz senaryoda da ayakta duran bir fizibilite üzerine kurulmalıdır.",
        "blockquote",
      ),
      block(
        "Güncel destek oranları ve kapsam mevzuatla değişebildiği için, yatırım öncesinde son duruma birlikte bakmakta fayda var; keşif görüşmelerinde bu tabloyu güncel haliyle paylaşıyoruz.",
      ),
    ],
  },
  {
    _id: "s8-tr-lisanssiz-yonetmelik-kronoloji",
    language: "tr",
    title: "Lisanssız elektrik üretim mevzuatı: Değişim kronolojisi ve güncel durum",
    slug: "lisanssiz-uretim-yonetmeligi-kronoloji",
    excerpt:
      "Lisanssız üretimin Türkiye'deki evrimi: dünden bugüne ana dönüm noktaları ve yatırımcı için bugünkü tablo.",
    coverImage: "/images/ges/ges-ground.jpg",
    publishedAt: "2026-07-22",
    category: { title: "Mevzuat" },
    author: AUTHOR,
    body: [
      block(
        "Lisanssız üretim, çatı GES pazarının hukuki omurgasıdır ve yönetmelik yıllar içinde birkaç kez karakter değiştirdi. Bugünkü tabloyu doğru okumak için bu evrimi bilmek gerekir.",
      ),
      block("Ana dönüm noktaları", "h2"),
      block(
        "İlk dönemde küçük güçlerle başlayan lisanssız üretim, sonraki düzenlemelerle hem güç sınırlarının yükselmesi hem de başvuru süreçlerinin sadeleşmesiyle geniş bir yatırımcı kitlesine açıldı. Öz tüketimi esas alan yaklaşım zamanla güçlendi: bağlantı gücü ile kurulu güç ilişkisi, tüketim tesisiyle eşleşme şartı ve mahsuplaşma esasları bu eksende şekillendi. Son dönemin en önemli değişimi ise yeni başvurularda saatlik mahsuplaşmaya geçiş yönündeki düzenlemeler oldu.",
      ),
      block("Bugün yatırımcı için ne anlama geliyor?", "h2"),
      block(
        "Güncel mevzuatta kritik başlıklar şunlar: tüketim tesisi ile ilişkilendirme, bağlantı görüşü ve çağrı mektubu süreci, geçici kabul ve mahsuplaşma modeli. Hangi tarihte, hangi kapsamda başvurduğunuz; projenizin hangi kurallara tabi olacağını belirler. Bu yüzden eski tarihli bir projeyle yeni bir projeyi aynı fizibilite şablonuyla değerlendirmek yanıltıcıdır.",
      ),
      block(
        "Mevzuat değişkendir; proje dosyanız güncel yönetmeliğe göre hazırlanmalı, geçiş hükümleri mutlaka kontrol edilmelidir. Başvuru ve izin sürecinin tamamını MİNADA olarak biz yürütüyoruz.",
      ),
    ],
  },
  {
    _id: "s8-tr-dagitim-iletim-baglanti",
    language: "tr",
    title: "Dağıtımdan bağlantı ile iletimden bağlantı arasındaki farklar",
    slug: "dagitim-iletim-baglanti-farklari",
    excerpt:
      "Santraliniz şebekeye nereden bağlanmalı? Gerilim seviyesi, süreç, maliyet ve işletme farklarıyla iki bağlantı türü.",
    coverImage: "/images/v2/area-kamu.jpg",
    publishedAt: "2026-07-25",
    category: { title: "Mevzuat" },
    author: AUTHOR,
    body: [
      block(
        "Bir üretim tesisi şebekeye iki kapıdan bağlanabilir: dağıtım şebekesi (yerel dağıtım şirketinin işlettiği, görece düşük gerilim seviyeleri) ya da iletim şebekesi (TEİAŞ'ın işlettiği yüksek gerilim omurgası). Hangi kapının doğru olduğu esasen projenin gücüne ve konumuna bağlıdır.",
      ),
      block("Dağıtımdan bağlantı", "h2"),
      block(
        "Çatı ve küçük-orta ölçekli sahalar için standart yoldur. Muhatap dağıtım şirketidir; bağlantı görüşü, çağrı mektubu ve kabul süreçleri bu şirket üzerinden yürür. Bağlantı maliyeti görece düşüktür, süreç daha kısadır; buna karşılık bölgedeki trafo ve hat kapasitesi sınırlayıcı olabilir. Kapasitenin dolu olduğu bölgelerde bağlantı görüşü olumsuz dönebilir ya da güç sınırlaması gelebilir.",
      ),
      block("İletimden bağlantı", "h2"),
      block(
        "Büyük güçlü sahalar iletim seviyesinden bağlanır. Muhatap TEİAŞ'tır; genellikle özel bir bağlantı hattı ve şalt tesisi yatırımı gerekir. Maliyet ve süre büyür, teknik şartlar ağırlaşır; karşılığında büyük güçler için kapasite bulmak daha olasıdır ve tesis, dağıtım bölgesindeki yerel kısıtlardan görece bağımsızlaşır.",
      ),
      block(
        "Pratik kural: gücünüz dağıtım seviyesinin sınırları içindeyse önce dağıtımdan kapasite arayın; büyük ölçekte ise iletim bağlantısının yatırım kalemlerini fizibiliteye baştan koyun.",
        "blockquote",
      ),
      block(
        "İki senaryoda da bağlantı görüşü alınmadan kesinleşmiş bir proje yoktur. Saha seçiminde kapasite durumunu en başta sorgulamak, boşa geçen ayları önler.",
      ),
    ],
  },
  {
    _id: "s8-tr-isi-pompasi-secimi",
    language: "tr",
    title: "Isı pompası seçiminde dikkat edilmesi gereken hususlar",
    slug: "isi-pompasi-seciminde-dikkat-edilecekler",
    excerpt:
      "Doğru kapasite, COP/SCOP değerleri, soğutucu akışkan ve mevcut tesisata uyum: ısı pompası alırken sorulacak sorular.",
    coverImage: "/images/v2/service-heatpump.jpg",
    publishedAt: "2026-07-28",
    category: { title: "Rehber" },
    author: AUTHOR,
    body: [
      block(
        "Isı pompası, elektriği ısıya çevirmez; dışarıdaki ısıyı içeri taşır. Bu yüzden doğru seçilmiş bir cihaz, harcadığı her birim elektriğe karşılık birkaç birim ısı verir. Yanlış seçilmiş cihaz ise ya yetersiz kalır ya da gereksiz yatırıma dönüşür.",
      ),
      block("Kapasite: ne büyük, ne küçük", "h2"),
      block(
        "Seçimin temeli ısı kaybı hesabıdır. Binanın yalıtımı, camları ve bulunduğu iklim bölgesi üzerinden kış tasarım sıcaklığında ihtiyaç duyulan güç hesaplanır. Kataloğa değil, bu hesaba göre seçim yapılır; zira aşırı büyük cihaz sık dur-kalk yaparak hem verim hem ömür kaybeder.",
      ),
      block("Verim değerleri: COP ve SCOP", "h2"),
      block(
        "COP anlık verimi, SCOP ise sezon geneli verimi gösterir. Karşılaştırmayı aynı test koşulundaki değerler üzerinden yapın ve özellikle düşük dış sıcaklıktaki (örneğin -7°C) kapasite ve verim tablosunu isteyin. Cihazın soğukta ne yaptığı, broşür kapağındaki tek rakamdan daha önemlidir.",
      ),
      block("Akışkan, ses ve tesisat uyumu", "h2"),
      block(
        "Yeni nesil cihazlarda düşük küresel ısınma potansiyelli akışkanlar (R290 gibi) öne çıkıyor; yüksek gidiş suyu sıcaklığı sağlayabildikleri için mevcut radyatörlü sistemlere uyumları da daha iyi. Dış ünitenin ses seviyesi ve yerleşimi, özellikle bitişik nizam konutlarda baştan planlanmalı. Yerden ısıtma ile birlikte en yüksek verimi verir; radyatörlü sistemde gidiş suyu ihtiyacına göre cihaz sınıfı seçilir.",
      ),
      block(
        "Çatınızda GES varsa tablo daha da güzelleşir: gündüz üretilen elektrik, ısı pompası üzerinden eve ısı olarak depolanır. Keşifte ısı kaybı hesabını ve GES ile birlikte çalışma senaryosunu birlikte çıkarıyoruz.",
      ),
    ],
  },
  {
    _id: "s8-tr-evc-ticari-opsiyonlar",
    language: "tr",
    title: "Elektrikli araç şarj istasyonlarında ticari opsiyonlar",
    slug: "ev-sarj-istasyonu-ticari-opsiyonlar",
    excerpt:
      "İşletmeler için EV şarj: kendi filosuna altyapı kurmaktan gelir getiren halka açık istasyon işletmeciliğine seçenekler.",
    coverImage: "/images/v2/service-ev.jpg",
    publishedAt: "2026-07-31",
    category: { title: "Rehber" },
    author: AUTHOR,
    body: [
      block(
        "Elektrikli araç sayısı arttıkça şarj altyapısı, işletmeler için masraf kaleminden potansiyel gelir ve müşteri deneyimi aracına dönüşüyor. Doğru opsiyon, lokasyonunuza ve hedefinize göre değişir.",
      ),
      block("1. Filo ve personel şarjı", "h2"),
      block(
        "En yalın senaryo: otoparkınıza AC şarj üniteleri kurar, kendi araçlarınızı ve personelinizi şarj edersiniz. Yük yönetimi yazılımıyla mevcut trafo kapasitesi verimli kullanılır; çatı GES ile birleştiğinde filonun yakıt gideri ciddi oranda düşer.",
      ),
      block("2. Müşteriye hizmet olarak şarj", "h2"),
      block(
        "Otel, AVM, restoran gibi konaklama süresi olan işletmelerde şarj, müşteriyi size getiren bir hizmettir. Ücretsiz ya da maliyetine sunulabilir; kazanç, müşterinin kalış süresi ve tercih sebebinde saklıdır.",
      ),
      block("3. Halka açık istasyon işletmeciliği", "h2"),
      block(
        "Gelir hedefliyorsanız yol: EPDK şarj ağı işletmecisi lisansına sahip bir ağa katılmak ya da kendi lisansınızla ağ kurmaktır. DC hızlı şarj (90 kW ve üzeri) burada devreye girer; yatırım büyür ama ana yol güzergahları ve yoğun lokasyonlarda kullanım oranı da büyür. Fizibilitenin anahtarı lokasyonun trafiği ve trafo kapasitesidir.",
      ),
      block(
        "Şarj yatırımının elektriği nereden aldığı, karlılığın gizli değişkenidir: çatı GES ve depolama ile beslenen istasyon, hem birim maliyeti düşürür hem talep sivrilerini yumuşatır.",
        "blockquote",
      ),
      block(
        "MİNADA olarak trafo kapasitesi analizi, ünite seçimi ve GES entegrasyonunu tek projede kurguluyoruz; lisanslı ağ ortaklıkları için de yönlendirme yapıyoruz.",
      ),
    ],
  },
  {
    _id: "s8-tr-zero-house",
    language: "tr",
    title: "Zero House konsepti: Kendi enerjisini üreten ev",
    slug: "zero-house-konsepti",
    excerpt:
      "Üret, depola, yönet: bir evin enerji faturasını sıfıra yaklaştıran bütüncül kurgunun bileşenleri.",
    coverImage: "/images/v2/home-hero.jpeg",
    publishedAt: "2026-08-02",
    category: { title: "Teknoloji" },
    author: AUTHOR,
    body: [
      block(
        "Zero House; yıl toplamında tükettiği enerjiyi kendi üreten, şebekeye mecburiyetini asgariye indirmiş ev demektir. Bu bir ürün değil, birbirini tamamlayan sistemlerin doğru kurgusudur: güneş, depolama, ısı pompası ve akıllı yönetim.",
      ),
      block("Dört bileşen, tek denge", "h2"),
      block(
        "Çatıdaki GES gündüz üretir; batarya fazlayı akşama taşır; ısı pompası ısıtma-soğutmayı elektriğe, dolayısıyla güneşe bağlar; araç şarjı da aynı kaynaktan beslenir. Enerji yönetim sistemi (EMS) bu dörtlüyü tek orkestra gibi çalıştırır: üretim fazlayken bataryayı ve sıcak suyu doldurur, araç şarjını güneş saatlerine kaydırır.",
      ),
      block("Sıfır fatura gerçekçi mi?", "h2"),
      block(
        "Yıllık toplamda üretim-tüketim dengesi kurulabilir; ancak kışın derinliğinde şebekeden destek almak normaldir. Hedef, şebekeyi yok saymak değil; onu bir yedek güvence konumuna indirmektir. Doğru boyutlandırılmış bir kurguda fatura, sabit bedeller seviyesine kadar geriler.",
      ),
      block(
        "Sıra önemlidir: önce verimlilik (yalıtım, doğru cihazlar), sonra üretim, sonra depolama. Ters sıra, gereksiz büyük ve pahalı sistemler doğurur.",
        "blockquote",
      ),
      block(
        "MİNADA'nın yaklaşımı tam olarak bu: mevcut evinizi, yaşam alışkanlıklarınızı bozmadan kendine yeten bir eve çevirmek. Keşifte evinizin Zero House yol haritasını adım adım çıkarıyoruz.",
      ),
    ],
  },
  {
    _id: "s8-tr-elektrikli-gelecek",
    language: "tr",
    title: "Elektrikli gelecek neyi ifade ediyor?",
    slug: "elektrikli-gelecek",
    excerpt:
      "Ulaşımdan ısınmaya her şey elektrikleşiyor. Bu dönüşümün ev ve işletme ölçeğindeki karşılığı ne?",
    coverImage: "/images/v2/cta-2.jpg",
    publishedAt: "2026-08-03",
    category: { title: "Teknoloji" },
    author: AUTHOR,
    body: [
      block(
        "Yüzyıl boyunca enerji dediğimizde aklımıza farklı yakıtlar geldi: kömür, petrol, doğalgaz. Şimdi tüm bu ihtiyaçlar tek bir taşıyıcıda birleşiyor: elektrik. Araçlar elektrikle gidiyor, evler elektrikle ısınıyor, sanayi süreçleri elektrikleşiyor.",
      ),
      block("Neden elektrik?", "h2"),
      block(
        "İki sebep: verim ve kaynak. Elektrikli motor, içten yanmalıdan; ısı pompası, kazandan kat kat verimlidir. Ve elektrik, güneş ile rüzgardan giderek daha ucuza üretilebiliyor. Elektrikleşme, enerjiyi hem temizliyor hem yerelleştiriyor: üretim çatınıza kadar iniyor.",
      ),
      block("Ev ve işletme için anlamı", "h2"),
      block(
        "Elektrikleşen bir hayatta elektrik faturası, eski yakıt giderlerinin toplamını temsil eder hale geliyor. Bu da bir riski ve bir fırsatı aynı anda doğuruyor: risk, tek kaleme bağımlılık; fırsat, o kalemi kendi çatınızdan üretebilme imkanı. Aracını ve ısınmasını güneşinden besleyen bir ev, enerji maliyetinin önemli bölümünü sabitlemiş olur.",
      ),
      block(
        "Elektrikli gelecek, enerjiyi satın alınan bir hizmet olmaktan çıkarıp yönetilen bir varlığa dönüştürüyor. Kazanan, bu yönetimi erken kuranlar olacak.",
        "blockquote",
      ),
      block(
        "Bu dönüşümün ev ölçeğindeki adı Zero House; işletme ölçeğindeki adı öz tüketim santrali. İkisinde de ilk adım aynı: bugünkü tüketiminizi tanımak. Gerisi mühendislik.",
      ),
    ],
  },
  {
    _id: "s8-tr-nseb-projeleri",
    language: "tr",
    title: "NSEB projeleri ne demek, süreç nasıl ilerliyor?",
    slug: "nseb-projeleri-surec",
    excerpt:
      "Neredeyse Sıfır Enerjili Bina (NSEB) şartı kimleri kapsıyor, yenilenebilir enerji şartı nasıl karşılanıyor?",
    coverImage: "/images/v2/area-konut.jpg",
    publishedAt: "2026-08-04",
    category: { title: "Mevzuat" },
    author: AUTHOR,
    body: [
      block(
        "NSEB, \"Neredeyse Sıfır Enerjili Bina\" ifadesinin kısaltmasıdır: enerji ihtiyacı yüksek verimlilikle asgariye indirilmiş ve bu ihtiyacın kayda değer bölümü yenilenebilir kaynaklardan karşılanan bina. Türkiye'de yeni yapılar için bu yaklaşım, mevzuatla kademeli olarak zorunluluğa dönüştü.",
      ),
      block("Şart neyi istiyor?", "h2"),
      block(
        "Kapsamdaki yeni binalarda iki başlık aranır: binanın enerji performans sınıfının belirli bir seviyenin üstünde olması ve enerji ihtiyacının belirli bir oranının yenilenebilir kaynaklardan karşılanması. Pratikte bu ikinci şartın en yaygın cevabı çatı GES'tir; ısı pompası da toplam kurgunun güçlü bir tamamlayıcısıdır.",
      ),
      block("Süreç nasıl ilerliyor?", "h2"),
      block(
        "Şart, ruhsat aşamasında devreye girer: projenin enerji kimlik belgesi hesabı NSEB kriterlerine göre yapılır, yenilenebilir üretim projesi (tipik olarak çatı GES) mimari ve elektrik projesine işlenir. Yapı kullanma izni aşamasında sistemin kurulmuş ve belgelenmiş olması beklenir. Yani GES artık inşaatın sonunda akla gelen bir aksesuar değil, ruhsat dosyasının parçasıdır.",
      ),
      block(
        "Müteahhit ve proje sahipleri için pratik sonuç: GES'i projeye erken dahil etmek hem uyumu kolaylaştırır hem çatı-statik-elektrik koordinasyonunu ucuzlatır. Sona bırakılan uyum, en pahalı uyumdur.",
        "blockquote",
      ),
      block(
        "MİNADA, NSEB kapsamındaki projelerde enerji kimlik belgesi hedefine uygun GES boyutlandırması, proje çizimi ve kabul sürecini tek elden yürütüyor.",
      ),
    ],
  },
  {
    _id: "s8-tr-ges-isletme-donemi",
    language: "tr",
    title: "GES işletme döneminde nelere dikkat edilmeli?",
    slug: "ges-isletme-doneminde-dikkat-edilecekler",
    excerpt:
      "Kurulum bitti, üretim başladı. Peki 25 yıllık işletme döneminde performansı ve garantileri ne korur?",
    coverImage: "/images/ges/ges-rooftop.jpg",
    publishedAt: "2026-08-05",
    category: { title: "Bakım" },
    author: AUTHOR,
    body: [
      block(
        "Bir GES'in ekonomisi kurulum günü değil, işletme döneminde kazanılır ya da kaybedilir. İyi kurulmuş bir santral kendi halinde çalışır gibi görünür; ama fark edilmeyen küçük bir arıza, aylarca sessizce üretim çalabilir.",
      ),
      block("Performansı izlemek", "h2"),
      block(
        "Temel gösterge performans oranıdır (PR): gerçekleşen üretimin, ışınıma göre beklenen üretime oranı. PR'daki düşüş; kirlilik, gölgelenme, string arızası ya da inverter sorununun ilk sinyalidir. Aylık fatura yerine günlük üretim verisini izlemek, sorunu haftalar değil saatler içinde yakalamak demektir.",
      ),
      block("Düzenli kontroller", "h2"),
      block(
        "Panel temizliği bölgenin tozuna göre planlanır; termal kamera taraması sıcak noktaları, izolasyon testleri kablo yaşlanmasını erken yakalar. Konstrüksiyon bağlantıları ve pano içi bağlantı torkları periyodik kontrol ister. Çatı santrallerinde sızdırmazlık detaylarının yıllık kontrolü, en ucuz sigortadır.",
      ),
      block("Garanti ve kayıt düzeni", "h2"),
      block(
        "Panel performans garantisi, inverter ürün garantisi ve işçilik garantisinin süreleri ile şartları dosyanızda yazılı olmalı; arıza ve bakım kayıtları düzenli tutulmalıdır. Garanti talebinde üretim verisi ve bakım kaydı, en güçlü iki kanıttır.",
      ),
      block(
        "MİNADA kurduğu her sistemi 7/24 uzaktan izler; periyodik bakım ve performans raporlamasını işletme sözleşmesi kapsamında üstlenir. Santralinizi kurmadığımız halde devralmamız da mümkün; mevcut tesisler için işletme denetimi yapıyoruz.",
      ),
    ],
  },
  {
    _id: "s8-tr-izleme-bakim-etkileri",
    language: "tr",
    title: "İzleme ve bakım süreçlerinin GES performansına etkisi",
    slug: "izleme-bakim-sureclerinin-gese-etkileri",
    excerpt:
      "İzlenmeyen santral, sessizce kaybettirir: izleme altyapısının ve planlı bakımın üretime somut katkısı.",
    coverImage: "/images/v2/how/om.jpg",
    publishedAt: "2026-08-06",
    category: { title: "Bakım" },
    author: AUTHOR,
    body: [
      block(
        "İki özdeş santral düşünün: biri izleniyor ve planlı bakım görüyor, diğeri kendi haline bırakılmış. İlk yıl ikisi de benzer üretir. Beş yıl sonra aradaki fark, çoğu işletme sahibinin tahmininden büyüktür; çünkü kayıplar tek seferde değil, sessiz ve birikerek gelir.",
      ),
      block("İzleme neyi görünür kılar?", "h2"),
      block(
        "String bazlı izleme; kirlenmeden gölgelenmeye, gevşeyen bir konnektörden arızalı bir panele kadar sorunları üretim eğrisindeki sapmadan yakalar. Alarm kuralları doğru kurulduğunda sistem, sorunu siz fark etmeden haber verir. İzlemesiz santralde ise arıza ancak faturada, yani aylar sonra görünür.",
      ),
      block("Planlı bakımın getirisi", "h2"),
      block(
        "Temizlik, termal tarama, tork ve izolasyon kontrolleri; her biri küçük görünen ama üretim kaybını ve büyük arıza riskini birlikte düşüren işlerdir. Plansız duruşun maliyeti sadece onarım değil, durup beklerken üretilmeyen enerjidir. Planlı bakım, bu duruşları takvime alıp üretimin en düşük olduğu dönemlere kaydırır.",
      ),
      block(
        "İyi bir işletme sözleşmesinin ölçüsü şudur: santralin ne ürettiğini her gün bilen biri var mı ve sapmada kim, ne kadar sürede müdahale ediyor?",
        "blockquote",
      ),
      block(
        "MİNADA işletme hizmetinde izleme, periyodik bakım ve raporlama tek pakettir: aylık performans raporunuzda üretim, PR ve yapılan işlemler kalem kalem yer alır.",
      ),
    ],
  },
];
