# 🎵 Spo — Rust & Tauri v2 Masaüstü Müzik İstemcisi

Spotify arayüz estetiğinde, **API anahtarı gerektirmeyen**, Rust + Tauri v2 + Vanilla modern web teknolojileri ile geliştirilmiş ultra hafif masaüstü müzik istemcisi.

---

## ⚡ Neden Tauri + Rust?

- **Hafif Bellek Kullanımı:** Electron istemcileri 400 MB – 1 GB RAM tüketirken, Tauri v2 yerel WebView2 ve Rust arka ucu sayesinde yalnızca **~47 MB RAM** kullanır.
- **Sıfır API Anahtarı:** YouTube Music web uç noktası doğrudan Rust üzerinden sorgulanır. Herhangi bir Spotify Developer hesabı veya anahtara gerek yoktur.
- **Akıllı Önbellek & Anında Çalma:** Parçalar `yt-dlp` ile arka planda güvenle indirilir ve diske kaydedilir. Bir kez dinlediğiniz parça sonraki sefer **0 saniye gecikmeyle (36 µs)** anında çalar.
- **Klavye ve Medya Tuşları Desteği:** Boşluk ile Oynat/Duraklat, `/` ile Arama, `Ctrl + Sol/Sağ` ile parça geçişi ve Windows klavye medya tuşları entegrasyonu.

---

## 🚀 Çalıştırma

Geliştirme modunda çalıştırmak için `spo-tauri` klasörüne girip şu komutu vermeniz yeterlidir:

```powershell
cd e:\spo\spo-tauri
npm run tauri dev
```

Üretim (Release) derlemesi oluşturmak için:

```powershell
cd e:\spo\spo-tauri
npm run tauri build
```

---

## 📂 Proje Mimarisi

```
spo-tauri/
├── src-tauri/
│   ├── Cargo.toml            # Rust bağımlılıkları (tauri v2, reqwest, tokio)
│   ├── tauri.conf.json       # Pencere boyutları, CSP ve asset protokolü
│   ├── capabilities/         # Tauri v2 izin matrisi
│   └── src/
│       ├── lib.rs            # Tauri invoke komutları (search, prepare_track, cache)
│       ├── music.rs          # YouTube Music arama servisi (API anahtarsız)
│       └── audio.rs          # yt-dlp indirme ve disk önbellek yöneticisi
└── src/
    ├── index.html            # Modern Spotify tarzı arayüz iskeleti
    ├── styles.css            # Koyu cam teması (Glassmorphism), ekolayzır ve akıcı animasyonlar
    └── main.js               # Oynatıcı mantığı, kuyruk, beğeni, geçmiş ve klavye kontrolleri
```
