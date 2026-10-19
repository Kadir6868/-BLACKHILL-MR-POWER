# BLACKHILL · MR. POWER V2 FREE

Ücretsiz kullanım kotalarına uygun, çok dilli yapay zekâ sohbeti, tarayıcı TTS/mikrofon, D1 araştırma cu arşivi ve Cloudflare Worker API.

## Kurulum

1. Bu dosyaları GitHub deponuza yükleyin (ZIP'i önce açın).
2. Cloudflare hesabı açın ve Workers & Pages bölümünü kullanın. GitHub deponuzu bağlayın veya Wrangler ile deploy edin.
3. Node.js kurulu bir ortamda `npm install` çalıştırın.
4. `npx wrangler login` ve `npx wrangler d1 create mr-power-archive` komutlarını çalıştırın. Çıkan `database_id` değerini `wrangler.jsonc` dosyasına yazın.
5. `npm run db:init:remote` ile D1 şemasını kurun.
6. Groq Console'dan bir API anahtarı oluşturun. `npx wrangler secret put GROQ_API_KEY` ile ekleyin. Anahtarı GitHub'a **yüklemeyin**.
7. Uzun, rastgele bir yönetici anahtarı üretin ve `npx wrangler secret put ADMIN_TOKEN` ile ekleyin. Bu anahtar bir başlangıç yönetici korumasıdır; üretimde Cloudflare Access ile `/admin.html` ve `/api/admin/*` yollarına ek erişim kontrolü önerilir.
8. `npm run deploy` komutunu çalıştırın. Workers URL'sinde sohbeti test edin.
9. Farklı bir web sitesinden erişim için `ALLOWED_ORIGIN` içine o sitenin tam origin adresini girin; widget'taki `fetch('/api/chat')` yolunu Worker'ın tam HTTPS adresine çevirin. Aynı origin dağıtımında buna gerek yoktur.

## Güvenlik ve sınırlar

- Varsayılan rate limit: IP başına dakikada 6 istek (D1 üzerinden basit kontrol; yüksek eşzamanlılıkta atomik değildir).
- Groq ücretsiz API limitleri değişebilir. 7/24 erişilebilirlik veya sınırsız yanıt garantisi yoktur.
- Tarayıcı ses sentezi ve konuşma tanıma özellikleri cihaz ve izinlere bağlıdır. Tok erkek sesi garanti edilemez.
- Bu sürüm PDF dosyası yüklemez: PDF'den çıkarılmış metin `/admin.html` üzerinden arşive eklenir.
- Araştırma belgeleri otomatik olarak dahil değildir; arşive gerçek içerikleri yüklemeniz gerekir.
- Yönetici token'ı tek paylaşılan sırdır, tam kullanıcı/rol sistemi değildir. Kamuya açık dağıtım öncesi Cloudflare Access ekleyin.
- `ALLOWED_ORIGIN` tarayıcı CORS kontrolüdür, tek başına kimlik doğrulama değildir.
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BLACKHILL — Mr. Power AI</title>
    <style>
        :root {
            --bg-color: #0d0d0f;
            --card-bg: #16161a;
            --border-color: #27272a;
            --accent-color: #e5a93b;
            --text-main: #f4f4f5;
            --text-muted: #a1a1aa;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
        }

        .hero-container {
            text-align: center;
            max-width: 600px;
            padding: 20px;
        }

        .hero-container h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #fff;
        }

        .hero-container h1 span {
            color: var(--accent-color);
        }

        .hero-container p {
            color: var(--text-muted);
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .btn-portal {
            background-color: var(--accent-color);
            color: #0d0d0f;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: opacity 0.2s;
            display: inline-block;
        }

        .btn-portal:hover {
            opacity: 0.9;
        }

        footer {
            position: absolute;
            bottom: 20px;
            font-size: 0.85rem;
            color: var(--text-muted);
            text-align: center;
        }

        footer a {
            color: var(--accent-color);
            text-decoration: none;
        }
    </style>
</head>
<body>

    <div class="hero-container">
        <p style="letter-spacing: 2px; font-size: 0.9rem; color: var(--accent-color);">BLACKHILL · ART · SCIENCE · FREEDOM</p>
        <h1>Mr. <span>Power</span> AI</h1>
        <p>Kadir Karatepe’nin bağımsız araştırma arşivi, KKF modelleri ve teknoloji konseptleri için geliştirilmiş çok dilli yapay zekâ asistanı.</p>
        <a href="https://kadir-karatepe-blackhill.blackhill.chatgpt.site" class="btn-portal" target="_blank">Ana Portföye Dön ↗</a>
    </div>

    <footer>
        KADİR KARATEPE © 2026 · Wiener Neustadt · Austria<br>
        <a href="admin.html">Yönetici Paneli</a>
    </footer>

    <!-- Mr. Power Widget Script Entegrasyonu -->
    <script src="widget.js"></script>
</body>
</html>
