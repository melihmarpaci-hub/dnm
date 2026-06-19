import React, { useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from "recharts";

// ───────────────────────── DUMMY DATA ─────────────────────────
const DEBTS = [
  { id: "akdeniz", short: "A", name: "Akdeniz Bankası", type: "World Kredi Kartı", rate: 3.75, installments: null, balance: 42500, status: "Kritik Seviye", statusTone: "critical" },
  { id: "garanti", short: "G", name: "Garanti Finans", type: "İhtiyaç Kredisi", rate: 2.95, installments: 12, balance: 88000, status: "Düzenli Ödeme", statusTone: "neutral" },
  { id: "mavi",    short: "M", name: "Mavi Mağaza", type: "Mağaza Taksiti", rate: 0.00, installments: 3, balance: 13700, status: "Bitişe Yakın", statusTone: "positive" },
  { id: "paylater",short: "P", name: "PayLater", type: "BNPL Taksitlendirme", rate: 2.10, installments: 4, balance: 4200, status: "Düzenli Ödeme", statusTone: "neutral" },
];

const BALANCES = [
  { id: "vadesiz",   short: "Vad", name: "Vadesiz TL Hesap", kind: "Vadesiz", inst: "Akdeniz Bankası", note: null, amount: 18500, liquidity: "Anında", liquid: true },
  { id: "vadeli",    short: "Vad", name: "32 Gün Vadeli Mevduat", kind: "Vadeli Mevduat", inst: "Akdeniz Bankası", note: "Yıllık beklenen: %48 · Vade bozulursa faiz kaybı: ~1.800 TL", amount: 45000, liquidity: "18 gün sonra", liquid: false },
  { id: "ppf",       short: "Yat", name: "Para Piyasası Fonu (AFA)", kind: "Yatırım Fonu", inst: "Mavi Yatırım", note: "Yıllık beklenen: %42", amount: 22300, liquidity: "T+1", liquid: true },
  { id: "bist",      short: "His", name: "BIST Hisse Portföyü", kind: "Hisse", inst: "Mavi Yatırım", note: "%12 kâr durumunda", amount: 31200, liquidity: "T+2", liquid: true },
  { id: "usd",       short: "Döv", name: "USD Vadesiz", kind: "Döviz", inst: "Akdeniz Bankası · $420", note: null, amount: 16800, liquidity: "Anında", liquid: true },
  { id: "altin",     short: "Alt", name: "Gram Altın", kind: "Altın", inst: "Kuyumcu Kasa · 8 gr", note: null, amount: 24600, liquidity: "T+1", liquid: true },
];

const TOTAL_DEBT = DEBTS.reduce((s, d) => s + d.balance, 0);
const TOTAL_ASSET = BALANCES.reduce((s, b) => s + b.amount, 0);
const LIQUID = BALANCES.filter(b => b.liquid).reduce((s, b) => s + b.amount, 0);
const MONTHLY_CAPACITY = 12500;

const STRATEGIES = [
  { id: "cashflow",  name: "Sadece Nakit Akışı", desc: "Varlıklara dokunma, sadece aylık 12.500 TL ile öde.", months: 18, interestCost: 38200, recommended: false },
  { id: "hybrid",    name: "Bakiye + Nakit Akışı", desc: "Likit varlıkların 40.800 TL'sini yüksek faizli borçlara akıt.", months: 9,  interestCost: 11400, recommended: true },
  { id: "refinance", name: "Düşük Faizli Krediyle Yapılandır", desc: "Tüm borçları tek bir krediye topla, vadeyi uzat.", months: 24, interestCost: 22600, recommended: false },
];

const PROJECTION = [
  { m: "Bugün", v: 148400 },{ m: "Oca", v: 136300 },{ m: "Şub", v: 124100 },{ m: "Mar", v: 111800 },
  { m: "Nis", v: 99400 },{ m: "May", v: 86900 },{ m: "Haz", v: 74300 },{ m: "Tem", v: 61600 },
  { m: "Ağu", v: 48800 },{ m: "Eyl", v: 35900 },{ m: "Eki", v: 22900 },{ m: "Kas", v: 9800 },{ m: "Ara", v: 0 },
];

const ROADMAP = [
  { n: 1, title: "Bütçe & Bakiye Analizi", when: "Tamamlandı", desc: "Aylık 12.500 TL kapasite ve 158.400 TL varlık tespit edildi.", state: "done" },
  { n: 2, title: "Yüksek Faizli Kartı Likitle Kapat", when: "Şu an", desc: "Vadesiz + para piyasası fonundan 40.800 TL ile Akdeniz kartı kapatılıyor.", state: "active", progress: 33 },
  { n: 3, title: "BNPL & Mağaza Taksiti Tasfiye", when: "Mart 2025", desc: "Küçük bakiyeleri tek seferde nakitle kapatıp nakit akışını rahatlat.", state: "upcoming" },
  { n: 4, title: "Kalan Krediyi Yapılandır", when: "Temmuz 2025", desc: "Garanti ihtiyaç kredisi için %2,30 faizli alternatif teklif değerlendirilecek.", state: "upcoming" },
  { n: 5, title: "Borçsuzluk & Birikim", when: "Eylül 2025", desc: "Tüm borçlar kapanır, vadeli mevduat tekrar büyütülmeye başlanır.", state: "upcoming" },
];

const LOANS = [
  { id: "vakif",   short: "V", inst: "Vakıf Katılım",  product: "Murabaha Finansmanı", tag: "Esnek Vade", tagTone: "soft",
    badge: "En Düşük Faiz", approval: "orta",
    perks: ["Düşük aylık taksit", "Erken kapama cezasız", "Faizsiz alternatif"],
    rate: 2.18, term: 36, monthly: 6650, total: 239400, interest: 91000, max: 180000 },
  { id: "akdeniz", short: "A", inst: "Akdeniz Bankası", product: "Borç Transferi Kredisi", tag: "En Uygun", tagTone: "strong",
    badge: null, approval: "yüksek",
    perks: ["Mevcut müşteri indirimi", "Dosya masrafı yok", "İlk taksit 60 gün sonra"],
    rate: 2.29, term: 24, monthly: 8900, total: 213600, interest: 65200, max: 200000 },
  { id: "yapi",    short: "Y", inst: "Yapı & Finans",  product: "İhtiyaç Birleştirme", tag: "Hızlı Onay", tagTone: "soft",
    badge: "En Düşük Taksit", approval: "yüksek",
    perks: ["15 dk içinde sonuç", "Online imza", "Maaş müşterisi şartı yok"],
    rate: 2.45, term: 24, monthly: 9180, total: 220320, interest: 71920, max: 250000 },
  { id: "mavi",    short: "M", inst: "Mavi Dijital",   product: "FlexiKredi", tag: null, tagTone: null,
    badge: "En Düşük Maliyet", approval: "yüksek",
    perks: ["Kısa vade", "Mobil onay", "Otomatik ödeme indirimi"],
    rate: 2.62, term: 18, monthly: 10200, total: 183600, interest: 35200, max: 150000 },
];

const PIE_COLORS = ["#1f3a3d", "#3d6b6f", "#7a9b8e", "#c4956c", "#8c5a3c", "#5a7d6f"];

const tl = (n) => `${n.toLocaleString("tr-TR")} TL`;

// ───────────────────────── PRIMITIVES ─────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-stone-200 rounded-lg ${className}`}>{children}</div>
);

const Stat = ({ label, value, sub, tone = "default" }) => {
  const toneClass = tone === "danger" ? "text-rose-700" : tone === "positive" ? "text-emerald-700" : "text-stone-900";
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-stone-500 font-medium">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${toneClass}`}>{value}</div>
      {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
    </div>
  );
};

const Badge = ({ tone = "neutral", children }) => {
  const tones = {
    critical: "bg-rose-50 text-rose-700 border-rose-200",
    positive: "bg-emerald-50 text-emerald-700 border-emerald-200",
    neutral:  "bg-stone-100 text-stone-700 border-stone-200",
    soft:     "bg-amber-50 text-amber-800 border-amber-200",
    strong:   "bg-teal-900 text-teal-50 border-teal-900",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${tones[tone]}`}>{children}</span>;
};

const Avatar = ({ ch }) => (
  <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-semibold text-sm shrink-0">
    {ch}
  </div>
);

const Eyebrow = ({ children }) => (
  <div className="text-xs uppercase tracking-widest text-stone-500 font-medium mb-2">{children}</div>
);

// ───────────────────────── NAV ─────────────────────────
const NAV = [
  { id: "ozet",       label: "Özet" },
  { id: "borclarim",  label: "Borçlarım" },
  { id: "bakiyelerim",label: "Bakiyelerim" },
  { id: "strateji",   label: "Strateji" },
  { id: "krediler",   label: "Krediler" },
];

const TopNav = ({ page, setPage }) => (
  <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <button onClick={() => setPage("ozet")} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-teal-900 text-white flex items-center justify-center text-xs font-bold tracking-wider">K</div>
        <span className="font-semibold tracking-wide text-stone-900">KAPAT</span>
      </button>
      <nav className="hidden md:flex items-center gap-1">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            className={`px-3 py-1.5 text-sm rounded transition ${page === n.id ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"}`}>
            {n.label}
          </button>
        ))}
      </nav>
      <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900 text-sm font-semibold">CY</div>
    </div>
    <div className="md:hidden border-t border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-2 flex gap-1 overflow-x-auto">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            className={`px-3 py-1.5 text-sm rounded whitespace-nowrap ${page === n.id ? "bg-stone-900 text-white" : "text-stone-600"}`}>
            {n.label}
          </button>
        ))}
      </div>
    </div>
  </header>
);

// ───────────────────────── PAGES ─────────────────────────
const PageOzet = ({ setPage }) => (
  <div className="space-y-6">
    <div>
      <Eyebrow>Yol haritan güncel</Eyebrow>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-stone-900">
        Borç Kapatma Planın Hazır <span className="inline-block">🚀</span>
      </h1>
      <p className="text-stone-600 mt-3 max-w-2xl">
        Toplam <strong className="text-stone-900">4 farklı kurumdaki</strong> borcunu analiz ettim.
        Mevcut <strong className="text-stone-900">12.500 TL</strong> aylık ödeme kapasitenle, tüm borçlarını
        <strong className="text-stone-900"> 18 ay</strong> içinde sıfırlayabiliriz.
      </p>
      <div className="flex flex-wrap gap-2 mt-5">
        <button onClick={() => setPage("strateji")} className="px-4 py-2 bg-stone-900 text-white rounded text-sm font-medium hover:bg-stone-800">Yol Haritasını Aç</button>
        <button onClick={() => setPage("borclarim")} className="px-4 py-2 border border-stone-300 text-stone-900 rounded text-sm font-medium hover:bg-stone-50">Borçlarımı Gör</button>
      </div>
    </div>

    <Card className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
      <Stat label="Toplam Borç" value={tl(TOTAL_DEBT)} tone="danger" />
      <Stat label="Aylık Asgari" value={tl(MONTHLY_CAPACITY)} />
      <Stat label="Ödeme Kapasitesi" value={tl(MONTHLY_CAPACITY)} />
      <Stat label="Öngörülen Bitiş" value="Eylül 2025" tone="positive" />
    </Card>

    <div>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl font-semibold text-stone-900">Aktif Borç Bakiyesi</h2>
        <button onClick={() => setPage("borclarim")} className="text-sm text-stone-600 hover:text-stone-900">Tümünü gör →</button>
      </div>
      <div className="grid gap-2">
        {DEBTS.map(d => (
          <Card key={d.id} className="p-4 flex items-center gap-4">
            <Avatar ch={d.short} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-stone-900 truncate">{d.name}</div>
              <div className="text-sm text-stone-500 truncate">{d.type} · %{d.rate.toFixed(2)} faiz{d.installments ? ` · ${d.installments} taksit` : ""}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-stone-900">{tl(d.balance)}</div>
              <Badge tone={d.statusTone}>{d.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>

    <div>
      <h2 className="text-xl font-semibold text-stone-900 mb-3">Yol Haritası</h2>
      <Card className="p-6">
        <RoadmapList compact />
        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500">Aktif Adım</div>
            <div className="font-semibold text-stone-900">Yüksek Faizli Kartı Likitle Kapat</div>
          </div>
          <button onClick={() => setPage("bakiyelerim")} className="text-sm px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-50">Bakiyelerini Gör</button>
        </div>
      </Card>
    </div>

    <Card className="p-6 bg-teal-900 text-teal-50 border-teal-900">
      <Eyebrow>
        <span className="text-teal-300">Koç Tavsiyesi</span>
      </Eyebrow>
      <p className="text-lg leading-relaxed">
        "Vadesiz hesabındaki <strong>18.500 TL</strong> ile Akdeniz kartını şimdi kapatırsan
        yıllık <strong>19.100 TL</strong> faiz yükünden kurtulursun."
      </p>
    </Card>
  </div>
);

const PageBorclarim = () => {
  const sorted = [...DEBTS].sort((a, b) => b.rate - a.rate);
  const pieData = DEBTS.map(d => ({ name: d.name, value: d.balance }));
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Tüm Borçlarım</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900">Birleştirilmiş Borç Görünümü</h1>
        <p className="text-stone-600 mt-3 max-w-2xl">
          Tüm kurumlardaki borçların burada toplandı. Faiz oranına göre sıralandı; koç en yüksek faizliyi önceliklendirmeni öneriyor.
        </p>
      </div>

      <Card className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat label="Toplam Bakiye" value={tl(TOTAL_DEBT)} />
        <Stat label="Kurum Sayısı" value="4" />
        <Stat label="Aylık Asgari" value={tl(MONTHLY_CAPACITY)} />
        <Stat label="Ortalama Faiz" value="%2.20" />
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Faize Göre Sıralandı</h2>
            <Badge tone="strong">Çığ Metodu Aktif</Badge>
          </div>
          {sorted.map((d, i) => (
            <Card key={d.id} className="p-4 flex items-center gap-4">
              <div className="text-xs font-mono text-stone-400 w-6">#{i+1}</div>
              <Avatar ch={d.short} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-900 truncate">{d.name}</div>
                <div className="text-sm text-stone-500 truncate">{d.type} · %{d.rate.toFixed(2)} faiz{d.installments ? ` · ${d.installments} taksit` : ""}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-stone-900">{tl(d.balance)}</div>
                <Badge tone={d.statusTone}>{d.status}</Badge>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-stone-900 mb-4">Borç Dağılımı</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => tl(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {pieData.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-stone-700">{p.name}</span>
                </div>
                <span className="font-medium text-stone-900">%{Math.round((p.value/TOTAL_DEBT)*100)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const PageBakiyelerim = ({ setPage }) => {
  const [filter, setFilter] = useState("all");
  const filtered = BALANCES.filter(b => filter === "all" || (filter === "liquid" ? b.liquid : !b.liquid));
  const coverage = Math.round((LIQUID / TOTAL_DEBT) * 100);
  const pieData = BALANCES.map(b => ({ name: b.name, value: b.amount }));

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Bakiyelerim</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900">Tüm Varlıkların Tek Ekranda</h1>
        <p className="text-stone-600 mt-3 max-w-2xl">
          Hesap bakiyelerin, yatırımların, döviz ve altın pozisyonların. Koç, bu varlıkları borç ödeme stratejine entegre ederek en uygun planı hazırlıyor.
        </p>
      </div>

      <Card className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat label="Toplam Varlık" value={tl(TOTAL_ASSET)} />
        <Stat label="Likit Varlık" value={tl(LIQUID)} tone="positive" />
        <Stat label="Toplam Borç" value={tl(TOTAL_DEBT)} tone="danger" />
        <Stat label="Net Pozisyon" value={tl(TOTAL_ASSET - TOTAL_DEBT)} tone={(TOTAL_ASSET-TOTAL_DEBT) > 0 ? "positive" : "danger"} />
      </Card>

      <Card className="p-6">
        <Eyebrow>Bakiye vs Borç</Eyebrow>
        <h3 className="text-xl font-semibold text-stone-900">Likit varlıkların borcunun %{coverage}'ini karşılıyor</h3>
        <p className="text-stone-600 mt-2">Kalan {tl(TOTAL_DEBT - LIQUID)} için aylık ödeme veya yapılandırma alternatifleri öneriyorum.</p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-emerald-700">Likit: {tl(LIQUID)}</span><span className="text-rose-700">Borç: {tl(TOTAL_DEBT)}</span></div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-emerald-600" style={{ width: `${(LIQUID / Math.max(TOTAL_DEBT, LIQUID)) * 100}%` }} />
            <div className="absolute inset-y-0 right-0 bg-rose-300 opacity-50" style={{ width: `${((TOTAL_DEBT-LIQUID)/Math.max(TOTAL_DEBT,LIQUID))*100}%` }} />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => setPage("strateji")} className="px-4 py-2 bg-stone-900 text-white rounded text-sm font-medium hover:bg-stone-800">Stratejiyi Gör</button>
          <button onClick={() => setPage("krediler")} className="px-4 py-2 border border-stone-300 rounded text-sm font-medium hover:bg-stone-50">Kredi Alternatifleri</button>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-stone-900">Hesap & Yatırım Detayı</h2>
          <div className="flex gap-1 text-sm bg-stone-100 p-0.5 rounded">
            {[["all","Tümü"],["liquid","Likit (≤T+2)"],["fixed","Vadeli/Bağlı"]].map(([k,l]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`px-3 py-1 rounded ${filter===k?"bg-white text-stone-900 font-medium":"text-stone-600"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          {filtered.map(b => (
            <Card key={b.id} className="p-4 flex items-start gap-4">
              <Avatar ch={b.short} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-900">{b.name}</div>
                <div className="text-sm text-stone-500">{b.kind} · {b.inst}</div>
                {b.note && <div className="text-xs text-stone-400 mt-1">{b.note}</div>}
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-stone-900">{tl(b.amount)}</div>
                <div className="text-xs text-stone-500">{b.liquidity}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-stone-900 mb-4">Varlık Dağılımı</h3>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => tl(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {pieData.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-stone-700">{p.name}</span>
                </div>
                <span className="font-medium text-stone-900">%{Math.round((p.value/TOTAL_ASSET)*100)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

const RoadmapList = ({ compact = false }) => (
  <div className="space-y-4">
    {ROADMAP.map(r => (
      <div key={r.n} className="flex gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0
          ${r.state === "done" ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
           : r.state === "active" ? "bg-stone-900 text-white"
           : "bg-stone-100 text-stone-500 border border-stone-200"}`}>
          {r.state === "done" ? "✓" : r.n}
        </div>
        <div className="flex-1 pb-2">
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-semibold text-stone-900">{r.title}</div>
            <div className="text-xs text-stone-500 shrink-0">{r.when}</div>
          </div>
          {!compact && <p className="text-sm text-stone-600 mt-1">{r.desc}</p>}
          {r.state === "active" && r.progress != null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-stone-900" style={{ width: `${r.progress}%` }} />
              </div>
              <span className="text-xs text-stone-500">%{r.progress}</span>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

const PageStrateji = () => {
  const [selected, setSelected] = useState("hybrid");
  const sel = STRATEGIES.find(s => s.id === selected);
  const monthlyDist = [
    { name: "Akdeniz Bankası", v: 5300, focus: true },
    { name: "Garanti Finans",  v: 5800 },
    { name: "Mavi Mağaza",     v: 1370 },
    { name: "PayLater",        v: 1080 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Borç Ödeme Stratejisi</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900">Bakiyene Göre 3 Alternatif Senaryo</h1>
        <p className="text-stone-600 mt-3 max-w-2xl">
          Toplam <strong className="text-stone-900">{tl(TOTAL_DEBT)}</strong> borcuna karşılık <strong className="text-stone-900">{tl(LIQUID)}</strong> likit varlığın var.
          Koç, bu kaynakları kullanmanın 3 farklı yolunu karşılaştırdı — sen seç, uygulamaya alalım.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {STRATEGIES.map(s => {
          const active = selected === s.id;
          return (
            <button key={s.id} onClick={() => setSelected(s.id)}
              className={`text-left p-5 rounded-lg border transition relative
                ${active ? "border-stone-900 bg-white shadow-sm" : "border-stone-200 bg-white hover:border-stone-400"}`}>
              {s.recommended && <div className="absolute -top-2 left-4"><Badge tone="strong">Koç Önerisi</Badge></div>}
              <div className="font-semibold text-stone-900">{s.name}</div>
              <p className="text-sm text-stone-600 mt-2 min-h-[40px]">{s.desc}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-stone-100">
                <div>
                  <div className="text-xs text-stone-500">Süre</div>
                  <div className="font-semibold text-stone-900">{s.months} ay</div>
                </div>
                <div>
                  <div className="text-xs text-stone-500">Faiz Maliyeti</div>
                  <div className="font-semibold text-stone-900">{tl(s.interestCost)}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card className="p-6">
        <div className="flex items-baseline gap-3">
          <Badge tone="strong">Seçili Plan</Badge>
          <h2 className="text-2xl font-semibold text-stone-900">{sel.name}</h2>
        </div>
        <p className="text-stone-600 mt-2">{sel.desc}</p>
        {sel.recommended && <p className="text-sm text-emerald-700 mt-1">Önerilen — uygula</p>}

        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-stone-100">
          <Stat label="Likitlenecek" value="40.800 TL" />
          <Stat label="Aylık ödeme" value={tl(MONTHLY_CAPACITY)} />
          <Stat label="Net faiz tasarrufu" value="26.800 TL" tone="positive" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="font-semibold text-stone-900 mb-2">Avantajlar</h4>
            <ul className="space-y-1.5 text-sm text-stone-700">
              <li className="flex gap-2"><span className="text-emerald-600">✓</span>En hızlı borçsuzluk</li>
              <li className="flex gap-2"><span className="text-emerald-600">✓</span>Düşük getirili varlıklar değerlendiriliyor</li>
              <li className="flex gap-2"><span className="text-emerald-600">✓</span>Faiz maliyeti minimum</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 mb-2">Dikkat</h4>
            <ul className="space-y-1.5 text-sm text-stone-700">
              <li className="flex gap-2"><span className="text-amber-600">!</span>Acil tampon 18.500 TL'ye iner</li>
              <li className="flex gap-2"><span className="text-amber-600">!</span>Vadeli mevduat faizi kaybı ~1.800 TL</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-stone-900">Borç Erime Projeksiyonu</h3>
        <p className="text-stone-600 text-sm mt-1">Seçili stratejiyle 12 aylık öngörü</p>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PROJECTION} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="m" stroke="#78716c" fontSize={12} />
              <YAxis stroke="#78716c" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip formatter={(v) => tl(v)} />
              <Line type="monotone" dataKey="v" stroke="#1f3a3d" strokeWidth={2.5} dot={{ r: 3, fill: "#1f3a3d" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-stone-900 mb-5">Adım Adım Plan</h3>
        <RoadmapList />
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-stone-900 mb-1">Bu Ayki Dağılım</h3>
        <p className="text-sm text-stone-500 mb-4">Toplam {tl(MONTHLY_CAPACITY)}</p>
        <div className="space-y-3">
          {monthlyDist.map(m => (
            <div key={m.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-700 flex items-center gap-2">
                  {m.name}
                  {m.focus && <Badge tone="strong">Koç odak borç</Badge>}
                </span>
                <span className="font-semibold text-stone-900">{tl(m.v)}</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full ${m.focus ? "bg-teal-900" : "bg-stone-400"}`} style={{ width: `${(m.v/MONTHLY_CAPACITY)*100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-amber-50 border-amber-200">
        <Eyebrow><span className="text-amber-800">Faiz Avantajı</span></Eyebrow>
        <p className="text-lg text-stone-900 leading-relaxed">
          "Vadesiz hesabındaki <strong>18.500 TL</strong> ile Akdeniz kartını şimdi kapatırsan
          yıllık <strong>19.100 TL</strong> faiz yükünden kurtulursun."
        </p>
      </Card>
    </div>
  );
};

const PageKrediler = ({ setPage }) => {
  const need = TOTAL_DEBT - LIQUID;
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Yapılandırma Alternatifleri</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900">Bakiyenin Yetmediği Yerde Uygun Krediler</h1>
        <p className="text-stone-600 mt-3 max-w-2xl">
          Likit varlığın ({tl(LIQUID)}) toplam borcunu karşılamıyor. Aradaki <strong className="text-stone-900">{tl(need)}</strong> için
          karşılaştırılmış kredi tekliflerini aşağıda görebilirsin. Tüm rakamlar örnek niteliğindedir.
        </p>
      </div>

      <Card className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat label="Toplam Borç" value={tl(TOTAL_DEBT)} />
        <Stat label="Likit Karşılık" value={tl(LIQUID)} tone="positive" />
        <Stat label="İhtiyaç Duyulan" value={tl(need)} tone="danger" />
        <Stat label="Önerilen Vade" value="24 ay" />
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-stone-900 mb-3">Karşılaştırılmış Teklifler</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          {LOANS.map(l => (
            <Card key={l.id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar ch={l.short} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold text-stone-900">{l.inst}</div>
                    {l.tag && <Badge tone={l.tagTone}>{l.tag}</Badge>}
                    {l.badge && <Badge tone="positive">{l.badge}</Badge>}
                  </div>
                  <div className="text-sm text-stone-500">{l.product}</div>
                  <div className="text-xs text-stone-400 mt-0.5">Onay olasılığı {l.approval}</div>
                </div>
              </div>

              <ul className="mt-4 space-y-1 text-sm text-stone-700">
                {l.perks.map(p => <li key={p} className="flex gap-2"><span className="text-emerald-600">•</span>{p}</li>)}
              </ul>

              <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-100">
                <div><div className="text-xs text-stone-500">Aylık Faiz</div><div className="font-semibold text-stone-900">%{l.rate.toFixed(2)}</div></div>
                <div><div className="text-xs text-stone-500">Vade</div><div className="font-semibold text-stone-900">{l.term} ay</div></div>
                <div><div className="text-xs text-stone-500">Aylık Taksit</div><div className="font-semibold text-stone-900">{tl(l.monthly)}</div></div>
                <div><div className="text-xs text-stone-500">Toplam Maliyet</div><div className="font-semibold text-stone-900">{tl(l.total)}</div></div>
              </div>

              <div className="text-xs text-stone-500 mt-3">
                Toplam faiz yükü: <strong className="text-stone-700">{tl(l.interest)}</strong> ·
                Maks. kullanım: <strong className="text-stone-700">{tl(l.max)}</strong>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 border border-stone-300 rounded text-sm hover:bg-stone-50">Detay</button>
                <button className="flex-1 px-3 py-2 bg-stone-900 text-white rounded text-sm hover:bg-stone-800">Başvuruyu Başlat</button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold text-stone-900">Krediye girmek istemiyor musun?</h3>
        <p className="text-stone-600 mt-1">Bakiyelerinden farklı bir kombinasyonla likit yaratıp stratejini güncelleyebilirsin.</p>
        <button onClick={() => setPage("bakiyelerim")} className="mt-3 px-4 py-2 border border-stone-300 rounded text-sm font-medium hover:bg-stone-50">Bakiyelerimi Gör</button>
      </Card>
    </div>
  );
};

// ───────────────────────── APP ─────────────────────────
export default function App() {
  const [page, setPage] = useState("ozet");
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
      <TopNav page={page} setPage={setPage} />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {page === "ozet"        && <PageOzet setPage={setPage} />}
        {page === "borclarim"   && <PageBorclarim />}
        {page === "bakiyelerim" && <PageBakiyelerim setPage={setPage} />}
        {page === "strateji"    && <PageStrateji />}
        {page === "krediler"    && <PageKrediler setPage={setPage} />}
      </main>
      <footer className="max-w-6xl mx-auto px-6 py-8 text-xs text-stone-400 border-t border-stone-200 mt-12">
        KAPAT — Dijital Borç Koçun · Tüm veriler örnek niteliğindedir
      </footer>
    </div>
  );
}
