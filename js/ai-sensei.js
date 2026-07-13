/**
 * AI Sensei — Full AI-powered Japanese learning companion
 * Tabs: Chat | Voice | Career Coach
 * Powered by Google Gemini API (gemini-1.5-flash)
 * API Key: hardcoded (Google AI Studio)
 *
 * FIXES:
 * - Works on dashboard and ALL pages (init waits for DOM + auth)
 * - Fully draggable/movable on desktop & mobile (touch + mouse)
 * - Mobile friendly panel sizing
 * - API key hardcoded — no prompt needed
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────
     CONFIG & API KEYS
  ───────────────────────────────────────── */
  const GEMINI_MODEL   = 'gemini-1.5-flash';
  const GEMINI_URL     = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent';
  const GEMINI_API_KEY = 'AIzaSyB-v5yOx6EwLEEfXknGAw1hZNG4XblVGVc'; // Google Cloud API

  const SYSTEM_PROMPT = `You are AI Sensei (先生), an expert Japanese language tutor and career advisor built into the NihongoZen learning platform.

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

For career questions:
- Give practical, actionable advice about working or studying in Japan
- Cover JLPT requirements, visa types, job-hunting (就活), internships
- Suggest realistic timelines and milestones

Keep responses concise but complete. Use markdown-style formatting for lists. Always be encouraging.`;

  const CAREER_SYSTEM = `You are AI Sensei Career Coach — an expert advisor on Japanese language careers, study abroad, JLPT preparation, working in Japan, and resume building.
Respond in the user's language. Be practical, specific, and motivating. Keep responses under 300 words unless a full roadmap is requested.`;

  /* ─────────────────────────────────────────
     STATE
  ───────────────────────────────────────── */
  var apiKey        = GEMINI_API_KEY;
  var isOpen        = false;
  var activeTab     = 'chat';
  var chatHistory   = [];
  var isLoading     = false;
  var recognition   = null;
  var synthesis     = window.speechSynthesis;
  var voiceState    = 'idle';
  var voiceTranscript = '';
  var voiceLang     = 'en-US';

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function fmt(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderMarkdown(text) {
    return escHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>(\n|$))+/g, '<ul style="padding-left:16px;margin:6px 0">$&</ul>')
      .replace(/\n/g, '<br>');
  }

  async function callGemini(messages, systemText) {
    var contents = messages.map(function(m) {
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      };
    });

    var body = {
      system_instruction: { parts: [{ text: systemText || SYSTEM_PROMPT }] },
      contents: contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 800, topP: 0.95 }
    };

    var res = await fetch(GEMINI_URL + '?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      var err = await res.json().catch(function() { return {}; });
      throw new Error((err && err.error && err.error.message) || ('API error ' + res.status));
    }

    var data = await res.json();
    return (data && data.candidates && data.candidates[0] &&
            data.candidates[0].content && data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0] &&
            data.candidates[0].content.parts[0].text) || '(No response)';
  }

  /* ─────────────────────────────────────────
     BUILD HTML — injected into body
  ───────────────────────────────────────── */
  function buildHTML() {
    // Remove old instance if exists (re-init safe)
    var old = document.getElementById('as-trigger');
    if (old) old.remove();
    var oldP = document.getElementById('as-panel');
    if (oldP) oldP.remove();

    var div = document.createElement('div');
    div.id = 'as-root';
    div.innerHTML = `
<button id="as-trigger" title="Open AI Sensei" aria-label="Open AI Sensei">
  <span class="as-trigger-inner">
    <span class="as-icon-closed">先</span>
    <span class="as-icon-open" style="display:none;">✕</span>
  </span>
  <span class="as-badge" id="as-notif-badge" style="display:none;">1</span>
</button>

<div id="as-panel" class="as-panel-hidden" role="dialog" aria-label="AI Sensei">
  <div class="as-header" id="as-drag-handle">
    <div class="as-avatar">先</div>
    <div class="as-header-info">
      <div class="as-header-name">AI Sensei <span style="font-size:10px;opacity:0.6;font-weight:400;">先生</span></div>
      <div class="as-header-status">
        <span class="as-status-dot"></span>
        <span id="as-status-text">Ready to help</span>
      </div>
    </div>
    <div class="as-header-actions">
      <button class="as-hbtn" id="as-clear-btn" title="Clear chat">🗑</button>
      <button class="as-hbtn as-close-btn" id="as-close-btn" title="Close">✕</button>
    </div>
  </div>

  <div class="as-tabs" role="tablist">
    <button class="as-tab as-tab-active" data-astab="chat" role="tab"><span>💬</span> Chat</button>
    <button class="as-tab" data-astab="voice" role="tab"><span>🎙</span> Voice</button>
    <button class="as-tab" data-astab="career" role="tab"><span>🚀</span> Career</button>
  </div>

  <div class="as-panel-body">

    <!-- CHAT -->
    <div class="as-view as-view-active" id="as-view-chat">
      <div class="as-messages" id="as-messages"></div>
      <div class="as-quick-prompts" id="as-quick-prompts">
        <button class="as-quick-btn" data-q="Explain て-form for me">て-form</button>
        <button class="as-quick-btn" data-q="How do I use は vs が?">は vs が</button>
        <button class="as-quick-btn" data-q="Give me 5 N5 vocab words with examples">N5 Vocab</button>
        <button class="as-quick-btn" data-q="Translate: I want to go to Japan">Translate</button>
        <button class="as-quick-btn" data-q="JLPT N3 grammar patterns">N3 Grammar</button>
        <button class="as-quick-btn" data-q="Teach me keigo polite Japanese">Keigo</button>
      </div>
      <div class="as-input-bar">
        <button class="as-mic-btn" id="as-mic-btn" title="Voice input">🎙</button>
        <textarea class="as-textarea" id="as-chat-input" placeholder="Ask anything in any language…" rows="1"></textarea>
        <button class="as-send-btn" id="as-send-btn" title="Send">➤</button>
      </div>
    </div>

    <!-- VOICE -->
    <div class="as-view" id="as-view-voice">
      <div class="as-voice-view">
        <div class="as-orb-wrap">
          <div class="as-orb-ring"></div>
          <div class="as-orb-ring as-orb-ring2"></div>
          <div class="as-orb" id="as-voice-orb">先</div>
        </div>
        <div style="text-align:center;">
          <div class="as-voice-status" id="as-voice-status">Tap the orb to start</div>
          <div class="as-voice-hint" id="as-voice-hint">Speak naturally — AI Sensei will respond</div>
        </div>
        <div class="as-equalizer" id="as-equalizer">
          <div class="as-eq-bar"></div><div class="as-eq-bar"></div>
          <div class="as-eq-bar"></div><div class="as-eq-bar"></div>
          <div class="as-eq-bar"></div>
        </div>
        <div class="as-voice-transcript" id="as-voice-transcript">Your speech will appear here…</div>
        <div class="as-voice-controls">
          <div class="as-voice-btn" id="as-voice-lang-btn">
            <div class="as-voice-btn-icon">🌐</div>
            <div class="as-voice-btn-label" id="as-lang-label">EN</div>
          </div>
          <div class="as-voice-btn as-voice-btn-primary" id="as-voice-main-btn">
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

    <!-- CAREER -->
    <div class="as-view" id="as-view-career">
      <div class="as-career-scroll" id="as-career-scroll">
        <div class="as-career-hero">
          <div class="as-career-hero-icon">🎯</div>
          <div class="as-career-hero-title">AI Career Coach</div>
          <div class="as-career-hero-desc">Personalized roadmap for working in Japan, JLPT success, study abroad, and more.</div>
        </div>
        <div class="as-career-grid">
          <div class="as-career-card" data-career="How do I get a job in Japan as a foreigner? What JLPT level do I need?"><div class="as-career-card-icon">🇯🇵</div><div class="as-career-card-title">Work in Japan</div><div class="as-career-card-desc">Jobs, visas & requirements</div></div>
          <div class="as-career-card" data-career="Best universities to study Japanese in Japan? How do I apply for scholarships?"><div class="as-career-card-icon">🎓</div><div class="as-career-card-title">Study Abroad</div><div class="as-career-card-desc">Universities & scholarships</div></div>
          <div class="as-career-card" data-career="Create a 6-month JLPT N2 study roadmap with weekly goals and resources."><div class="as-career-card-icon">📋</div><div class="as-career-card-title">JLPT Roadmap</div><div class="as-career-card-desc">Personalized study plan</div></div>
          <div class="as-career-card" data-career="Help me write a Japanese-style resume (履歴書) for a tech job in Japan."><div class="as-career-card-icon">📝</div><div class="as-career-card-title">Resume Builder</div><div class="as-career-card-desc">Japanese 履歴書 tips</div></div>
          <div class="as-career-card" data-career="What tech skills should I learn alongside Japanese for a software job in Japan?"><div class="as-career-card-icon">💻</div><div class="as-career-card-title">Tech + Japanese</div><div class="as-career-card-desc">Skills to combine</div></div>
          <div class="as-career-card" data-career="How do I prepare for a Japanese job interview? Common questions and answers?"><div class="as-career-card-icon">🤝</div><div class="as-career-card-title">Interview Prep</div><div class="as-career-card-desc">面接 tips & phrases</div></div>
        </div>
        <div class="as-career-response" id="as-career-response" style="display:none;"></div>
      </div>
      <div class="as-career-input-area">
        <div class="as-career-input-label">Ask your career question:</div>
        <div class="as-career-input-row">
          <input type="text" class="as-career-input" id="as-career-input" placeholder="e.g. How do I work in Japan as a developer?" />
          <button class="as-career-ask-btn" id="as-career-ask-btn">Ask</button>
        </div>
      </div>
    </div>

  </div>
</div>
`;
    document.body.appendChild(div);
  }

  /* ─────────────────────────────────────────
     PANEL OPEN / CLOSE
  ───────────────────────────────────────── */
  function togglePanel() {
    isOpen = !isOpen;
    var panel   = document.getElementById('as-panel');
    var trigger = document.getElementById('as-trigger');
    var badge   = document.getElementById('as-notif-badge');
    var iconClosed = trigger.querySelector('.as-icon-closed');
    var iconOpen   = trigger.querySelector('.as-icon-open');

    if (isOpen) {
      panel.classList.remove('as-panel-hidden');
      trigger.classList.add('as-trigger-open');
      if (iconClosed) iconClosed.style.display = 'none';
      if (iconOpen)   iconOpen.style.display   = 'flex';
      if (badge)      badge.style.display       = 'none';
      if (chatHistory.length === 0) addWelcomeMessage();
    } else {
      panel.classList.add('as-panel-hidden');
      trigger.classList.remove('as-trigger-open');
      if (iconClosed) iconClosed.style.display = 'flex';
      if (iconOpen)   iconOpen.style.display   = 'none';
    }
  }

  /* ─────────────────────────────────────────
     DRAGGABLE — mouse + touch, both trigger & panel
  ───────────────────────────────────────── */
  function setupDrag() {
    var trigger = document.getElementById('as-trigger');
    var panel   = document.getElementById('as-panel');
    var dragHandle = document.getElementById('as-drag-handle');

    // --- Drag the trigger button ---
    makeDraggable(trigger, trigger, true);

    // --- Drag the panel via its header ---
    makeDraggable(panel, dragHandle, false);
  }

  function makeDraggable(el, handle, syncPanel) {
    var isDragging = false;
    var startX, startY, startLeft, startTop, startRight, startBottom;

    function getPos() {
      var style = window.getComputedStyle(el);
      return {
        right:  parseInt(el.style.right  || style.right  || '28') || 28,
        bottom: parseInt(el.style.bottom || style.bottom || '28') || 28,
        left:   el.getBoundingClientRect().left,
        top:    el.getBoundingClientRect().top
      };
    }

    function onStart(clientX, clientY) {
      isDragging = false; // will be set true on move
      startX = clientX;
      startY = clientY;
      var rect = el.getBoundingClientRect();
      startLeft   = rect.left;
      startTop    = rect.top;
      startRight  = window.innerWidth  - rect.right;
      startBottom = window.innerHeight - rect.bottom;

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onEnd);
      document.addEventListener('touchmove', onMoveTouch, { passive: false });
      document.addEventListener('touchend',  onEnd);
    }

    function onMove(e) {
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging = true;
      if (!isDragging) return;

      var newRight  = Math.max(4, Math.min(window.innerWidth  - 20, startRight  - dx));
      var newBottom = Math.max(4, Math.min(window.innerHeight - 20, startBottom - dy));

      el.style.right  = newRight  + 'px';
      el.style.bottom = newBottom + 'px';
      el.style.left   = 'auto';
      el.style.top    = 'auto';

      if (syncPanel) syncPanelToTrigger();
    }

    function onMoveTouch(e) {
      e.preventDefault();
      var t = e.touches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging = true;
      if (!isDragging) return;

      var newRight  = Math.max(4, Math.min(window.innerWidth  - 20, startRight  - dx));
      var newBottom = Math.max(4, Math.min(window.innerHeight - 20, startBottom - dy));

      el.style.right  = newRight  + 'px';
      el.style.bottom = newBottom + 'px';
      el.style.left   = 'auto';
      el.style.top    = 'auto';

      if (syncPanel) syncPanelToTrigger();
    }

    function onEnd() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onEnd);
      document.removeEventListener('touchmove', onMoveTouch);
      document.removeEventListener('touchend',  onEnd);
      if (isDragging) snapToNearestEdge(el, syncPanel);
      // isDragging flag is read by click handlers to suppress toggle
      setTimeout(function() { isDragging = false; }, 50);
    }

    handle.addEventListener('mousedown', function(e) {
      // Only left click
      if (e.button !== 0) return;
      onStart(e.clientX, e.clientY);
    });

    handle.addEventListener('touchstart', function(e) {
      onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // Expose dragging state so click handler can check
    el._asDragging = function() { return isDragging; };
  }

  /* Snap the dragged element to whichever viewport edge it's closest to
     (left / right / top / bottom), so it never ends up floating at the
     center of the screen. Smooth, premium-feeling animation via a
     temporary CSS transition on position properties only. */
  function snapToNearestEdge(el, syncPanel) {
    var rect   = el.getBoundingClientRect();
    var vw     = window.innerWidth;
    var vh     = window.innerHeight;
    var margin = 16;

    var distLeft   = rect.left;
    var distRight  = vw - rect.right;
    var distTop    = rect.top;
    var distBottom = vh - rect.bottom;
    var minDist    = Math.min(distLeft, distRight, distTop, distBottom);

    el.style.transition =
      'left .3s cubic-bezier(.34,1.56,.64,1), right .3s cubic-bezier(.34,1.56,.64,1), ' +
      'top .3s cubic-bezier(.34,1.56,.64,1), bottom .3s cubic-bezier(.34,1.56,.64,1)';

    if (minDist === distLeft) {
      el.style.left  = margin + 'px';
      el.style.right = 'auto';
      el.style.top    = Math.max(margin, Math.min(vh - rect.height - margin, rect.top)) + 'px';
      el.style.bottom = 'auto';
    } else if (minDist === distRight) {
      el.style.right = margin + 'px';
      el.style.left  = 'auto';
      el.style.top    = Math.max(margin, Math.min(vh - rect.height - margin, rect.top)) + 'px';
      el.style.bottom = 'auto';
    } else if (minDist === distTop) {
      el.style.top    = margin + 'px';
      el.style.bottom = 'auto';
      el.style.left  = Math.max(margin, Math.min(vw - rect.width - margin, rect.left)) + 'px';
      el.style.right = 'auto';
    } else {
      el.style.bottom = margin + 'px';
      el.style.top    = 'auto';
      el.style.left  = Math.max(margin, Math.min(vw - rect.width - margin, rect.left)) + 'px';
      el.style.right = 'auto';
    }

    if (syncPanel) syncPanelToTrigger();

    setTimeout(function() { el.style.transition = ''; }, 320);
  }

  function syncPanelToTrigger() {
    var trigger = document.getElementById('as-trigger');
    var panel   = document.getElementById('as-panel');
    if (!trigger || !panel) return;
    var GAP = 12;
    var ts = trigger.style;
    panel.style.transition = trigger.style.transition;

    if (ts.left && ts.left !== 'auto') {
      panel.style.left  = ts.left;
      panel.style.right = 'auto';
    } else {
      panel.style.right = (ts.right && ts.right !== 'auto') ? ts.right : '28px';
      panel.style.left  = 'auto';
    }

    if (ts.top && ts.top !== 'auto') {
      panel.style.top    = (parseInt(ts.top, 10) + trigger.offsetHeight + GAP) + 'px';
      panel.style.bottom = 'auto';
    } else {
      var bottomVal = (ts.bottom && ts.bottom !== 'auto') ? parseInt(ts.bottom, 10) : 28;
      panel.style.bottom = (bottomVal + trigger.offsetHeight + GAP) + 'px';
      panel.style.top    = 'auto';
    }
  }

  /* ─────────────────────────────────────────
     TABS
  ───────────────────────────────────────── */
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.as-tab').forEach(function(t) {
      t.classList.toggle('as-tab-active', t.dataset.astab === tab);
    });
    document.querySelectorAll('.as-view').forEach(function(v) {
      v.classList.toggle('as-view-active', v.id === 'as-view-' + tab);
    });
  }

  /* ─────────────────────────────────────────
     CHAT
  ───────────────────────────────────────── */
  function addWelcomeMessage() {
    appendMessage('ai',
      'こんにちは！ 👋 I\'m **AI Sensei**, your personal Japanese learning companion.\n\n' +
      'I can help you with:\n' +
      '- Grammar explanations (N5–N1)\n' +
      '- Vocabulary & kanji\n' +
      '- Translation in any language\n' +
      '- Conversation practice\n' +
      '- Career advice for Japan\n\n' +
      'What would you like to learn today?'
    );
  }

  function appendMessage(role, text) {
    var msgs = document.getElementById('as-messages');
    if (!msgs) return;

    var wrap = document.createElement('div');
    wrap.className = 'as-msg as-msg-' + role;

    var avatar = document.createElement('div');
    avatar.className = 'as-msg-avatar';
    avatar.textContent = role === 'ai' ? '先' : '👤';

    var col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;max-width:78%;';

    var bubble = document.createElement('div');
    bubble.className = 'as-msg-bubble';
    bubble.innerHTML = renderMarkdown(text);

    var time = document.createElement('div');
    time.className = 'as-msg-time';
    time.textContent = fmt(new Date());

    col.appendChild(bubble);
    col.appendChild(time);

    if (role === 'ai') {
      wrap.appendChild(avatar);
      wrap.appendChild(col);
    } else {
      wrap.appendChild(col);
      wrap.appendChild(avatar);
      // Hide quick prompts after user sends
      var qp = document.getElementById('as-quick-prompts');
      if (qp) qp.style.display = 'none';
    }

    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    var msgs = document.getElementById('as-messages');
    if (!msgs) return;
    var wrap = document.createElement('div');
    wrap.className = 'as-msg as-msg-ai';
    wrap.id = 'as-typing-ind';
    wrap.innerHTML = '<div class="as-msg-avatar">先</div>' +
      '<div class="as-typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    var el = document.getElementById('as-typing-ind');
    if (el) el.remove();
  }

  function setStatus(text) {
    var el = document.getElementById('as-status-text');
    if (el) el.textContent = text;
  }

  async function sendChat(text) {
    if (isLoading || !text.trim()) return;
    isLoading = true;

    var input   = document.getElementById('as-chat-input');
    var sendBtn = document.getElementById('as-send-btn');
    if (input)   { input.value = ''; input.style.height = 'auto'; }
    if (sendBtn) sendBtn.disabled = true;

    setStatus('Thinking…');
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });
    showTyping();

    try {
      var page      = (window.location.hash || '#dashboard').replace('#', '') || 'dashboard';
      var userLevel = (window._nzUserData && window._nzUserData.level) ? window._nzUserData.level : 'N5';
      var lastMsg   = chatHistory[chatHistory.length - 1];
      var msgs      = chatHistory.map(function(m) {
        return {
          role: m.role,
          content: (m === lastMsg && m.role === 'user')
            ? m.content + '\n\n[Context: page="' + page + '", JLPT level="' + userLevel + '"]'
            : m.content
        };
      });

      var reply = await callGemini(msgs, SYSTEM_PROMPT);
      removeTyping();
      appendMessage('ai', reply);
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      removeTyping();
      appendMessage('ai', '⚠️ ' + (err.message || 'Something went wrong. Please try again.'));
    } finally {
      isLoading = false;
      if (sendBtn) sendBtn.disabled = false;
      setStatus('Ready to help');
    }
  }

  /* ─────────────────────────────────────────
     VOICE
  ───────────────────────────────────────── */
  function setupVoice() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceStatus('Voice not supported', 'Use Chrome or Edge for voice mode');
      return;
    }

    recognition = new SR();
    recognition.continuous     = false;
    recognition.interimResults = true;
    recognition.lang           = voiceLang;

    recognition.onstart = function() {
      voiceState = 'listening';
      setVoiceStatus('Listening…', 'Speak naturally');
      var orb = document.getElementById('as-voice-orb');
      var eq  = document.getElementById('as-equalizer');
      if (orb) orb.classList.add('as-orb-listening');
      if (eq)  eq.classList.add('as-eq-active');
      var icon  = document.getElementById('as-voice-main-icon');
      var label = document.getElementById('as-voice-main-label');
      if (icon)  icon.textContent  = '⏸';
      if (label) label.textContent = 'Listening';
    };

    recognition.onresult = function(e) {
      var interim = '', final = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      voiceTranscript = final || interim;
      var el = document.getElementById('as-voice-transcript');
      if (el) el.textContent = voiceTranscript || 'Listening…';
    };

    recognition.onend = function() {
      var orb = document.getElementById('as-voice-orb');
      var eq  = document.getElementById('as-equalizer');
      if (orb) orb.classList.remove('as-orb-listening');
      if (eq)  eq.classList.remove('as-eq-active');
      var icon  = document.getElementById('as-voice-main-icon');
      var label = document.getElementById('as-voice-main-label');
      if (icon)  icon.textContent  = '🎙';
      if (label) label.textContent = 'Start';

      if (voiceTranscript.trim() && voiceState !== 'idle') {
        processVoiceInput(voiceTranscript.trim());
      } else {
        voiceState = 'idle';
        setVoiceStatus('Tap the orb to start', 'Speak naturally — AI Sensei will respond');
      }
    };

    recognition.onerror = function(e) {
      voiceState = 'idle';
      setVoiceStatus('Tap to try again', 'Error: ' + e.error);
      var orb = document.getElementById('as-voice-orb');
      if (orb) orb.classList.remove('as-orb-listening');
    };
  }

  async function processVoiceInput(text) {
    voiceState = 'thinking';
    setVoiceStatus('AI Sensei is thinking…', text.substring(0, 60));
    var el = document.getElementById('as-voice-transcript');
    if (el) el.textContent = '🤔 ' + text;

    chatHistory.push({ role: 'user', content: text });

    try {
      var reply = await callGemini(chatHistory, SYSTEM_PROMPT);
      chatHistory.push({ role: 'assistant', content: reply });
      voiceState = 'speaking';
      setVoiceStatus('AI Sensei says:', reply.substring(0, 80) + (reply.length > 80 ? '…' : ''));
      if (el) el.textContent = reply;
      speakText(reply);
    } catch (err) {
      voiceState = 'idle';
      setVoiceStatus('Error — tap to retry', err.message || 'API error');
    }
  }

  function speakText(text) {
    if (!synthesis) return;
    synthesis.cancel();
    var clean = text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/<[^>]+>/g, '');

    var utt = new SpeechSynthesisUtterance(clean);
    var hasJP = /[\u3040-\u30ff\u4e00-\u9faf]/.test(clean);
    if (hasJP) {
      var voices = synthesis.getVoices();
      var jpVoice = voices.find(function(v) { return v.lang.startsWith('ja'); });
      if (jpVoice) utt.voice = jpVoice;
      utt.lang = 'ja-JP';
    } else {
      utt.lang = 'en-US';
    }
    utt.rate = 0.95; utt.pitch = 1.05;
    utt.onend = function() {
      voiceState = 'idle';
      setVoiceStatus('Tap the orb to continue', 'Say anything…');
      var eq = document.getElementById('as-equalizer');
      if (eq) eq.classList.remove('as-eq-active');
    };
    utt.onstart = function() {
      var eq = document.getElementById('as-equalizer');
      if (eq) eq.classList.add('as-eq-active');
    };
    synthesis.speak(utt);
  }

  function setVoiceStatus(status, hint) {
    var s = document.getElementById('as-voice-status');
    var h = document.getElementById('as-voice-hint');
    if (s) s.textContent = status;
    if (h && hint !== undefined) h.textContent = hint;
  }

  function startListening() {
    if (!recognition) setupVoice();
    if (!recognition) return;
    voiceTranscript = '';
    voiceState = 'listening';
    var el = document.getElementById('as-voice-transcript');
    if (el) el.textContent = 'Listening…';
    try { recognition.start(); } catch(e) {}
  }

  function stopListening() {
    if (recognition) try { recognition.stop(); } catch(e) {}
    if (synthesis)   synthesis.cancel();
    voiceState = 'idle';
    setVoiceStatus('Tap the orb to start', 'Speak naturally — AI Sensei will respond');
    var orb = document.getElementById('as-voice-orb');
    var eq  = document.getElementById('as-equalizer');
    if (orb) orb.classList.remove('as-orb-listening');
    if (eq)  eq.classList.remove('as-eq-active');
    var icon  = document.getElementById('as-voice-main-icon');
    var label = document.getElementById('as-voice-main-label');
    if (icon)  icon.textContent  = '🎙';
    if (label) label.textContent = 'Start';
  }

  /* ─────────────────────────────────────────
     CAREER COACH
  ───────────────────────────────────────── */
  async function askCareer(question) {
    if (!question || !question.trim()) return;
    var responseEl = document.getElementById('as-career-response');
    var askBtn     = document.getElementById('as-career-ask-btn');
    var scroll     = document.getElementById('as-career-scroll');

    if (responseEl) {
      responseEl.style.display = 'block';
      responseEl.innerHTML = '<div class="as-shimmer"></div><div class="as-shimmer" style="width:70%;margin-top:6px;"></div><div class="as-shimmer" style="width:80%;margin-top:6px;"></div>';
    }
    if (askBtn) askBtn.disabled = true;
    setStatus('Career Coach thinking…');

    try {
      var reply = await callGemini(
        [{ role: 'user', content: question }],
        CAREER_SYSTEM
      );
      if (responseEl) responseEl.innerHTML = renderMarkdown(reply);
    } catch (err) {
      if (responseEl) responseEl.textContent = '⚠️ ' + (err.message || 'Error. Please try again.');
    } finally {
      if (askBtn) askBtn.disabled = false;
      setStatus('Ready to help');
      setTimeout(function() { if (scroll) scroll.scrollTop = scroll.scrollHeight; }, 100);
    }
  }

  /* ─────────────────────────────────────────
     BIND ALL EVENTS
  ───────────────────────────────────────── */
  function bindEvents() {
    var trigger = document.getElementById('as-trigger');

    // Click to open/close (only if not dragging)
    trigger.addEventListener('click', function(e) {
      if (trigger._asDragging && trigger._asDragging()) return;
      togglePanel();
    });

    // Close button
    document.getElementById('as-close-btn').addEventListener('click', function() {
      if (isOpen) togglePanel();
    });

    // Tabs
    document.querySelectorAll('.as-tab').forEach(function(tab) {
      tab.addEventListener('click', function() { switchTab(tab.dataset.astab); });
    });

    // Send button
    document.getElementById('as-send-btn').addEventListener('click', function() {
      var input = document.getElementById('as-chat-input');
      if (input) sendChat(input.value);
    });

    // Textarea: Enter to send, auto-resize
    var chatInput = document.getElementById('as-chat-input');
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChat(this.value);
      }
    });
    chatInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Quick prompts
    document.querySelectorAll('.as-quick-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { sendChat(btn.dataset.q); });
    });

    // Mic button in chat
    document.getElementById('as-mic-btn').addEventListener('click', function() {
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { alert('Voice input needs Chrome or Edge.'); return; }
      this.classList.toggle('as-mic-recording');
      if (this.classList.contains('as-mic-recording')) {
        if (!recognition) setupVoice();
        voiceTranscript = '';
        voiceState = 'chat-mic';
        try { recognition.lang = 'en-US'; recognition.start(); } catch(e) {}
        var self = this;
        recognition.onend = function() {
          self.classList.remove('as-mic-recording');
          if (voiceTranscript.trim()) {
            var ci = document.getElementById('as-chat-input');
            if (ci) {
              ci.value = voiceTranscript;
              ci.style.height = 'auto';
              ci.style.height = Math.min(ci.scrollHeight, 120) + 'px';
            }
          }
          voiceState = 'idle';
        };
      } else {
        if (recognition) try { recognition.stop(); } catch(e) {}
      }
    });

    // Voice orb
    document.getElementById('as-voice-orb').addEventListener('click', function() {
      if (voiceState === 'idle') startListening(); else stopListening();
    });
    document.getElementById('as-voice-main-btn').addEventListener('click', function() {
      if (voiceState === 'idle') startListening(); else stopListening();
    });
    document.getElementById('as-voice-stop-btn').addEventListener('click', stopListening);

    // Language toggle
    var langs  = ['en-US','ja-JP','hi-IN','ur-PK','zh-CN','ko-KR'];
    var langIdx = 0;
    document.getElementById('as-voice-lang-btn').addEventListener('click', function() {
      langIdx = (langIdx + 1) % langs.length;
      voiceLang = langs[langIdx];
      if (recognition) recognition.lang = voiceLang;
      var lbl = document.getElementById('as-lang-label');
      if (lbl) lbl.textContent = voiceLang.split('-')[0].toUpperCase();
    });

    // Career cards
    document.querySelectorAll('.as-career-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var q = card.dataset.career;
        var inp = document.getElementById('as-career-input');
        if (inp) inp.value = q;
        askCareer(q);
      });
    });

    // Career ask
    document.getElementById('as-career-ask-btn').addEventListener('click', function() {
      var q = document.getElementById('as-career-input').value;
      askCareer(q);
    });
    document.getElementById('as-career-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') askCareer(this.value);
    });

    // Clear chat
    document.getElementById('as-clear-btn').addEventListener('click', function() {
      chatHistory = [];
      var msgs = document.getElementById('as-messages');
      if (msgs) msgs.innerHTML = '';
      var qp = document.getElementById('as-quick-prompts');
      if (qp) qp.style.display = '';
      addWelcomeMessage();
    });
  }

  /* ─────────────────────────────────────────
     WELCOME BADGE
  ───────────────────────────────────────── */
  function showBadge() {
    setTimeout(function() {
      if (!isOpen) {
        var badge = document.getElementById('as-notif-badge');
        if (badge) badge.style.display = 'flex';
      }
    }, 3000);
  }

  /* ─────────────────────────────────────────
     INIT — waits for DOM, then auth if needed
  ───────────────────────────────────────── */
  function init() {
    // Prevent double-init
    if (document.getElementById('as-trigger')) return;

    buildHTML();
    setupDrag();
    bindEvents();
    setupVoice();
    showBadge();

    window.AISensei = {
      open:     function() { if (!isOpen) togglePanel(); },
      close:    function() { if (isOpen)  togglePanel(); },
      sendChat: sendChat,
      askCareer: askCareer
    };

    console.log('%c AI Sensei 先 ready ', 'background:#E8446A;color:#fff;border-radius:4px;padding:2px 8px;font-weight:bold');
  }

  // Strategy: init as soon as possible, but ALSO after nz:userReady
  // so it works whether the page is fully loaded or auth is still pending
  function tryInit() {
    if (document.body) {
      init();
    } else {
      document.addEventListener('DOMContentLoaded', init);
    }
  }

  // Also re-init after NihongoZen auth completes (renderShell wipes innerHTML)
  document.addEventListener('nz:userReady', function() {
    // Small delay to let renderShell() finish building the DOM
    setTimeout(function() {
      if (!document.getElementById('as-trigger')) init();
    }, 300);
  });

  tryInit();

})();
