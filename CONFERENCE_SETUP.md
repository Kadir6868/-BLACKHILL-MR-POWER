# BLACKHILL AI CONFERENCE — Cloudflare kurulumu

Arayüz: `/conference`
API: `POST /api/conference`
Sağlık kontrolü: `GET /api/health`

## 1. Cloudflare Worker secrets

Cloudflare Dashboard → Workers & Pages → blackhill-mr-power → Settings → Variables and Secrets bölümünden şu değerleri **Secret** olarak ekleyin:

- `OPENAI_API_KEY` — GPT bağlantısı
- `GEMINI_API_KEY` — Gemini bağlantısı
- `ANTHROPIC_API_KEY` — Claude bağlantısı
- `DEEPSEEK_API_KEY` — DeepSeek bağlantısı
- `XAI_API_KEY` — Grok bağlantısı
- `GROQ_API_KEY` — Llama ve Mr. Power sentezi

İsteğe bağlı model adı değişkenleri: `GPT_MODEL`, `GEMINI_MODEL`, `CLAUDE_MODEL`, `DEEPSEEK_MODEL`, `GROK_MODEL`, `LLAMA_MODEL`. Varsayılan model adları Worker kodunda tanımlıdır. Sağlayıcıların hesap ve model erişimleri ayrıca etkin olmalıdır.

Anahtarları HTML/JavaScript'e, GitHub'a veya herkese açık dosyalara koymayın. Anahtar olmadan ilgili sağlayıcı arayüzde görünse de cevap vermez.

## 2. Dağıtım

GitHub deposu Cloudflare ile otomatik dağıtıma bağlıysa commit sonrası deployment durumunu kontrol edin. Bağlı değilse yerel bir Node.js ortamında:
```bash
npm install
npx wrangler deploy
```

## 3. Test

Tarayıcıda Worker alan adınızın `/api/health` yolunu açın. Ardından `/conference` sayfasına gidip yalnızca API anahtarı eklediğiniz modelleri seçerek kısa bir test hedefi gönderin.

Örnek API isteği:
```bash
curl -X POST https://YOUR-WORKER.workers.dev/api/conference \
  -H "Content-Type: application/json" \
  -d '{"objective":"BLACKHILL POWER MODEL için test mimarisi öner","participants":["gpt","gemini","claude","deepseek","grok","llama"],"rounds":2}'
```

## 4. Davranış ve maliyet

Her turda seçilen modeller paralel çağrılır; sonraki turlar önceki cevapları görür. En fazla 3 tur desteklenir. Son sentez Groq/Llama ile üretilir ve bunun için `GROQ_API_KEY` gereklidir. Her model çağrısı sağlayıcının ücretlendirmesine ve kota sınırına tabidir. İlk testte tek model ve 1 tur seçerek başlayın.

## 5. Güvenlik notu

Endpoint şu an kimlik doğrulama/abonelik sınırı olmadan erişilebilir ise herkese açık kullanıcılar API harcaması oluşturabilir. Kamuya açmadan önce Cloudflare Access veya uygulama oturumu, rate limit ve kullanım kotası ekleyin. `ALLOWED_ORIGIN` CORS içindir; tek başına API kimlik doğrulaması değildir.
