/* ════════════════════════════════════════════════════════════════
   NZ VERB GROUP MODULE — 動詞グループ
   Verb Group Learning System for NihongoZen
   
   INSTALLATION:
     1. Place this file at: js/nz-verb-group-module.js
     2. In index.html, inside <head> (after existing scripts):
          <script src="js/nz-verb-group-module.js" defer></script>
     3. That's it — the module auto-patches Pages.vocab and the
        sidebar, registers the 'verb-group' route, and injects
        the "Verb Group" button into the Vocabulary page.
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────── */
  function H(s) {
    if (window.H) return window.H(s);
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function jlptColor(lv) {
    if (window.jlptColor) return window.jlptColor(lv);
    return ({N5:'var(--n5)',N4:'var(--n4)',N3:'var(--n3)',N2:'var(--n2)',N1:'var(--n1)'})[lv]||'var(--primary)';
  }
  function jlptIcon(lv) {
    if (window.jlptIcon) return window.jlptIcon(lv);
    return ({N5:'🌱',N4:'🌿',N3:'🌳',N2:'🏯',N1:'🗻'})[lv]||'📚';
  }
  function $id(id) { return document.getElementById(id); }
  function nzGo(r) { if (window.nzGo) window.nzGo(r); else if (window.NzRouter) window.NzRouter.go(r); }
  function setHTML(h) { if (window.setHTML) window.setHTML(h); else { var el=$id('nz-content'); if(el) el.innerHTML=h; } }
  function getUD() { return (window.getUD && window.getUD()) || window._nzUserData || {}; }
  function saveUD(d) { if (window.saveUD) window.saveUD(d); else if (window._nzUserData) Object.assign(window._nzUserData, d); }
  function nzShowToast(msg, type) { if (window.nzShowToast) window.nzShowToast(msg, type||'info'); }

  /* ── Verb Data (N5–N1) ───────────────────────────────────── */
  var VERB_DB = {
    N5: [
      { kanji:'食べる', kana:'たべる', romaji:'taberu',   en:'To Eat',    group:'Group 2', verbType:'Ichidan Verb',
        present:'食べる', past:'食べた', negative:'食べない', te:'食べて',
        example:'私は毎日パンを食べます。', translation:'I eat bread every day.' },
      { kanji:'飲む',   kana:'のむ',   romaji:'nomu',     en:'To Drink',  group:'Group 1', verbType:'Godan Verb',
        present:'飲む',   past:'飲んだ',  negative:'飲まない', te:'飲んで',
        example:'水を飲みます。', translation:'I drink water.' },
      { kanji:'見る',   kana:'みる',   romaji:'miru',     en:'To See',    group:'Group 2', verbType:'Ichidan Verb',
        present:'見る',   past:'見た',   negative:'見ない',   te:'見て',
        example:'映画を見ます。', translation:'I watch a movie.' },
      { kanji:'行く',   kana:'いく',   romaji:'iku',      en:'To Go',     group:'Group 1', verbType:'Godan Verb',
        present:'行く',   past:'行った',  negative:'行かない', te:'行って',
        example:'学校へ行きます。', translation:'I go to school.' },
      { kanji:'話す',   kana:'はなす', romaji:'hanasu',   en:'To Speak',  group:'Group 1', verbType:'Godan Verb',
        present:'話す',   past:'話した',  negative:'話さない', te:'話して',
        example:'日本語を話します。', translation:'I speak Japanese.' },
      { kanji:'する',   kana:'する',   romaji:'suru',     en:'To Do',     group:'Group 3', verbType:'Irregular Verb (する)',
        present:'する',   past:'した',   negative:'しない',   te:'して',
        example:'宿題をします。', translation:'I do homework.' },
      { kanji:'来る',   kana:'くる',   romaji:'kuru',     en:'To Come',   group:'Group 3', verbType:'Irregular Verb (くる)',
        present:'来る',   past:'来た',   negative:'来ない',   te:'来て',
        example:'友達が来ます。', translation:'A friend comes.' },
      { kanji:'買う',   kana:'かう',   romaji:'kau',      en:'To Buy',    group:'Group 1', verbType:'Godan Verb',
        present:'買う',   past:'買った',  negative:'買わない', te:'買って',
        example:'本を買います。', translation:'I buy a book.' },
      { kanji:'書く',   kana:'かく',   romaji:'kaku',     en:'To Write',  group:'Group 1', verbType:'Godan Verb',
        present:'書く',   past:'書いた',  negative:'書かない', te:'書いて',
        example:'手紙を書きます。', translation:'I write a letter.' },
      { kanji:'読む',   kana:'よむ',   romaji:'yomu',     en:'To Read',   group:'Group 1', verbType:'Godan Verb',
        present:'読む',   past:'読んだ',  negative:'読まない', te:'読んで',
        example:'本を読みます。', translation:'I read a book.' },
      { kanji:'起きる', kana:'おきる', romaji:'okiru',    en:'To Wake Up',group:'Group 2', verbType:'Ichidan Verb',
        present:'起きる', past:'起きた',  negative:'起きない', te:'起きて',
        example:'七時に起きます。', translation:'I wake up at 7.' },
      { kanji:'寝る',   kana:'ねる',   romaji:'neru',     en:'To Sleep',  group:'Group 2', verbType:'Ichidan Verb',
        present:'寝る',   past:'寝た',   negative:'寝ない',   te:'寝て',
        example:'早く寝ます。', translation:'I sleep early.' },
    ],
    N4: [
      { kanji:'待つ',   kana:'まつ',   romaji:'matsu',    en:'To Wait',   group:'Group 1', verbType:'Godan Verb',
        present:'待つ',   past:'待った',  negative:'待たない', te:'待って',
        example:'バスを待ちます。', translation:'I wait for the bus.' },
      { kanji:'作る',   kana:'つくる', romaji:'tsukuru',  en:'To Make',   group:'Group 1', verbType:'Godan Verb',
        present:'作る',   past:'作った',  negative:'作らない', te:'作って',
        example:'料理を作ります。', translation:'I make food.' },
      { kanji:'開ける', kana:'あける', romaji:'akeru',    en:'To Open',   group:'Group 2', verbType:'Ichidan Verb',
        present:'開ける', past:'開けた',  negative:'開けない', te:'開けて',
        example:'窓を開けます。', translation:'I open the window.' },
      { kanji:'閉める', kana:'しめる', romaji:'shimeru',  en:'To Close',  group:'Group 2', verbType:'Ichidan Verb',
        present:'閉める', past:'閉めた',  negative:'閉めない', te:'閉めて',
        example:'ドアを閉めます。', translation:'I close the door.' },
      { kanji:'教える', kana:'おしえる',romaji:'oshieru', en:'To Teach',  group:'Group 2', verbType:'Ichidan Verb',
        present:'教える', past:'教えた',  negative:'教えない', te:'教えて',
        example:'英語を教えます。', translation:'I teach English.' },
      { kanji:'泳ぐ',   kana:'およぐ', romaji:'oyogu',    en:'To Swim',   group:'Group 1', verbType:'Godan Verb',
        present:'泳ぐ',   past:'泳いだ',  negative:'泳がない', te:'泳いで',
        example:'海で泳ぎます。', translation:'I swim in the sea.' },
      { kanji:'貸す',   kana:'かす',   romaji:'kasu',     en:'To Lend',   group:'Group 1', verbType:'Godan Verb',
        present:'貸す',   past:'貸した',  negative:'貸さない', te:'貸して',
        example:'本を貸します。', translation:'I lend a book.' },
      { kanji:'借りる', kana:'かりる', romaji:'kariru',   en:'To Borrow', group:'Group 2', verbType:'Ichidan Verb',
        present:'借りる', past:'借りた',  negative:'借りない', te:'借りて',
        example:'本を借ります。', translation:'I borrow a book.' },
      { kanji:'勉強する',kana:'べんきょうする',romaji:'benkyou suru',en:'To Study',group:'Group 3',verbType:'Irregular Verb (する)',
        present:'勉強する',past:'勉強した',negative:'勉強しない',te:'勉強して',
        example:'毎日勉強します。', translation:'I study every day.' },
      { kanji:'運動する',kana:'うんどうする',romaji:'undou suru',en:'To Exercise',group:'Group 3',verbType:'Irregular Verb (する)',
        present:'運動する',past:'運動した',negative:'運動しない',te:'運動して',
        example:'毎朝運動します。', translation:'I exercise every morning.' },
    ],
    N3: [
      { kanji:'続ける', kana:'つづける',romaji:'tsuzukeru',en:'To Continue',group:'Group 2',verbType:'Ichidan Verb',
        present:'続ける', past:'続けた',  negative:'続けない', te:'続けて',
        example:'練習を続けます。', translation:'I continue practicing.' },
      { kanji:'決める', kana:'きめる',  romaji:'kimeru',   en:'To Decide', group:'Group 2', verbType:'Ichidan Verb',
        present:'決める', past:'決めた',  negative:'決めない', te:'決めて',
        example:'計画を決めます。', translation:'I decide on a plan.' },
      { kanji:'比べる', kana:'くらべる',romaji:'kuraberu', en:'To Compare',group:'Group 2', verbType:'Ichidan Verb',
        present:'比べる', past:'比べた',  negative:'比べない', te:'比べて',
        example:'二つを比べます。', translation:'I compare the two.' },
      { kanji:'増える', kana:'ふえる',  romaji:'fueru',    en:'To Increase',group:'Group 2',verbType:'Ichidan Verb',
        present:'増える', past:'増えた',  negative:'増えない', te:'増えて',
        example:'人口が増えます。', translation:'The population increases.' },
      { kanji:'減る',   kana:'へる',   romaji:'heru',     en:'To Decrease',group:'Group 1',verbType:'Godan Verb',
        present:'減る',   past:'減った',  negative:'減らない', te:'減って',
        example:'体重が減ります。', translation:'Body weight decreases.' },
      { kanji:'通う',   kana:'かよう', romaji:'kayou',    en:'To Commute',group:'Group 1', verbType:'Godan Verb',
        present:'通う',   past:'通った',  negative:'通わない', te:'通って',
        example:'学校に通います。', translation:'I commute to school.' },
      { kanji:'調べる', kana:'しらべる',romaji:'shiraberu',en:'To Investigate',group:'Group 2',verbType:'Ichidan Verb',
        present:'調べる', past:'調べた',  negative:'調べない', te:'調べて',
        example:'意味を調べます。', translation:'I look up the meaning.' },
      { kanji:'集める', kana:'あつめる',romaji:'atsumeru',en:'To Collect', group:'Group 2', verbType:'Ichidan Verb',
        present:'集める', past:'集めた',  negative:'集めない', te:'集めて',
        example:'切手を集めます。', translation:'I collect stamps.' },
    ],
    N2: [
      { kanji:'改める', kana:'あらためる',romaji:'aratameru',en:'To Reform',group:'Group 2',verbType:'Ichidan Verb',
        present:'改める', past:'改めた',  negative:'改めない', te:'改めて',
        example:'態度を改めます。', translation:'I reform my attitude.' },
      { kanji:'抱える', kana:'かかえる',romaji:'kakaeru',  en:'To Hold/Carry',group:'Group 2',verbType:'Ichidan Verb',
        present:'抱える', past:'抱えた',  negative:'抱えない', te:'抱えて',
        example:'問題を抱えています。', translation:'I am holding a problem.' },
      { kanji:'諦める', kana:'あきらめる',romaji:'akirameru',en:'To Give Up',group:'Group 2',verbType:'Ichidan Verb',
        present:'諦める', past:'諦めた',  negative:'諦めない', te:'諦めて',
        example:'夢を諦めません。', translation:'I do not give up on my dream.' },
      { kanji:'補う',   kana:'おぎなう',romaji:'oginau',   en:'To Supplement',group:'Group 1',verbType:'Godan Verb',
        present:'補う',   past:'補った',  negative:'補わない', te:'補って',
        example:'不足を補います。', translation:'I compensate for the shortage.' },
      { kanji:'従う',   kana:'したがう',romaji:'shitagau', en:'To Obey',   group:'Group 1', verbType:'Godan Verb',
        present:'従う',   past:'従った',  negative:'従わない', te:'従って',
        example:'規則に従います。', translation:'I follow the rules.' },
      { kanji:'試みる', kana:'こころみる',romaji:'kokoromiru',en:'To Attempt',group:'Group 2',verbType:'Ichidan Verb',
        present:'試みる', past:'試みた',  negative:'試みない', te:'試みて',
        example:'新しい方法を試みます。', translation:'I attempt a new method.' },
    ],
    N1: [
      { kanji:'著す',   kana:'あらわす',romaji:'arawasu',  en:'To Write/Publish',group:'Group 1',verbType:'Godan Verb',
        present:'著す',   past:'著した',  negative:'著さない', te:'著して',
        example:'小説を著します。', translation:'I publish a novel.' },
      { kanji:'携わる', kana:'たずさわる',romaji:'tazusawaru',en:'To Be Engaged In',group:'Group 1',verbType:'Godan Verb',
        present:'携わる', past:'携わった',negative:'携わらない',te:'携わって',
        example:'研究に携わります。', translation:'I am engaged in research.' },
      { kanji:'見なす', kana:'みなす',  romaji:'minasu',   en:'To Deem',   group:'Group 1', verbType:'Godan Verb',
        present:'見なす', past:'見なした',negative:'見なさない',te:'見なして',
        example:'それを事実と見なします。', translation:'I deem that a fact.' },
      { kanji:'培う',   kana:'つちかう',romaji:'tsuchikau',en:'To Cultivate',group:'Group 1',verbType:'Godan Verb',
        present:'培う',   past:'培った',  negative:'培わない', te:'培って',
        example:'才能を培います。', translation:'I cultivate talent.' },
      { kanji:'顧みる', kana:'かえりみる',romaji:'kaerimiru',en:'To Reflect On',group:'Group 2',verbType:'Ichidan Verb',
        present:'顧みる', past:'顧みた',  negative:'顧みない', te:'顧みて',
        example:'過去を顧みます。', translation:'I reflect on the past.' },
      { kanji:'老いる', kana:'おいる',  romaji:'oiru',     en:'To Grow Old',group:'Group 2',verbType:'Ichidan Verb',
        present:'老いる', past:'老いた',  negative:'老いない', te:'老いて',
        example:'人は老います。', translation:'People grow old.' },
    ]
  };

  /* ── State ───────────────────────────────────────────────── */
  var STATE = {
    level:      'N5',
    queue:      [],
    idx:        0,
    screen:     'quiz',   // 'quiz' | 'result'
    selected:   null,
    stats:      { total:0, correct:0, wrong:0 },
    streak:     0,
    xp:         0,
    badges:     []
  };

  /* ── Persist progress in userData ───────────────────────── */
  function loadProgress() {
    var d = getUD();
    if (d.vgProgress) {
      try {
        var p = typeof d.vgProgress === 'string' ? JSON.parse(d.vgProgress) : d.vgProgress;
        STATE.stats   = p.stats   || STATE.stats;
        STATE.streak  = p.streak  || 0;
        STATE.xp      = p.xp      || 0;
        STATE.badges  = p.badges  || [];
      } catch(e) {}
    }
  }

  function saveProgress() {
    var d = getUD();
    d.vgProgress = JSON.stringify({
      stats:  STATE.stats,
      streak: STATE.streak,
      xp:     STATE.xp,
      badges: STATE.badges
    });
    saveUD(d);
  }

  /* ── Badge logic ─────────────────────────────────────────── */
  var BADGES = [
    { id:'beginner', label:'Verb Beginner',  emoji:'🏅', threshold:5  },
    { id:'explorer', label:'Verb Explorer',  emoji:'🎖️', threshold:20 },
    { id:'expert',   label:'Verb Expert',    emoji:'🥈', threshold:50 },
    { id:'master',   label:'Verb Master',    emoji:'🥇', threshold:100},
    { id:'sensei',   label:'Verb Sensei',    emoji:'👑', threshold:200}
  ];

  function checkBadges() {
    var total = STATE.stats.total;
    var newBadges = [];
    BADGES.forEach(function(b) {
      if (total >= b.threshold && STATE.badges.indexOf(b.id) === -1) {
        STATE.badges.push(b.id);
        newBadges.push(b);
      }
    });
    return newBadges;
  }

  /* ── Shuffle ─────────────────────────────────────────────── */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ── Build queue from selected level ─────────────────────── */
  function buildQueue(level) {
    STATE.level = level;
    STATE.queue = shuffle(VERB_DB[level] || VERB_DB['N5']);
    STATE.idx   = 0;
    STATE.screen = 'quiz';
    STATE.selected = null;
  }

  /* ── Audio via SpeechSynthesis ───────────────────────────── */
  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ja-JP';
    utt.rate = 0.85;
    // Try to find a Japanese voice
    var voices = window.speechSynthesis.getVoices();
    var jpVoice = voices.find(function(v){ return v.lang && v.lang.startsWith('ja'); });
    if (jpVoice) utt.voice = jpVoice;
    window.speechSynthesis.speak(utt);
  }

  /* ── CSS Injection ───────────────────────────────────────── */
  function injectCSS() {
    if ($id('nz-vg-styles')) return;
    var style = document.createElement('style');
    style.id = 'nz-vg-styles';
    style.textContent = [
      /* Main page wrapper */
      '.vg-page { max-width: 560px; margin: 0 auto; padding: 0; }',
      /* Header bar */
      '.vg-header { display:flex; align-items:center; gap:10px; margin-bottom:20px; }',
      '.vg-back-btn { background:none; border:1px solid var(--border); border-radius:var(--radius); padding:7px 12px; color:var(--fg-muted); font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; display:flex; align-items:center; gap:5px; transition:all var(--duration-fast) var(--ease); }',
      '.vg-back-btn:hover { background:var(--card-elevated); color:var(--fg); }',
      '.vg-header-title { font-size:16px; font-weight:800; color:var(--fg); letter-spacing:-.3px; }',
      '.vg-header-sub   { font-size:11px; color:var(--fg-muted); }',

      /* Level selector pills */
      '.vg-level-bar { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:18px; }',
      '.vg-lv-pill { padding:6px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1.5px solid; background:transparent; cursor:pointer; font-family:inherit; transition:all 150ms var(--ease); }',
      '.vg-lv-pill.active { color:#fff !important; }',

      /* Progress card */
      '.vg-prog-card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:14px 18px; margin-bottom:16px; display:flex; gap:16px; flex-wrap:wrap; align-items:center; }',
      '.vg-prog-stat { text-align:center; flex:1; min-width:60px; }',
      '.vg-prog-val  { font-size:22px; font-weight:800; font-family:var(--font-mono); color:var(--fg); line-height:1; }',
      '.vg-prog-lbl  { font-size:10px; color:var(--fg-muted); margin-top:2px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }',
      '.vg-prog-divider { width:1px; height:36px; background:var(--border); }',
      '.vg-streak-pill { display:flex; align-items:center; gap:5px; background:var(--card-elevated); border:1px solid var(--border); border-radius:var(--radius); padding:5px 10px; font-size:12px; font-weight:700; color:var(--accent); margin-left:auto; white-space:nowrap; }',

      /* Quiz card */
      '.vg-quiz-card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-xl); padding:28px 24px 24px; margin-bottom:16px; text-align:center; position:relative; overflow:hidden; transition:transform 250ms var(--ease); }',
      '.vg-quiz-card::before { content:\'\'; position:absolute; inset:0; background:linear-gradient(135deg, rgba(232,68,106,.04) 0%, transparent 60%); pointer-events:none; }',
      '.vg-kanji { font-family:var(--font-jp); font-size:72px; font-weight:700; color:var(--fg); line-height:1.1; margin-bottom:10px; animation:vgFadeUp .35s var(--ease) both; }',
      '@media(max-width:480px) { .vg-kanji { font-size:56px; } }',
      '.vg-meaning { font-size:18px; font-weight:600; color:var(--fg-muted); margin-bottom:6px; animation:vgFadeUp .35s .05s var(--ease) both; }',
      '.vg-kana    { font-family:var(--font-jp-sans); font-size:20px; color:var(--fg); animation:vgFadeUp .35s .10s var(--ease) both; }',
      '.vg-icon    { font-size:36px; margin:18px 0 12px; animation:vgFadeUp .35s .12s var(--ease) both; }',

      /* Audio button */
      '.vg-audio-btn { display:inline-flex; align-items:center; gap:7px; background:var(--card-elevated); border:1px solid var(--border); border-radius:var(--radius-full); padding:9px 20px; font-size:13px; font-weight:600; color:var(--fg-muted); font-family:inherit; cursor:pointer; transition:all var(--duration-fast) var(--ease); margin:4px 0 22px; animation:vgFadeUp .35s .15s var(--ease) both; }',
      '.vg-audio-btn:hover { background:var(--primary-dim); border-color:var(--primary); color:var(--primary); }',
      '.vg-audio-btn.playing { border-color:var(--primary); color:var(--primary); background:var(--primary-dim); }',

      /* Group buttons */
      '.vg-groups { display:flex; flex-direction:column; gap:10px; animation:vgFadeUp .35s .18s var(--ease) both; }',
      '.vg-group-btn { width:100%; padding:16px 20px; border-radius:var(--radius-lg); font-size:15px; font-weight:700; font-family:inherit; cursor:pointer; border:1.5px solid var(--border); background:var(--card-elevated); color:var(--fg); display:flex; align-items:center; justify-content:space-between; transition:all 150ms var(--ease); }',
      '.vg-group-btn:hover { border-color:var(--primary); background:var(--primary-dim); color:var(--primary); transform:translateX(3px); }',
      '.vg-group-btn:active { transform:scale(0.98); }',
      '.vg-group-badge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:var(--radius-full); background:var(--bg); color:var(--fg-muted); border:1px solid var(--border); }',

      /* Result card */
      '.vg-result-card { border-radius:var(--radius-xl); padding:24px; margin-bottom:16px; text-align:center; border:1.5px solid; animation:vgPop .3s var(--ease) both; }',
      '.vg-result-card.correct { background:rgba(74,222,128,.06); border-color:rgba(74,222,128,.35); }',
      '.vg-result-card.wrong   { background:rgba(232,68,106,.06);  border-color:rgba(232,68,106,.25); }',
      '.vg-result-icon  { font-size:44px; margin-bottom:8px; }',
      '.vg-result-title { font-size:24px; font-weight:800; margin-bottom:4px; }',
      '.vg-result-card.correct .vg-result-title { color:#4ade80; }',
      '.vg-result-card.wrong   .vg-result-title { color:var(--primary); }',
      '.vg-result-sub { font-size:14px; color:var(--fg-muted); }',
      '.vg-result-sub strong { color:var(--fg); }',
      '.vg-xp-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(201,151,58,.15); border:1px solid rgba(201,151,58,.35); border-radius:var(--radius-full); padding:5px 14px; font-size:13px; font-weight:700; color:var(--accent); margin-top:10px; animation:vgPop .4s .1s var(--ease) both; }',

      /* Detail card */
      '.vg-detail-card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-xl); overflow:hidden; margin-bottom:16px; animation:vgFadeUp .35s .1s var(--ease) both; }',
      '.vg-detail-header { background:var(--card-elevated); border-bottom:1px solid var(--border); padding:14px 18px; display:flex; align-items:center; gap:10px; }',
      '.vg-detail-kanji-big { font-family:var(--font-jp); font-size:40px; font-weight:700; color:var(--fg); line-height:1; }',
      '.vg-detail-right { flex:1; }',
      '.vg-detail-kana { font-family:var(--font-jp-sans); font-size:16px; color:var(--fg-muted); }',
      '.vg-detail-romaji { font-family:var(--font-mono); font-size:12px; color:var(--fg-subtle); margin-top:2px; }',
      '.vg-detail-body { padding:16px 18px; display:grid; grid-template-columns:1fr 1fr; gap:12px; }',
      '@media(max-width:400px) { .vg-detail-body { grid-template-columns:1fr; } }',
      '.vg-detail-row { display:flex; flex-direction:column; gap:3px; }',
      '.vg-detail-row.full { grid-column:1/-1; }',
      '.vg-detail-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--fg-subtle); }',
      '.vg-detail-val { font-size:14px; font-weight:600; color:var(--fg); }',
      '.vg-detail-val.jp { font-family:var(--font-jp-sans); font-size:15px; }',
      '.vg-conj-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; grid-column:1/-1; }',
      '.vg-conj-item { background:var(--card-elevated); border:1px solid var(--border); border-radius:var(--radius); padding:8px 10px; }',
      '.vg-conj-item-lbl { font-size:10px; color:var(--fg-muted); font-weight:600; }',
      '.vg-conj-item-val { font-family:var(--font-jp-sans); font-size:15px; font-weight:600; color:var(--fg); margin-top:2px; }',

      /* Continue button */
      '.vg-continue-btn { width:100%; padding:16px; border-radius:var(--radius-lg); font-size:16px; font-weight:800; font-family:inherit; cursor:pointer; background:var(--primary); color:#fff; border:none; display:flex; align-items:center; justify-content:center; gap:8px; transition:all var(--duration-fast) var(--ease); animation:vgFadeUp .35s .2s var(--ease) both; box-shadow:0 4px 20px rgba(232,68,106,.35); }',
      '.vg-continue-btn:hover { background:var(--primary-hover); transform:translateY(-2px); box-shadow:0 6px 28px rgba(232,68,106,.45); }',
      '.vg-continue-btn:active { transform:scale(0.98); }',

      /* Empty state */
      '.vg-empty { text-align:center; padding:48px 24px; color:var(--fg-muted); }',
      '.vg-empty-icon { font-size:48px; margin-bottom:12px; }',
      '.vg-empty-text { font-size:14px; }',

      /* Badges row */
      '.vg-badges { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }',
      '.vg-badge-chip { display:inline-flex; align-items:center; gap:5px; background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:5px 10px; font-size:11px; font-weight:600; color:var(--fg-muted); }',
      '.vg-badge-chip.earned { border-color:var(--accent); color:var(--accent); background:var(--accent-dim); }',

      /* Animations */
      '@keyframes vgFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }',
      '@keyframes vgPop    { 0%{opacity:0;transform:scale(.88)} 70%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }',
      '@keyframes vgShake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }',
      '@keyframes vgPulse  { 0%{box-shadow:0 0 0 0 rgba(74,222,128,.4)} 70%{box-shadow:0 0 0 10px rgba(74,222,128,0)} 100%{box-shadow:0 0 0 0 rgba(74,222,128,0)} }',
      '.vg-shake  { animation:vgShake .4s var(--ease); }',
      '.vg-pulse  { animation:vgPulse .6s var(--ease); }',
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── Render helpers ──────────────────────────────────────── */
  function renderLevelBar() {
    var lvls = ['N5','N4','N3','N2','N1'];
    return '<div class="vg-level-bar">' +
      lvls.map(function(lv) {
        var c   = jlptColor(lv);
        var act = lv === STATE.level;
        return '<button class="vg-lv-pill' + (act?' active':'') + '" ' +
          'style="border-color:'+c+';color:'+(act?'#fff':c)+';background:'+(act?c:'transparent')+';" ' +
          'onclick="window.NZVerbGroup.setLevel(\''+lv+'\')">' +
          jlptIcon(lv) + ' ' + lv +
          '</button>';
      }).join('') +
    '</div>';
  }

  function renderProgressCard() {
    var s  = STATE.stats;
    var acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    var xp  = STATE.xp;
    return '<div class="vg-prog-card">' +
      '<div class="vg-prog-stat"><div class="vg-prog-val" style="color:var(--fg)">' + s.total + '</div><div class="vg-prog-lbl">Questions</div></div>' +
      '<div class="vg-prog-divider"></div>' +
      '<div class="vg-prog-stat"><div class="vg-prog-val" style="color:#4ade80">' + s.correct + '</div><div class="vg-prog-lbl">Correct</div></div>' +
      '<div class="vg-prog-divider"></div>' +
      '<div class="vg-prog-stat"><div class="vg-prog-val" style="color:var(--primary)">' + s.wrong + '</div><div class="vg-prog-lbl">Wrong</div></div>' +
      '<div class="vg-prog-divider"></div>' +
      '<div class="vg-prog-stat"><div class="vg-prog-val" style="color:var(--accent)">' + acc + '%</div><div class="vg-prog-lbl">Accuracy</div></div>' +
      '<div class="vg-streak-pill">🔥 ' + STATE.streak + ' Streak</div>' +
    '</div>';
  }

  function renderBadges() {
    if (STATE.badges.length === 0) return '';
    return '<div class="vg-badges">' +
      BADGES.map(function(b){
        var earned = STATE.badges.indexOf(b.id) !== -1;
        return '<div class="vg-badge-chip' + (earned?' earned':'') + '">' + b.emoji + ' ' + b.label + '</div>';
      }).join('') +
    '</div>';
  }

  function renderQuizScreen() {
    var v = STATE.queue[STATE.idx];
    if (!v) return '<div class="vg-empty"><div class="vg-empty-icon">🎉</div><div class="vg-empty-text">All verbs done for this level!<br>Switch level or keep practicing.</div></div>';
    return '<div class="vg-quiz-card" id="vg-quiz-card">' +
      '<div class="vg-kanji">' + H(v.kanji) + '</div>' +
      '<div class="vg-meaning">(' + H(v.en) + ')</div>' +
      '<div class="vg-kana">' + H(v.kana) + '</div>' +
      '<div class="vg-icon">📝</div>' +
      '<button class="vg-audio-btn" id="vg-audio-btn" onclick="window.NZVerbGroup.playAudio()">' +
        '🔊 Listen Pronunciation' +
      '</button>' +
      '<div class="vg-groups">' +
        ['Group 1','Group 2','Group 3'].map(function(g){
          var labels = {'Group 1':'Godan Verb','Group 2':'Ichidan Verb','Group 3':'Irregular Verb'};
          return '<button class="vg-group-btn" onclick="window.NZVerbGroup.answer(\''+g+'\')">' +
            '<span>' + g + '</span>' +
            '<span class="vg-group-badge">' + (labels[g]||g) + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function renderResultScreen() {
    var v       = STATE.queue[STATE.idx];
    var correct = STATE.selected === v.group;
    var color   = correct ? '#4ade80' : 'var(--primary)';

    // Conjugations block
    var conjHTML = '';
    if (v.present || v.past || v.negative || v.te) {
      conjHTML = '<div class="vg-conj-grid">' +
        (v.present  ? '<div class="vg-conj-item"><div class="vg-conj-item-lbl">Present</div><div class="vg-conj-item-val">'  + H(v.present)  + '</div></div>' : '') +
        (v.past     ? '<div class="vg-conj-item"><div class="vg-conj-item-lbl">Past</div><div class="vg-conj-item-val">'     + H(v.past)     + '</div></div>' : '') +
        (v.negative ? '<div class="vg-conj-item"><div class="vg-conj-item-lbl">Negative</div><div class="vg-conj-item-val">' + H(v.negative) + '</div></div>' : '') +
        (v.te       ? '<div class="vg-conj-item"><div class="vg-conj-item-lbl">て-form</div><div class="vg-conj-item-val">'  + H(v.te)       + '</div></div>' : '') +
      '</div>';
    }

    return (
      /* Result feedback */
      '<div class="vg-result-card ' + (correct?'correct':'wrong') + '" id="vg-result-card">' +
        '<div class="vg-result-icon">' + (correct ? '✅' : '❌') + '</div>' +
        '<div class="vg-result-title">' + (correct ? 'Correct!' : 'Incorrect') + '</div>' +
        '<div class="vg-result-sub">You selected <strong>' + H(STATE.selected) + '</strong>' + (!correct ? ' · Correct: <strong>' + H(v.group) + '</strong>' : '') + '</div>' +
        (correct ? '<div class="vg-xp-badge">⚡ +10 XP</div>' : '') +
      '</div>' +

      /* Detail learning card */
      '<div class="vg-detail-card">' +
        '<div class="vg-detail-header">' +
          '<div class="vg-detail-kanji-big">' + H(v.kanji) + '</div>' +
          '<div class="vg-detail-right">' +
            '<div class="vg-detail-kana">' + H(v.kana) + '</div>' +
            (v.romaji ? '<div class="vg-detail-romaji">' + H(v.romaji) + '</div>' : '') +
          '</div>' +
          '<div style="margin-left:auto;">' +
            '<span style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:4px 10px;font-size:11px;font-weight:700;color:' + jlptColor(STATE.level) + ';">' + jlptIcon(STATE.level) + ' ' + STATE.level + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="vg-detail-body">' +
          '<div class="vg-detail-row"><div class="vg-detail-lbl">Meaning</div><div class="vg-detail-val">' + H(v.en) + '</div></div>' +
          '<div class="vg-detail-row"><div class="vg-detail-lbl">Verb Type</div><div class="vg-detail-val" style="color:' + color + '">' + H(v.verbType) + '</div></div>' +
          '<div class="vg-detail-row"><div class="vg-detail-lbl">Dictionary Form</div><div class="vg-detail-val jp">' + H(v.kanji) + '</div></div>' +
          '<div class="vg-detail-row"><div class="vg-detail-lbl">Group</div><div class="vg-detail-val" style="color:' + color + '">' + H(v.group) + '</div></div>' +
          (v.example ? '<div class="vg-detail-row full"><div class="vg-detail-lbl">Example</div><div class="vg-detail-val jp">' + H(v.example) + '</div>' + (v.translation ? '<div class="vg-detail-val" style="font-size:12px;color:var(--fg-muted);margin-top:3px;">' + H(v.translation) + '</div>' : '') + '</div>' : '') +
          conjHTML +
        '</div>' +
      '</div>' +

      /* Continue */
      '<button class="vg-continue-btn" onclick="window.NZVerbGroup.next()">Continue →</button>'
    );
  }

  /* ── Full page render ────────────────────────────────────── */
  function renderPage() {
    var root = $id('nz-vg-root');
    if (!root) return;

    var html = '<div class="vg-page">' +
      /* Header */
      '<div class="vg-header">' +
        '<button class="vg-back-btn" onclick="window.nzGo(\'vocab\')">← Vocabulary</button>' +
        '<div>' +
          '<div class="vg-header-title">動詞グループ · Verb Groups</div>' +
          '<div class="vg-header-sub">Identify the correct verb classification</div>' +
        '</div>' +
      '</div>' +

      /* Level selector */
      renderLevelBar() +

      /* Progress */
      renderProgressCard() +

      /* Badges */
      renderBadges() +

      /* Screen */
      '<div id="vg-screen">' +
        (STATE.screen === 'quiz' ? renderQuizScreen() : renderResultScreen()) +
      '</div>' +

    '</div>';

    root.innerHTML = html;
  }

  /* ── Public API ──────────────────────────────────────────── */
  window.NZVerbGroup = {

    setLevel: function(lv) {
      buildQueue(lv);
      renderPage();
    },

    playAudio: function() {
      var v = STATE.queue[STATE.idx];
      if (!v) return;
      var btn = $id('vg-audio-btn');
      if (btn) { btn.classList.add('playing'); btn.textContent = '🔊 Playing…'; }
      speak(v.kana || v.kanji);
      setTimeout(function() {
        var b = $id('vg-audio-btn');
        if (b) { b.classList.remove('playing'); b.innerHTML = '🔊 Listen Pronunciation'; }
      }, 2500);
    },

    answer: function(selected) {
      var v       = STATE.queue[STATE.idx];
      var correct = selected === v.group;

      STATE.selected = selected;
      STATE.screen   = 'result';
      STATE.stats.total++;

      if (correct) {
        STATE.stats.correct++;
        STATE.streak++;
        STATE.xp += 10;
      } else {
        STATE.stats.wrong++;
        STATE.streak = 0;
      }

      // Check badges
      var newBadges = checkBadges();

      saveProgress();

      // Update XP in userData for platform integration
      var d = getUD();
      d.xp = (d.xp || 0) + (correct ? 10 : 0);
      saveUD(d);

      renderPage();

      // Animate result card
      setTimeout(function() {
        var card = $id('vg-result-card');
        if (!card) return;
        if (correct) {
          card.classList.add('vg-pulse');
        } else {
          card.classList.add('vg-shake');
        }
        // Show badge toast if earned
        newBadges.forEach(function(b) {
          nzShowToast(b.emoji + ' Badge unlocked: ' + b.label + '!', 'success');
        });
        if (correct) {
          nzShowToast('⚡ +10 XP — Correct!', 'success');
        }
      }, 50);
    },

    next: function() {
      STATE.idx++;
      if (STATE.idx >= STATE.queue.length) {
        // Reshuffle for endless mode
        STATE.queue = shuffle(STATE.queue);
        STATE.idx   = 0;
      }
      STATE.screen   = 'quiz';
      STATE.selected = null;

      var root = $id('nz-vg-root');
      if (root) {
        root.style.opacity = '0';
        root.style.transition = 'opacity 120ms';
        setTimeout(function() {
          renderPage();
          var r = $id('nz-vg-root');
          if (r) {
            r.style.opacity = '1';
            r.style.transition = 'opacity 200ms';
          }
        }, 120);
      }
    }
  };

  /* ── Pages.verbGroup ─────────────────────────────────────── */
  function mountVerbGroup() {
    loadProgress();
    injectCSS();
    setHTML('<div id="nz-vg-root" style="min-height:60vh;"></div>');
    buildQueue(STATE.level);
    renderPage();
  }

  /* ── Register route ──────────────────────────────────────── */
  function registerRoute() {
    if (window.Pages) {
      window.Pages['verb-group'] = mountVerbGroup;
    }
    if (window.NzRouter && window.NzRouter.register) {
      window.NzRouter.register('verb-group', mountVerbGroup);
    }
    if (window.Router && window.Router.register) {
      window.Router.register('verb-group', mountVerbGroup);
    }
  }

  /* ── Inject "Verb Group" button into Vocabulary page ─────── */
  function injectVerbGroupButton() {
    var page = document.querySelector('#nz-content');
    if (!page) return;
    if (document.getElementById('nz-vg-inject-btn')) return;

    var srsRow = document.getElementById('nz-vocab-srs-row');
    if (!srsRow) return;  // Vocab page not rendered yet

    var color = 'var(--n5)'; // Green, matching verb/N5 theme
    var btn   = document.createElement('button');
    btn.id    = 'nz-vg-inject-btn';
    btn.style.cssText =
      'padding:7px 16px;border-radius:9px;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;' +
      'letter-spacing:.02em;display:inline-flex;align-items:center;gap:6px;' +
      'border:1.5px solid var(--primary);background:transparent;color:var(--primary);' +
      'transition:all .15s;margin-left:4px;';
    btn.innerHTML = '📝 Verb Groups';
    btn.onmouseover = function() {
      this.style.background = 'var(--primary)';
      this.style.color      = '#fff';
    };
    btn.onmouseout = function() {
      this.style.background = 'transparent';
      this.style.color      = 'var(--primary)';
    };
    btn.onclick = function() { nzGo('verb-group'); };

    // Add a label before the button
    var label = document.createElement('span');
    label.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--fg-muted);margin-left:12px;';
    label.innerHTML = '<span style="font-size:14px;">|</span> Quizzes:';

    srsRow.appendChild(label);
    srsRow.appendChild(btn);
  }

  /* ── Patch Pages.vocab to inject the button after mount ─── */
  function patchVocabPage() {
    if (!window.Pages || !window.Pages.vocab) {
      setTimeout(patchVocabPage, 100);
      return;
    }
    var _orig = window.Pages.vocab;
    window.Pages.vocab = function() {
      _orig.apply(this, arguments);
      setTimeout(injectVerbGroupButton, 50);
    };
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function boot() {
    registerRoute();
    patchVocabPage();

    // Also re-inject if vocab page is already active
    document.addEventListener('nz:pageChange', function(e) {
      if (e && e.detail && e.detail.route === 'vocab') {
        setTimeout(injectVerbGroupButton, 80);
      }
    });
  }

  // Wait for DOM + existing scripts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Also hook into nz:userReady which fires after auth
  document.addEventListener('nz:userReady', function() {
    registerRoute();
    // If we're on vocab page already, inject
    setTimeout(injectVerbGroupButton, 100);
  });

})();
