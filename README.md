# KAPAT — Dijital Borç Koçun

Tek dosyada React + Vite uygulaması. Lovable prototipinin yeniden yazımı.

## Lokal çalıştırma

```bash
npm install
npm run dev
```

## Vercel'e deploy (en kolay yol)

1. Bu klasörü bir GitHub repo'ya at (veya Vercel CLI ile direkt yükle):
   ```bash
   npm i -g vercel
   vercel
   ```
2. Sorulara default cevap ver. `vercel.json` zaten SPA fallback'i ayarlıyor → 404 sorunu yok.
3. Verdiği `.vercel.app` URL'i paylaşılabilir.

## Netlify'a deploy

1. netlify.com → "Add new site" → "Deploy manually"
2. `npm run build` çalıştır, oluşan `dist/` klasörünü drag & drop.
3. `public/_redirects` SPA fallback'i hallediyor.

## Yapı

```
src/
  App.jsx     ← tüm sayfalar + dummy data tek dosyada
  main.jsx    ← React entrypoint
  index.css   ← Tailwind
```

Tüm dummy data `App.jsx` başında — değiştirmek istersen `DEBTS`, `BALANCES`, `LOANS`, `STRATEGIES` array'lerini düzenle.
