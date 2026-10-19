# BLACKHILL · MR. POWER V2 FREE

Ücretsiz kullanım kotalarına uygun, çok dilli yapay zekâ sohbeti, tarayıcı TTS/mikrofon, D1 araştırma arşivi ve Cloudflare Worker API.

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
