const messages = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('message');

function addMessage(role, text) {
  const el = document.createElement('div');
  el.className = 'msg ' + role;
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = (input.value || '').trim();
  if (!text) return;

  addMessage('user', text);
  input.value = '';
  addMessage('assistant', 'Düşünüyor...');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: [] })
    });

    const data = await res.json();
    const last = messages.lastElementChild;
    if (last) {
      last.textContent = data?.reply || data?.error || 'Yanıt alınamadı.';
    }
  } catch (err) {
    const last = messages.lastElementChild;
    if (last) {
      last.textContent = 'Bağlantı hatası. Lütfen tekrar deneyin.';
    }
  }
});

if (!messages || !form || !input) {
  console.warn('Mr. Power widget could not find chat elements.');
}

