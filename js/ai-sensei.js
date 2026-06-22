/**
 * AI Sensei — Full AI-powered Japanese learning companion
 * Tabs: Chat | Voice | Career Coach
 * Powered by Google Gemini API (gemini-1.5-flash)
 *
 * Usage: <script src="js/ai-sensei.js" defer></script>
 * Requires: GEMINI_API_KEY set in window.AISENSEI_KEY or via the UI prompt
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────── */
  const GEMINI_MODEL = 'gemini-1.5-flash';
  const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  // System context injected into every request
  const SYSTEM_PROMPT = `You are AI Sensei, an expert Japanese language tutor and career advisor built into the NihongoZen learning platform.

Your personality:
- Warm, encouraging, patient, and precise
- You celebrate progress and gently correct mistakes
- You mix Japanese examples naturally into explanations
- You respond in the SAME LANGUAGE the user writes in (English, Japanese, Hindi, Urdu, etc.)

For language questions:
- Explain grammar patterns clearly with examples
- Show kanji with furigana when helpful: 食べる (たべる)
- Provide JLPT level context when relevant
- Include natural usage notes and common mistakes
- Format Japanese text clearly, separate from English

For career questions:
- Give practical, actionable advice about working or studying in Japan
- Cover JLPT requirements, visa types, job-hunting (就活), internships
- Suggest realistic timelines and milestones

Keep responses concise but complete. Use markdown-style formatting for lists. Always be encouraging.`;

  const CAREER_SYSTEM = `You are AI Sensei Career Coach — an expert advisor on Japanese language careers, study abroad, JLPT preparation, working in Japan, and resume building.

Respond in the user's language. Be practical, specific, and motivating. Include:
- Concrete steps with timeframes
- JLPT level requirements where relevant
- Resources and next actions
- Encouragement

Keep responses under 300 words unless a full roadmap is requested.`;

  /* ─────────────────────────────────────────
     STATE
  ───────────────────────────────────────── */
  let apiKey      = window.AISENSEI_KEY || localStorage.getItem('as_gemini_key') || '';
  let isOpen      = false;
  let activeTab   = 'chat';
  let chatHistory = [];   // [{role, parts}]
  let isLoading   = false;

  // Voice
  let recognition  = null;
  let synthesis    = window.speechSynthesis;
  let voiceState   = 'idle'; // idle | listening | thinking | speaking
  let voiceTranscript = '';

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function fmt(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderMarkdown(text) {
    // Very light markdown: **bold**, *italic*, `code`, bullet lists, line breaks
    return escHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>(\n|$))+/g, '<ul style="padding-left:16px;margin:6px 0">$&</ul>')
      .replace(/\n/g, '<br>');
  }

  async function callGemini(messages, systemText) {
    if (!apiKey) {
      apiKey = prompt('Enter your Gemini API key (Google AI Studio):') || '';
      if (!apiKey) throw new Error('No API key provided');
      localStorage.setItem('as_gemini_key', apiKey);
      window.AISENSEI_KEY = apiKey;
    }

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const body = {
      system_instruction: { parts: [{ text: systemText || SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 800,
        topP: 0.95
      }
    };

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '(No response)';
  }

  /* ─────────────────────────────────────────
     BUILD HTML
  ───────────────────────────────────────── */
  function buildHTML() {
    const html = `
<!-- ═══════════ AI SENSEI TRIGGER ═══════════ -->
<button id="as-trigger" title="Open AI Sensei" aria-label="Open AI Sensei">
  <span class="as-trigger-icon as-icon-closed">先</span>
  <span class="as-trigger-icon as-icon-open">✕</span>
  <span class="as-badge hidden" id="as-notif-badge">1</span>
</button>

<!-- ═══════════ AI SENSEI PANEL ═══════════ -->
<div id="as-panel" class="as-hidden" role="dialog" aria-label="AI Sensei">

  <!-- Header -->
  <div class="as-header">
    <div class="as-avatar">先</div>
    <div class="as-header-info">
      <div class="as-header-name">AI Sensei</div>
      <div class="as-header-status">
        <span class="as-status-dot"></span>
        <span id="as-status-text">Ready to help</span>
      </div>
    </div>
    <div class="as-header-actions">
      <button class="as-hbtn" id="as-clear-btn" title="Clear chat">🗑</button>
      <button class="as-hbtn" id="as-key-btn" title="Set API key">🔑</button>
    </div>
  </div>

  <!-- Tab bar -->
  <div class="as-tabs" role="tablist">
    <button class="as-tab active" data-tab="chat" role="tab">
      <span class="as-tab-icon">💬</span>Chat
    </button>
    <button class="as-tab" data-tab="voice" role="tab">
      <span class="as-tab-icon">🎙</span>Voice
    </button>
    <button class="as-tab" data-tab="career" role="tab">
      <span class="as-tab-icon">🚀</span>Career
    </button>
  </div>

  <!-- Panel body -->
  <div class="as-panel-body">

    <!-- ── CHAT VIEW ── -->
    <div class="as-view active" id="as-view-chat">
      <div class="as-messages" id="as-messages"></div>

      <!-- Quick prompt chips -->
      <div class="as-quick-prompts" id="as-quick-prompts">
        <button class="as-quick-btn" data-q="Explain て-form for me">て-form</button>
        <button class="as-quick-btn" data-q="How do I use は vs が?">は vs が</button>
        <button class="as-quick-btn" data-q="Give me 5 N5 vocab words with examples">N5 Vocab</button>
        <button class="as-quick-btn" data-q="Translate: I want to go to Japan">Translate</button>
        <button class="as-quick-btn" data-q="What are the most common JLPT N3 grammar patterns?">N3 Grammar</button>
        <button class="as-quick-btn" data-q="Teach me keigo (polite Japanese)">Keigo</button>
      </div>

      <!-- Input bar -->
      <div class="as-input-bar">
        <button class="as-mic-btn" id="as-mic-btn" title="Voice input">🎙</button>
        <textarea
          class="as-textarea"
          id="as-chat-input"
          placeholder="Ask anything in any language…"
          rows="1"
        ></textarea>
        <button class="as-send-btn" id="as-send-btn" title="Send">➤</button>
      </div>
    </div>

    <!-- ── VOICE VIEW ── -->
    <div class="as-view" id="as-view-voice" style="overflow-y:auto;">
      <div class="as-voice-view">
        <div class="as-orb-wrap">
          <div class="as-orb-ring"></div>
          <div class="as-orb-ring"></div>
          <div class="as-orb" id="as-voice-orb">先</div>
        </div>

        <div>
          <div class="as-voice-status" id="as-voice-status">Tap the orb to start</div>
          <div class="as-voice-hint" id="as-voice-hint">Speak naturally — AI Sensei will respond</div>
        </div>

        <div class="as-equalizer" id="as-equalizer">
          <div class="as-eq-bar"></div>
          <div class="as-eq-bar"></div>
          <div class="as-eq-bar"></div>
          <div class="as-eq-bar"></div>
          <div class="as-eq-bar"></div>
        </div>

        <div class="as-voice-transcript" id="as-voice-transcript">
          Your speech will appear here…
        </div>

        <div class="as-voice-controls">
          <div class="as-voice-btn" id="as-voice-lang-btn">
            <div class="as-voice-btn-icon">🌐</div>
            <div class="as-voice-btn-label">Language</div>
          </div>
          <div class="as-voice-btn primary" id="as-voice-main-btn">
            <div class="as-voice-btn-icon" id="as-voice-main-icon">🎙</div>
            <div class="as-voice-btn-label" id="as-voice-main-label">Start</div>
          </div>
          <div class="as-voice-btn" id="as-voice-stop-btn">
            <div class="as-voice-btn-icon">⏹</div>
            <div class="as-voice-btn-label">Stop</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── CAREER COACH VIEW ── -->
    <div class="as-view" id="as-view-career" style="overflow:hidden;flex-direction:column;">
      <div class="as-career-view" id="as-career-scroll">

        <div class="as-career-hero">
          <div class="as-career-hero-icon">🎯</div>
          <div class="as-career-hero-title">AI Career Coach</div>
          <div class="as-career-hero-desc">Get a personalized roadmap for working in Japan, JLPT success, study abroad, and more.</div>
        </div>

        <div class="as-career-grid">
          <div class="as-career-card" data-career="How do I get a job in Japan as a foreigner? What JLPT level do I need?">
            <div class="as-career-card-icon">🇯🇵</div>
            <div class="as-career-card-title">Work in Japan</div>
            <div class="as-career-card-desc">Jobs, visas & requirements</div>
          </div>
          <div class="as-career-card" data-career="What are the best universities and programs to study Japanese in Japan? How do I apply?">
            <div class="as-career-card-icon">🎓</div>
            <div class="as-career-card-title">Study Abroad</div>
            <div class="as-career-card-desc">Universities & scholarships</div>
          </div>
          <div class="as-career-card" data-career="Create a 6-month JLPT N2 study roadmap for me with weekly goals and resources.">
            <div class="as-career-card-icon">📋</div>
            <div class="as-career-card-title">JLPT Roadmap</div>
            <div class="as-career-card-desc">Personalized study plan</div>
          </div>
          <div class="as-career-card" data-career="Help me write a Japanese-style resume (履歴書) for a tech job in Japan. What should I include?">
            <div class="as-career-card-icon">📝</div>
            <div class="as-career-card-title">Resume Builder</div>
            <div class="as-career-card-desc">Japanese 履歴書 tips</div>
          </div>
          <div class="as-career-card" data-career="What tech skills should I learn alongside Japanese to get a software job in Japan?">
            <div class="as-career-card-icon">💻</div>
            <div class="as-career-card-title">Tech + Japanese</div>
            <div class="as-career-card-desc">Skills to combine</div>
          </div>
          <div class="as-career-card" data-career="How do I prepare for a Japanese job interview? What common questions are asked and how should I answer?">
            <div class="as-career-card-icon">🤝</div>
            <div class="as-career-card-title">Interview Prep</div>
            <div class="as-career-card-desc">面接 tips & phrases</div>
          </div>
        </div>

        <div class="as-career-roadmap" id="as-career-roadmap-box" style="display:none;">
          <div class="as-career-roadmap-title">🗺 Your Personalized Roadmap</div>
          <div id="as-career-roadmap-content"></div>
        </div>

        <div class="as-career-response" id="as-career-response"></div>

      </div>

      <div class="as-career-input-area">
        <div class="as-career-input-label">Ask your career question in any language:</div>
        <div class="as-career-input-row">
          <input
            type="text"
            class="as-career-input"
            id="as-career-input"
            placeholder="e.g. How do I work in Japan as a developer?"
          />
          <button class="as-career-ask-btn" id="as-career-ask-btn">Ask</button>
        </div>
      </div>
    </div>

  </div>
</div>
`;
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
  }

  /* ─────────────────────────────────────────
     PANEL TOGGLE & DRAG
  ───────────────────────────────────────── */
  function togglePanel() {
    isOpen = !isOpen;
    const panel   = document.getElementById('as-panel');
    const trigger = document.getElementById('as-trigger');
    const badge   = document.getElementById('as-notif-badge');

    if (isOpen) {
      panel.classList.remove('as-hidden');
      trigger.classList.add('as-open');
      badge.classList.add('hidden');
      if (chatHistory.length === 0) addWelcomeMessage();
    } else {
      panel.classList.add('as-hidden');
      trigger.classList.remove('as-open');
    }
  }

  function setupDrag() {
    const trigger = document.getElementById('as-trigger');
    let dragging = false, startX, startY, origLeft, origBottom;

    function onMove(e) {
      if (!dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const newRight  = Math.max(8, Math.min(window.innerWidth  - 70, window.innerWidth  - origLeft - 62 - dx));
      const newBottom = Math.max(8, Math.min(window.innerHeight - 70, origBottom - dy));
      trigger.style.right  = newRight  + 'px';
      trigger.style.bottom = newBottom + 'px';
      syncPanelPos();
    }

    function onUp() {
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  onUp);
    }

    trigger.addEventListener('mousedown', function (e) {
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = trigger.getBoundingClientRect();
      origLeft   = rect.left;
      origBottom = window.innerHeight - rect.bottom;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
      e.preventDefault();
    });
    trigger.addEventListener('touchstart', function (e) {
      dragging = true;
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
      const rect = trigger.getBoundingClientRect();
      origLeft   = rect.left;
      origBottom = window.innerHeight - rect.bottom;
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend',  onUp);
    });
  }

  function syncPanelPos() {
    const trigger = document.getElementById('as-trigger');
    const panel   = document.getElementById('as-panel');
    const right   = parseInt(trigger.style.right)  || 28;
    const bottom  = parseInt(trigger.style.bottom) || 28;
    panel.style.right  = right + 'px';
    panel.style.bottom = (bottom + 70) + 'px';
  }

  /* ─────────────────────────────────────────
     TABS
  ───────────────────────────────────────── */
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.as-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.querySelectorAll('.as-view').forEach(v => {
      v.classList.toggle('active', v.id === 'as-view-' + tab);
    });
  }

  /* ─────────────────────────────────────────
     CHAT
  ───────────────────────────────────────── */
  function addWelcomeMessage() {
    const msgs = document.getElementById('as-messages');
    const welcome = `こんにちは！ 👋 I'm **AI Sensei**, your personal Japanese learning companion.

I can help you with:
- Grammar explanations (N5–N1)
- Vocabulary & kanji
- Translation in any language
- Conversation practice
- JLPT preparation

What would you like to learn today?`;
    appendMessage('ai', welcome);
    chatHistory = [];
  }

  function appendMessage(role, text) {
    const msgs = document.getElementById('as-messages');
    if (!msgs) return;

    const wrap = document.createElement('div');
    wrap.className = 'as-msg ' + role;

    const avatar = document.createElement('div');
    avatar.className = 'as-msg-avatar';
    avatar.textContent = role === 'ai' ? '先' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'as-msg-bubble';
    bubble.innerHTML = renderMarkdown(text);

    const time = document.createElement('div');
    time.className = 'as-msg-time';
    time.textContent = fmt(new Date());

    const col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;max-width:78%';
    col.appendChild(bubble);
    col.appendChild(time);

    if (role === 'ai') {
      wrap.appendChild(avatar);
      wrap.appendChild(col);
    } else {
      wrap.appendChild(col);
      wrap.appendChild(avatar);
    }

    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;

    // Hide quick prompts after first user message
    if (role === 'user') {
      const qp = document.getElementById('as-quick-prompts');
      if (qp) qp.style.display = 'none';
    }
  }

  function showTyping() {
    const msgs = document.getElementById('as-messages');
    if (!msgs) return null;
    const wrap = document.createElement('div');
    wrap.className = 'as-msg ai';
    wrap.id = 'as-typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'as-msg-avatar';
    avatar.textContent = '先';

    const typing = document.createElement('div');
    typing.className = 'as-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';

    wrap.appendChild(avatar);
    wrap.appendChild(typing);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return wrap;
  }

  function removeTyping() {
    const el = document.getElementById('as-typing-indicator');
    if (el) el.remove();
  }

  async function sendChat(text) {
    if (isLoading || !text.trim()) return;
    isLoading = true;

    const input = document.getElementById('as-chat-input');
    const sendBtn = document.getElementById('as-send-btn');
    if (input) { input.value = ''; input.style.height = 'auto'; }
    if (sendBtn) sendBtn.disabled = true;

    setStatus('Thinking…');
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });

    const typing = showTyping();

    try {
      // Get current page context
      const page = window.Router?.current || window.location.hash.replace('#','') || 'dashboard';
      const userLevel = window._nzUserData?.level || 'N5';
      const contextNote = `\n\n[Context: User is on the "${page}" page, current JLPT target level: ${userLevel}]`;

      const msgs = chatHistory.map(m => ({
        role: m.role,
        content: m.role === 'user' && m === chatHistory[chatHistory.length - 1]
          ? m.content + contextNote
          : m.content
      }));

      const reply = await callGemini(msgs, SYSTEM_PROMPT);
      removeTyping();
      appendMessage('ai', reply);
      chatHistory.push({ role: 'assistant', content: reply });

      // Speak if voice mode is also active
      if (activeTab === 'voice') speakText(reply);
    } catch (err) {
      removeTyping();
      appendMessage('ai', '⚠️ ' + (err.message || 'Something went wrong. Check your API key.'));
    } finally {
      isLoading = false;
      if (sendBtn) sendBtn.disabled = false;
      setStatus('Ready to help');
    }
  }

  function setStatus(text) {
    const el = document.getElementById('as-status-text');
    if (el) el.textContent = text;
  }

  /* ─────────────────────────────────────────
     VOICE MODE
  ───────────────────────────────────────── */
  let voiceLang = 'ja-JP'; // default listen language

  function setupVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Voice not supported in this browser', 'Use Chrome or Edge for voice mode');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous    = false;
    recognition.interimResults = true;
    recognition.lang = voiceLang;

    recognition.onstart = function () {
      voiceState = 'listening';
      setVoiceStatus('Listening…', 'Speak naturally in Japanese or English');
      document.getElementById('as-voice-orb')?.classList.add('listening');
      document.getElementById('as-equalizer')?.classList.add('active');
      document.getElementById('as-voice-main-icon').textContent = '⏸';
      document.getElementById('as-voice-main-label').textContent = 'Listening';
    };

    recognition.onresult = function (e) {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      voiceTranscript = final || interim;
      const el = document.getElementById('as-voice-transcript');
      if (el) el.textContent = voiceTranscript || 'Listening…';
    };

    recognition.onend = function () {
      document.getElementById('as-voice-orb')?.classList.remove('listening');
      document.getElementById('as-equalizer')?.classList.remove('active');
      document.getElementById('as-voice-main-icon').textContent = '🎙';
      document.getElementById('as-voice-main-label').textContent = 'Start';

      if (voiceTranscript.trim() && voiceState !== 'idle') {
        processVoiceInput(voiceTranscript.trim());
      } else {
        voiceState = 'idle';
        setVoiceStatus('Tap the orb to start', 'Speak naturally — AI Sensei will respond');
      }
    };

    recognition.onerror = function (e) {
      voiceState = 'idle';
      setVoiceStatus('Tap to try again', 'Error: ' + e.error);
      document.getElementById('as-voice-orb')?.classList.remove('listening');
    };
  }

  async function processVoiceInput(text) {
    voiceState = 'thinking';
    setVoiceStatus('AI Sensei is thinking…', text);
    document.getElementById('as-voice-transcript').textContent = '🤔 ' + text;

    chatHistory.push({ role: 'user', content: text });

    try {
      const reply = await callGemini(chatHistory, SYSTEM_PROMPT);
      chatHistory.push({ role: 'assistant', content: reply });

      voiceState = 'speaking';
      setVoiceStatus('AI Sensei says:', reply.substring(0, 80) + (reply.length > 80 ? '…' : ''));
      document.getElementById('as-voice-transcript').textContent = reply;
      speakText(reply);
    } catch (err) {
      voiceState = 'idle';
      setVoiceStatus('Error — tap to retry', err.message || 'API error');
    }
  }

  function speakText(text) {
    if (!synthesis) return;
    synthesis.cancel();

    // Strip markdown for TTS
    const clean = text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#{1,3}\s/g, '')
      .replace(/<[^>]+>/g, '');

    const utt = new SpeechSynthesisUtterance(clean);

    // Detect Japanese content
    const hasJP = /[\u3040-\u30ff\u4e00-\u9faf]/.test(clean);
    if (hasJP) {
      // try to use a Japanese voice
      const voices = synthesis.getVoices();
      const jpVoice = voices.find(v => v.lang.startsWith('ja'));
      if (jpVoice) utt.voice = jpVoice;
      utt.lang = 'ja-JP';
    } else {
      utt.lang = 'en-US';
    }

    utt.rate  = 0.95;
    utt.pitch = 1.05;
    utt.onend = function () {
      voiceState = 'idle';
      setVoiceStatus('Tap the orb to continue', 'Say anything…');
      document.getElementById('as-equalizer')?.classList.remove('active');
    };
    utt.onstart = function () {
      document.getElementById('as-equalizer')?.classList.add('active');
    };

    synthesis.speak(utt);
  }

  function setVoiceStatus(status, hint) {
    const s = document.getElementById('as-voice-status');
    const h = document.getElementById('as-voice-hint');
    if (s) s.textContent = status;
    if (h && hint !== undefined) h.textContent = hint;
  }

  function startListening() {
    if (!recognition) setupVoice();
    if (!recognition) return;
    voiceTranscript = '';
    document.getElementById('as-voice-transcript').textContent = 'Listening…';
    voiceState = 'listening';
    try { recognition.start(); } catch(e) { /* already started */ }
  }

  function stopListening() {
    if (recognition) try { recognition.stop(); } catch(e) {}
    if (synthesis) synthesis.cancel();
    voiceState = 'idle';
    setVoiceStatus('Tap the orb to start', 'Speak naturally — AI Sensei will respond');
    document.getElementById('as-voice-orb')?.classList.remove('listening');
    document.getElementById('as-equalizer')?.classList.remove('active');
    document.getElementById('as-voice-main-icon').textContent = '🎙';
    document.getElementById('as-voice-main-label').textContent = 'Start';
  }

  /* ─────────────────────────────────────────
     CAREER COACH
  ───────────────────────────────────────── */
  async function askCareer(question) {
    const responseEl = document.getElementById('as-career-response');
    const askBtn     = document.getElementById('as-career-ask-btn');
    const scroll     = document.getElementById('as-career-scroll');

    if (!question.trim()) return;

    responseEl.style.display = 'block';
    responseEl.classList.add('visible');
    responseEl.innerHTML = '<div class="as-shimmer" style="width:80%"></div><div class="as-shimmer" style="width:60%;margin-top:8px"></div><div class="as-shimmer" style="width:70%;margin-top:8px"></div>';
    if (askBtn) askBtn.disabled = true;
    setStatus('Career Coach thinking…');

    setTimeout(() => {
      if (scroll) scroll.scrollTop = scroll.scrollHeight;
    }, 100);

    try {
      const reply = await callGemini(
        [{ role: 'user', content: question }],
        CAREER_SYSTEM
      );
      responseEl.innerHTML = renderMarkdown(reply);
    } catch (err) {
      responseEl.textContent = '⚠️ ' + (err.message || 'Error. Check your API key.');
    } finally {
      if (askBtn) askBtn.disabled = false;
      setStatus('Ready to help');
      setTimeout(() => {
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      }, 100);
    }
  }

  /* ─────────────────────────────────────────
     EVENT LISTENERS
  ───────────────────────────────────────── */
  function bindEvents() {
    // Trigger toggle (detect click vs drag)
    let mouseDownTime = 0, mouseDownX = 0, mouseDownY = 0;
    const trigger = document.getElementById('as-trigger');
    trigger.addEventListener('mousedown', e => {
      mouseDownTime = Date.now();
      mouseDownX = e.clientX; mouseDownY = e.clientY;
    });
    trigger.addEventListener('mouseup', e => {
      const dt = Date.now() - mouseDownTime;
      const dx = Math.abs(e.clientX - mouseDownX);
      const dy = Math.abs(e.clientY - mouseDownY);
      if (dt < 300 && dx < 6 && dy < 6) togglePanel();
    });
    trigger.addEventListener('touchend', e => {
      togglePanel();
    }, { passive: true });

    // Tabs
    document.querySelectorAll('.as-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Chat: send
    document.getElementById('as-send-btn').addEventListener('click', () => {
      const input = document.getElementById('as-chat-input');
      sendChat(input.value);
    });

    // Chat: textarea auto-resize + Enter to send
    document.getElementById('as-chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChat(e.target.value);
      }
    });
    document.getElementById('as-chat-input').addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Quick prompts
    document.querySelectorAll('.as-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => sendChat(btn.dataset.q));
    });

    // Mic button in chat (triggers voice input, sends to chat)
    document.getElementById('as-mic-btn').addEventListener('click', function () {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Voice input requires Chrome or Edge.');
        return;
      }
      this.classList.toggle('recording');
      if (this.classList.contains('recording')) {
        if (!recognition) setupVoice();
        voiceTranscript = '';
        voiceState = 'chat-mic';
        try { recognition.lang = 'en-US'; recognition.start(); } catch(e) {}

        recognition.onend = function () {
          const micBtn = document.getElementById('as-mic-btn');
          if (micBtn) micBtn.classList.remove('recording');
          if (voiceTranscript.trim()) {
            const chatInput = document.getElementById('as-chat-input');
            if (chatInput) {
              chatInput.value = voiceTranscript;
              chatInput.style.height = 'auto';
              chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
            }
          }
          voiceState = 'idle';
        };
      } else {
        if (recognition) try { recognition.stop(); } catch(e) {}
      }
    });

    // Voice view: orb click
    document.getElementById('as-voice-orb').addEventListener('click', () => {
      if (voiceState === 'idle') startListening();
      else stopListening();
    });

    // Voice main button
    document.getElementById('as-voice-main-btn').addEventListener('click', () => {
      if (voiceState === 'idle') startListening();
      else stopListening();
    });

    // Voice stop
    document.getElementById('as-voice-stop-btn').addEventListener('click', stopListening);

    // Voice language toggle
    const langs = ['en-US','ja-JP','hi-IN','ur-PK','zh-CN','ko-KR'];
    let langIdx = 0;
    document.getElementById('as-voice-lang-btn').addEventListener('click', () => {
      langIdx = (langIdx + 1) % langs.length;
      voiceLang = langs[langIdx];
      if (recognition) recognition.lang = voiceLang;
      document.querySelector('#as-voice-lang-btn .as-voice-btn-label').textContent = voiceLang.split('-')[0].toUpperCase();
    });

    // Career cards
    document.querySelectorAll('.as-career-card').forEach(card => {
      card.addEventListener('click', () => {
        const q = card.dataset.career;
        const input = document.getElementById('as-career-input');
        if (input) input.value = q;
        askCareer(q);
      });
    });

    // Career ask button
    document.getElementById('as-career-ask-btn').addEventListener('click', () => {
      const q = document.getElementById('as-career-input').value;
      askCareer(q);
    });
    document.getElementById('as-career-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') askCareer(e.target.value);
    });

    // Clear chat
    document.getElementById('as-clear-btn').addEventListener('click', () => {
      chatHistory = [];
      const msgs = document.getElementById('as-messages');
      if (msgs) msgs.innerHTML = '';
      const qp = document.getElementById('as-quick-prompts');
      if (qp) qp.style.display = '';
      addWelcomeMessage();
    });

    // Set API key
    document.getElementById('as-key-btn').addEventListener('click', () => {
      const k = prompt('Enter your Gemini API key (from Google AI Studio):', apiKey);
      if (k !== null) {
        apiKey = k.trim();
        localStorage.setItem('as_gemini_key', apiKey);
        window.AISENSEI_KEY = apiKey;
        alert(apiKey ? '✅ API key saved!' : '⚠️ Key cleared.');
      }
    });
  }

  /* ─────────────────────────────────────────
     SHOW WELCOME BADGE (after 3s if closed)
  ───────────────────────────────────────── */
  function scheduleWelcomeBadge() {
    setTimeout(() => {
      if (!isOpen) {
        const badge = document.getElementById('as-notif-badge');
        if (badge) badge.classList.remove('hidden');
      }
    }, 3000);
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    buildHTML();
    setupDrag();
    bindEvents();
    setupVoice();
    scheduleWelcomeBadge();

    // Expose globally so other scripts can open it
    window.AISensei = {
      open:       () => { if (!isOpen) togglePanel(); },
      close:      () => { if (isOpen)  togglePanel(); },
      sendChat,
      askCareer,
      setApiKey:  (k) => { apiKey = k; localStorage.setItem('as_gemini_key', k); }
    };

    console.log('%c AI Sensei 先 loaded ', 'background:#E8446A;color:#fff;border-radius:4px;padding:2px 8px;font-weight:bold');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
