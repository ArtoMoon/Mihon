# 🎵 Spo - Ultra Hafif Müzik İstemcisi (Lightweight Client)

Spotify'a alternatif, **API anahtarına veya kayıt olmaya ihtiyaç duymayan**, ultra düşük bellek (RAM) tüketen, modern ve hızlı masaüstü müzik istemcisi.

Electron / Chromium tabanlı hantal istemcilerin aksine (genelde 400MB - 1GB RAM harcarlar), **Spo** hafif Python mimarisi (`CustomTkinter` + `ytmusicapi` + Windows Media Engine) sayesinde yalnızca ~**40-60 MB RAM** kullanarak anında çalışır.

---

## 🚀 Özellikler

- 🟢 **Sıfır API Anahtarı & Ücretsiz:** Spotify Developer hesabı veya Client ID/Secret gerekmez! Milyonlarca şarkıya anında erişim.
- 🟢 **Ultra Düşük RAM Kullanımı:** Electron yerine hafif GUI kütüphaneleri (~45MB RAM).
- 🎨 **Modern Minimalist Koyu Tema:** Spotify estetiğine uygun neon yeşil vurgular, yuvarlatılmış köşeler ve pürüzsüz kartlar.
- 🔍 **Geniş Müzik Kataloğu:** Şarkı, sanatçı, albüm ve popüler çalma listeleri.
- ⚡ **Doğrudan Ses Akışı:** Parçalar indirme beklemeden doğrudan Windows Media motoru ile akış olarak çalınır.
- 🎛️ **Gelişmiş Oynatıcı Kontrolleri:** Oynat/Duraklat (Boşluk tuşu desteği), İleri/Geri, İlerleme Çubuğu, Gerçek Zamanlı Süre Sayacı ve Ses Ayarı.

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

### 2. Uygulamayı Başlatın

Hiçbir ayar veya API anahtarı girmeden doğrudan çalıştırabilirsiniz:

```bash
python main.py
```

---

## 📂 Proje Yapısı

```
spo/
├── requirements.txt      # Gerekli bağımlılıklar (customtkinter, ytmusicapi, yt-dlp, comtypes)
├── main.py               # Uygulama başlangıç noktası
├── README.md             # Proje dokümantasyonu
└── src/
    ├── config.py         # Uygulama ayar yöneticisi
    ├── services/
    │   ├── spotify_api.py   # API-Free YouTube Music meta veri arama servisi
    │   └── audio_player.py  # Doğrudan ses akışı motoru (Windows Media Engine)
    └── ui/
        ├── theme.py         # Modern koyu tema renk paleti ve fontlar
        ├── sidebar.py       # Sol çalma listesi & navigasyon paneli
        ├── search_view.py   # Arama çubuğu ve şarkı tablosu
        ├── player_bar.py    # Alt minimalist oynatıcı çubuğu
        └── app.py           # Ana pencere ve olay yöneticisi
1```
