/* ════════════════════════════════════════════════════════════════
   NZ CONVERSATION MODULE
   会話 — Conversation Practice
   Sidebar page with original card-based + chat-bubble UI (distinct
   from the "Listening" dialogues page). Lets the learner browse
   roleplay scenarios by JLPT difficulty, play them back line-by-line
   or in full via the Web Speech API (speechSynthesis), and tracks
   daily practice via the shared dot indicator.
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Helpers shared with main app (fallbacks if not yet loaded) ── */
  function H(s) {
    if (window.H) return window.H(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function jlptColor(lv) {
    if (window.jlptColor) return window.jlptColor(lv);
    return { N5: '#4CAF82', N4: '#5B9BD5', N3: '#C9973A', N2: '#9B6DD5', N1: '#E8446A' }[lv] || 'var(--primary)';
  }
  function $id(id) { return document.getElementById(id); }

  /* ── Shared fox mascot (used here + on the JLPT overview page) ──
     Simple flat-illustration chibi fox, orange with a green scarf,
     matching the reference screenshots. Two poses: 'wave' (default
     tip/encouragement spots) and 'mic' (practice & speaking spots). */
  function nzFoxSVG(size, pose) {
    size = size || 72;
    var h = Math.round(size * 130 / 120);
    var prop = pose === 'mic'
      ? '<g><ellipse cx="40" cy="72" rx="8" ry="15" fill="#F0812E" transform="rotate(-48 40 72)"/>' +
          '<circle cx="53" cy="57" r="7.5" fill="#FFF3E0"/>' +
          '<rect x="50" y="38" width="6" height="19" rx="3" fill="#5B5B66" transform="rotate(-6 53 47)"/>' +
          '<circle cx="52.5" cy="36" r="7.5" fill="#33333d"/>' +
          '<circle cx="52.5" cy="36" r="7.5" fill="none" stroke="#4a4a56" stroke-width="1.4"/></g>'
      : '<g transform="rotate(-26 40 60)"><ellipse cx="33" cy="66" rx="8" ry="16" fill="#F0812E"/>' +
          '<circle cx="29" cy="49" r="8" fill="#FFF3E0"/></g>';
    return '<svg viewBox="0 0 120 130" width="' + size + '" height="' + h + '" ' +
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block;overflow:visible;">' +
        '<path d="M88 96C108 92 116 74 106 58C118 66 122 88 104 104C98 110 90 108 88 96Z" fill="#F0812E"/>' +
        '<path d="M104 62C110 68 110 78 104 84" fill="none" stroke="#FFF3E0" stroke-width="6" stroke-linecap="round"/>' +
        '<ellipse cx="58" cy="98" rx="30" ry="26" fill="#F0812E"/>' +
        '<ellipse cx="58" cy="105" rx="17" ry="16" fill="#FFF3E0"/>' +
        '<ellipse cx="44" cy="122" rx="9" ry="7" fill="#FFF3E0"/>' +
        '<ellipse cx="72" cy="122" rx="9" ry="7" fill="#FFF3E0"/>' +
        '<ellipse cx="30" cy="98" rx="8" ry="14" fill="#F0812E" transform="rotate(14 30 98)"/>' +
        '<path d="M36 78Q58 92 80 78L80 85Q58 99 36 85Z" fill="#3FA36B"/>' +
        '<path d="M64 82L73 101L58 94Z" fill="#358f5c"/>' +
        '<circle cx="58" cy="52" r="28" fill="#F0812E"/>' +
        '<path d="M32 34L22 8L48 26Z" fill="#F0812E"/>' +
        '<path d="M35 30L29 14L45 26Z" fill="#FFDFC0"/>' +
        '<path d="M84 34L94 8L68 26Z" fill="#F0812E"/>' +
        '<path d="M81 30L87 14L71 26Z" fill="#FFDFC0"/>' +
        '<ellipse cx="58" cy="60" rx="15" ry="11" fill="#FFF3E0"/>' +
        '<ellipse cx="58" cy="58" rx="3" ry="2.4" fill="#2B1E14"/>' +
        '<path d="M58 61Q58 65 62 66" stroke="#2B1E14" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="47" cy="49" rx="4" ry="5.5" fill="#2B1E14"/>' +
        '<ellipse cx="69" cy="49" rx="4" ry="5.5" fill="#2B1E14"/>' +
        '<circle cx="48.5" cy="47" r="1.2" fill="#fff"/>' +
        '<circle cx="70.5" cy="47" r="1.2" fill="#fff"/>' +
        '<ellipse cx="38" cy="56" rx="6" ry="4" fill="#FF8F6B" opacity=".45"/>' +
        '<ellipse cx="78" cy="56" rx="6" ry="4" fill="#FF8F6B" opacity=".45"/>' +
        prop +
      '</svg>';
  }
  window.nzFoxSVG = window.nzFoxSVG || nzFoxSVG;

  /* ── Scenario data ──────────────────────────────────────────── */
  var SCENARIOS = [
    {
      id: 'conv-cafe', level: 'N5', icon: '☕', title: 'Ordering at a Café',
      titleJp: 'カフェで注文する',
      desc: 'Order a drink and a snack from a friendly barista.',
      participants: ['Staff', 'You'],
      lines: [
        { who: 'Staff', jp: 'いらっしゃいませ。ご注文は何にしますか。', romaji: 'Irasshaimase. Go-chūmon wa nani ni shimasu ka.', en: 'Welcome. What would you like to order?' },
        { who: 'You',   jp: 'コーヒーを一つお願いします。', romaji: 'Kōhī o hitotsu onegai shimasu.', en: 'One coffee, please.' },
        { who: 'Staff', jp: 'サイズはいかがしますか。', romaji: 'Saizu wa ikaga shimasu ka.', en: 'What size would you like?' },
        { who: 'You',   jp: 'Mサイズでお願いします。', romaji: 'Emu saizu de onegai shimasu.', en: 'Medium size, please.' },
        { who: 'Staff', jp: '他に何かございますか。', romaji: 'Hoka ni nani ka gozaimasu ka.', en: 'Anything else?' },
        { who: 'You',   jp: 'チーズケーキも一つください。', romaji: 'Chīzukēki mo hitotsu kudasai.', en: 'A cheesecake as well, please.' },
        { who: 'Staff', jp: 'かしこまりました。少々お待ちください。', romaji: 'Kashikomarimashita. Shōshō omachi kudasai.', en: 'Certainly. Please wait a moment.' }
      ]
    },
    {
      id: 'conv-intro', level: 'N5', icon: '🙋', title: 'Introducing Yourself',
      titleJp: '自己紹介',
      desc: 'Meet someone new and exchange basic information.',
      participants: ['Tanaka', 'You'],
      lines: [
        { who: 'Tanaka', jp: 'はじめまして。田中です。', romaji: 'Hajimemashite. Tanaka desu.', en: 'Nice to meet you. I\'m Tanaka.' },
        { who: 'You',    jp: 'はじめまして。よろしくお願いします。', romaji: 'Hajimemashite. Yoroshiku onegai shimasu.', en: 'Nice to meet you too. Pleased to meet you.' },
        { who: 'Tanaka', jp: 'お名前は何ですか。', romaji: 'O-namae wa nan desu ka.', en: 'What is your name?' },
        { who: 'You',    jp: '私の名前はアレックスです。', romaji: 'Watashi no namae wa Arekkusu desu.', en: 'My name is Alex.' },
        { who: 'Tanaka', jp: 'どちらから来ましたか。', romaji: 'Dochira kara kimashita ka.', en: 'Where are you from?' },
        { who: 'You',    jp: 'アメリカから来ました。', romaji: 'Amerika kara kimashita.', en: 'I came from America.' }
      ]
    },
    {
      id: 'conv-directions', level: 'N4', icon: '🗺️', title: 'Asking for Directions',
      titleJp: '道を尋ねる',
      desc: 'Find your way to the train station as a tourist.',
      participants: ['You', 'Local'],
      lines: [
        { who: 'You',   jp: 'すみません、駅はどこですか。', romaji: 'Sumimasen, eki wa doko desu ka.', en: 'Excuse me, where is the station?' },
        { who: 'Local', jp: 'この道をまっすぐ行ってください。', romaji: 'Kono michi o massugu itte kudasai.', en: 'Please go straight along this road.' },
        { who: 'You',   jp: 'どのくらいかかりますか。', romaji: 'Dono kurai kakarimasu ka.', en: 'About how long does it take?' },
        { who: 'Local', jp: '歩いて十分くらいです。', romaji: 'Aruite juppun kurai desu.', en: 'About ten minutes on foot.' },
        { who: 'You',   jp: '信号を渡ったほうがいいですか。', romaji: 'Shingō o watatta hō ga ii desu ka.', en: 'Should I cross at the traffic light?' },
        { who: 'Local', jp: 'はい、二つ目の信号を右に曲がってください。', romaji: 'Hai, futatsume no shingō o migi ni magatte kudasai.', en: 'Yes, turn right at the second light.' },
        { who: 'You',   jp: 'わかりました。ありがとうございます。', romaji: 'Wakarimashita. Arigatō gozaimasu.', en: 'I understand. Thank you very much.' }
      ]
    },
    {
      id: 'conv-restaurant', level: 'N4', icon: '🍜', title: 'At a Restaurant',
      titleJp: 'レストランで',
      desc: 'Reserve a table and ask about the menu.',
      participants: ['Staff', 'You'],
      lines: [
        { who: 'Staff', jp: '何名様でしょうか。', romaji: 'Nan-mei-sama deshō ka.', en: 'How many people?' },
        { who: 'You',   jp: '二人です。予約はしていません。', romaji: 'Futari desu. Yoyaku wa shite imasen.', en: 'Two people. We don\'t have a reservation.' },
        { who: 'Staff', jp: '少々お待ちいただけますか。', romaji: 'Shōshō omachi itadakemasu ka.', en: 'Could you wait a moment?' },
        { who: 'You',   jp: 'おすすめは何ですか。', romaji: 'Osusume wa nan desu ka.', en: 'What do you recommend?' },
        { who: 'Staff', jp: '今日のおすすめは天ぷら定食です。', romaji: 'Kyō no osusume wa tenpura teishoku desu.', en: 'Today\'s recommendation is the tempura set meal.' },
        { who: 'You',   jp: 'それを二つお願いします。', romaji: 'Sore o futatsu onegai shimasu.', en: 'Two of those, please.' }
      ]
    },
    {
      id: 'conv-hospital', level: 'N3', icon: '🏥', title: 'At the Clinic',
      titleJp: '病院で',
      desc: 'Describe your symptoms to a doctor.',
      participants: ['Doctor', 'You'],
      lines: [
        { who: 'Doctor', jp: 'どうしましたか。', romaji: 'Dō shimashita ka.', en: 'What seems to be the problem?' },
        { who: 'You',    jp: '朝から頭が痛くて、熱もあります。', romaji: 'Asa kara atama ga itakute, netsu mo arimasu.', en: 'My head has hurt since this morning, and I have a fever too.' },
        { who: 'Doctor', jp: '他に症状はありますか。咳は出ますか。', romaji: 'Hoka ni shōjō wa arimasu ka. Seki wa demasu ka.', en: 'Any other symptoms? Do you have a cough?' },
        { who: 'You',    jp: '少し咳が出ますが、のどは痛くないです。', romaji: 'Sukoshi seki ga demasu ga, nodo wa itakunai desu.', en: 'I have a slight cough, but my throat doesn\'t hurt.' },
        { who: 'Doctor', jp: 'お薬を出しますので、一日三回飲んでください。', romaji: 'Okusuri o dashimasu node, ichinichi sankai nonde kudasai.', en: 'I\'ll prescribe medicine, so please take it three times a day.' },
        { who: 'You',    jp: 'わかりました。お風呂に入っても大丈夫ですか。', romaji: 'Wakarimashita. Ofuro ni haitte mo daijōbu desu ka.', en: 'Understood. Is it okay to take a bath?' },
        { who: 'Doctor', jp: '熱が下がるまでは控えたほうがいいですね。', romaji: 'Netsu ga sagaru made wa hikaeta hō ga ii desu ne.', en: 'It\'s best to avoid it until your fever goes down.' }
      ]
    },
    {
      id: 'conv-job', level: 'N3', icon: '💼', title: 'Job Interview',
      titleJp: '面接',
      desc: 'Answer common questions during a job interview.',
      participants: ['Interviewer', 'You'],
      lines: [
        { who: 'Interviewer', jp: '自己紹介をお願いします。', romaji: 'Jiko shōkai o onegai shimasu.', en: 'Please introduce yourself.' },
        { who: 'You',         jp: '大学でマーケティングを専攻していました。', romaji: 'Daigaku de mākotingu o senkō shite imashita.', en: 'I majored in marketing at university.' },
        { who: 'Interviewer', jp: 'なぜこの会社で働きたいのですか。', romaji: 'Naze kono kaisha de hatarakitai no desu ka.', en: 'Why do you want to work at this company?' },
        { who: 'You',         jp: '御社の製品にとても興味があるからです。', romaji: 'Onsha no seihin ni totemo kyōmi ga aru kara desu.', en: 'Because I\'m very interested in your company\'s products.' },
        { who: 'Interviewer', jp: '長所と短所を教えてください。', romaji: 'Chōsho to tansho o oshiete kudasai.', en: 'Please tell me your strengths and weaknesses.' },
        { who: 'You',         jp: '長所は責任感が強いことで、短所は少し緊張しやすいことです。', romaji: 'Chōsho wa sekininkan ga tsuyoi koto de, tansho wa sukoshi kinchō shi yasui koto desu.', en: 'My strength is a strong sense of responsibility, and my weakness is that I get nervous easily.' }
      ]
    },
    {
      id: 'conv-business', level: 'N2', icon: '🤝', title: 'Business Meeting',
      titleJp: '商談',
      desc: 'Discuss a proposal with a business partner.',
      participants: ['Partner', 'You'],
      lines: [
        { who: 'Partner', jp: '本日はお時間をいただき、ありがとうございます。', romaji: 'Honjitsu wa ojikan o itadaki, arigatō gozaimasu.', en: 'Thank you for taking the time today.' },
        { who: 'You',     jp: 'こちらこそ、よろしくお願いいたします。', romaji: 'Kochira koso, yoroshiku onegai itashimasu.', en: 'Likewise, thank you for meeting with us.' },
        { who: 'Partner', jp: '早速ですが、新しい提案について説明させていただきます。', romaji: 'Sassoku desu ga, atarashii teian ni tsuite setsumei sasete itadakimasu.', en: 'Let\'s get right to it — I\'ll explain the new proposal.' },
        { who: 'You',     jp: 'その件について、いくつか質問させていただいてもよろしいでしょうか。', romaji: 'Sono ken ni tsuite, ikutsuka shitsumon sasete itadaite mo yoroshii deshō ka.', en: 'May I ask a few questions about this matter?' },
        { who: 'Partner', jp: 'もちろんです。何でもお聞きください。', romaji: 'Mochiron desu. Nandemo okiki kudasai.', en: 'Of course. Please ask anything.' },
        { who: 'You',     jp: '予算については来週までにお返事いたします。', romaji: 'Yosan ni tsuite wa raishū made ni okaeji itashimasu.', en: 'Regarding the budget, we will respond by next week.' }
      ]
    },
    {
      id: 'conv-debate', level: 'N1', icon: '🎓', title: 'Academic Discussion',
      titleJp: '学術的な議論',
      desc: 'Discuss the pros and cons of remote work.',
      participants: ['Colleague', 'You'],
      lines: [
        { who: 'Colleague', jp: '最近、リモートワークの導入が進んでいますが、どう思われますか。', romaji: 'Saikin, rimōto wāku no dōnyū ga susunde imasu ga, dō omowaremasu ka.', en: 'Remote work has been spreading lately — what do you think about it?' },
        { who: 'You',       jp: '生産性の向上につながる一方で、コミュニケーション不足が課題になり得ると思います。', romaji: 'Seisansei no kōjō ni tsunagaru ippō de, komyunikēshon busoku ga kadai ni narieru to omoimasu.', en: 'While it can boost productivity, I think a lack of communication could become a problem.' },
        { who: 'Colleague', jp: 'なるほど。それを解決するにはどうすればよいでしょうか。', romaji: 'Naruhodo. Sore o kaiketsu suru ni wa dō sureba yoi deshō ka.', en: 'I see. How could that be resolved?' },
        { who: 'You',       jp: '定期的なオンライン会議を設けることが有効ではないでしょうか。', romaji: 'Teikiteki na onrain kaigi o mōkeru koto ga yūkō de wa nai deshō ka.', en: 'Wouldn\'t it be effective to set up regular online meetings?' },
        { who: 'Colleague', jp: 'おっしゃる通りですね。柔軟な働き方と組織の一体感、両方が重要ということですね。', romaji: 'Ossharu tōri desu ne. Jūnan na hatarakikata to soshiki no ittaikan, ryōhō ga jūyō to iu koto desu ne.', en: 'You\'re right. So both flexible work styles and a sense of organizational unity matter.' }
      ]
    }
  ];

  var LEVELS = ['All', 'N5', 'N4', 'N3', 'N2', 'N1'];
  var LEVEL_ICON = { All: '✨', N5: '🌱', N4: '🌿', N3: '🌳', N2: '🏯', N1: '🗻' };

  /* ── State ──────────────────────────────────────────────────── */
  var state = {
    step: 'levels',   // 'levels' | 'list' | 'detail'
    filter: 'All',
    selected: null,
    isPlaying: false,
    showRomaji: true,
    showEn: true,
    speed: 0.85
  };
  var LEVEL_HEX = { N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444' };
  function levelScenarioCount(lv) {
    return SCENARIOS.filter(function (s) { return s.level === lv; }).length;
  }

  /* ── Completed / bookmarked tracking (localStorage, additive & harmless) ── */
  function loadSet(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
  }
  function saveSet(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
  }
  function markScenarioComplete(id) {
    var done = loadSet('nz_conv_completed');
    if (done.indexOf(id) === -1) { done.push(id); saveSet('nz_conv_completed', done); }
  }
  function isBookmarked(id) { return loadSet('nz_conv_bookmarks').indexOf(id) !== -1; }
  function toggleBookmark(id) {
    var b = loadSet('nz_conv_bookmarks');
    var i = b.indexOf(id);
    if (i === -1) b.push(id); else b.splice(i, 1);
    saveSet('nz_conv_bookmarks', b);
  }
  function levelStats(lv) {
    var ids = SCENARIOS.filter(function (s) { return s.level === lv; }).map(function (s) { return s.id; });
    var done = loadSet('nz_conv_completed');
    var bm = loadSet('nz_conv_bookmarks');
    var completed = ids.filter(function (id) { return done.indexOf(id) !== -1; }).length;
    var bookmarked = ids.filter(function (id) { return bm.indexOf(id) !== -1; }).length;
    return { total: ids.length, completed: completed, bookmarked: bookmarked,
      pct: ids.length ? Math.round(completed / ids.length * 100) : 0 };
  }

  var LEVEL_DESC = {
    N5: 'Basic conversations for everyday situations.',
    N4: 'Expand conversations and express more.',
    N3: 'Intermediate conversations for daily life.',
    N2: 'Advanced conversations for complex topics.',
    N1: 'Native-level conversations and expressions.'
  };

  /* ── Render: Level Selection (matches reference layout) ── */
  function renderLevels(root) {
    var LVLS = ['N5', 'N4', 'N3', 'N2', 'N1'];
    var totalScenarios = SCENARIOS.length;
    var totalCompleted = loadSet('nz_conv_completed').filter(function (id) {
      return SCENARIOS.some(function (s) { return s.id === id; });
    }).length;
    var overallPct = totalScenarios ? Math.round(totalCompleted / totalScenarios * 100) : 0;
    var days = window.NzDailyTracker ? window.NzDailyTracker.getLastDays(7) : [];
    var streak = 0;
    for (var i = days.length - 1; i >= 0; i--) { if (days[i].done) streak++; else if (!days[i].isToday) break; }

    root.innerHTML =
      '<div class="nz-page nz-fadein">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:18px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">' +
              '<span style="font-family:\'Noto Serif JP\',serif;font-size:22px;color:var(--fg);font-weight:700;letter-spacing:-.3px;">会話</span>' +
              '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0;letter-spacing:-.4px;">Conversation Practice</h1>' +
            '</div>' +
            '<p style="font-size:13px;color:var(--fg-muted);margin:0;">Roleplay real-life scenarios and practice speaking &amp; listening</p>' +
          '</div>' +
          '<button class="nz-btn nz-btn-ghost" onclick="nzGo(\'progress\')">📊 Practice Stats</button>' +
        '</div>' +

        '<div class="nz-lvlrow-header">' +
          '<div class="nz-lvlrow-stat"><div class="nz-lvlrow-stat-num">💬 ' + totalScenarios + '</div><div class="nz-lvlrow-stat-label">Total Scenarios<br>Available</div></div>' +
          '<div class="nz-lvlrow-stat"><div class="nz-lvlrow-stat-num" style="color:var(--n5);">✅ ' + totalCompleted + '</div><div class="nz-lvlrow-stat-label">Completed<br>Scenarios</div></div>' +
          '<div class="nz-lvlrow-stat"><div class="nz-lvlrow-stat-num" style="color:var(--accent);">🔥 ' + streak + '</div><div class="nz-lvlrow-stat-label">Day Streak</div></div>' +
          '<div class="nz-lvlrow-stat"><div class="nz-ring" style="--pct:' + overallPct + ';"><span>' + overallPct + '%</span></div><div class="nz-lvlrow-stat-label">Overall Progress</div></div>' +
        '</div>' +

        '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px 20px;margin-bottom:18px;">' +
          '<span style="font-size:13px;font-weight:700;color:var(--fg-muted);">This week</span>' +
          '<div id="nz-conv-dots" data-nz-daily-dots="7"></div>' +
          '<div style="margin-left:auto;display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:12px;color:var(--fg-muted);max-width:170px;text-align:right;">Practice every day to build confidence! ✨</span>' +
            nzFoxSVG(56, 'wave') +
          '</div>' +
        '</div>' +

        '<div class="nz-lvl-grid2">' +
          LVLS.map(function (lvl) {
            var c = LEVEL_HEX[lvl];
            var st = levelStats(lvl);
            var btnLabel = st.completed > 0 ? 'Continue Practice' : 'Start Practice';
            return '<div class="nz-lvlcard2" data-level="' + lvl + '" style="--lvl-color:' + c + ';--lvl-color-dim:' + c + '22;">' +
              '<div class="nz-lvlcard2-head">' +
                '<div class="nz-lvlcard2-icon">' + LEVEL_ICON[lvl] + '</div>' +
                '<div>' +
                  '<div class="nz-lvlcard2-title"><h3>' + lvl + '</h3><span class="nz-lvlcard2-jlpt">JLPT</span></div>' +
                  '<p class="nz-lvlcard2-sub">' + st.total + ' scenarios</p>' +
                '</div>' +
              '</div>' +
              '<p class="nz-lvlcard2-desc">' + H(LEVEL_DESC[lvl] || '') + '</p>' +
              '<div class="nz-lvlcard2-meta">' +
                '<span>🎧 ' + st.completed + ' Completed</span>' +
                '<span>🔖 ' + st.bookmarked + ' Bookmarked</span>' +
              '</div>' +
              '<div class="nz-progressbar-row" style="padding:0;border:none;background:none;margin:0;gap:10px;">' +
                '<div style="flex:1;"><div class="nz-progressbar-track"><div class="nz-progressbar-fill" style="width:' + st.pct + '%;background:' + c + ';"></div></div></div>' +
                '<span style="font-size:12px;font-weight:700;color:var(--fg-muted);">' + st.pct + '%</span>' +
              '</div>' +
              '<button class="nz-lvlcard2-btn" data-open-level="' + lvl + '">' + btnLabel + ' ›</button>' +
            '</div>';
          }).join('') +
          '<div class="nz-lvlcard2" style="--lvl-color:var(--accent);justify-content:center;">' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
              '<h3 style="font-size:16px;font-weight:800;color:var(--fg);margin:0;">🎙️ Practice &amp; Improve</h3>' +
            '</div>' +
            '<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;font-size:12.5px;color:var(--fg-muted);">' +
              '<li>💬 Roleplay real-life situations</li>' +
              '<li>🎧 Improve speaking &amp; listening</li>' +
              '<li>🎤 Get AI feedback on your speaking</li>' +
              '<li>📈 Track your progress</li>' +
            '</ul>' +
            '<div style="text-align:center;margin-top:2px;">' + nzFoxSVG(84, 'mic') + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="nz-goalbanner">' +
          '<div class="nz-goalbanner-text">🎯 <b>Daily Conversation Goal</b><br>Complete at least 1 scenario today to keep your streak going!</div>' +
          '<button class="nz-btn nz-btn-pri" style="background:var(--n5);" onclick="nzGo(\'progress\')">Set Goal ›</button>' +
        '</div>' +
      '</div>';

    root.querySelectorAll('[data-open-level]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.filter = btn.getAttribute('data-open-level');
        state.step = 'list';
        renderList(root);
      });
    });
    if (window.NzDailyTracker) window.NzDailyTracker.refreshAll();
  }

  /* ── Speech ─────────────────────────────────────────────────── */
  function speakLine(text, rate, pitch) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'ja-JP';
    u.rate = rate || state.speed;
    u.pitch = pitch || 1;
    window.speechSynthesis.speak(u);
  }

  function speakLineAsync(text, rate, pitch, pauseAfter) {
    return new Promise(function (resolve) {
      if (!window.speechSynthesis || !text) { setTimeout(resolve, pauseAfter || 400); return; }
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'ja-JP';
      u.rate = rate || state.speed;
      u.pitch = pitch || 1;
      u.onend = function () { setTimeout(resolve, pauseAfter || 400); };
      u.onerror = function () { resolve(); };
      window.speechSynthesis.speak(u);
    });
  }

  /* ── Render: list view ─────────────────────────────────────── */
  function renderList(root) {
    var list = state.filter === 'All' ? SCENARIOS : SCENARIOS.filter(function (s) { return s.level === state.filter; });

    root.innerHTML =
      '<div class="nz-page nz-fadein">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:18px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">' +
              '<span style="font-family:\'Noto Serif JP\',serif;font-size:22px;color:var(--fg);font-weight:700;letter-spacing:-.3px;">会話</span>' +
              '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0;letter-spacing:-.4px;">Conversation Practice</h1>' +
            '</div>' +
            '<p style="font-size:13px;color:var(--fg-muted);margin:0;">Roleplay real-life scenarios and practice speaking &amp; listening</p>' +
          '</div>' +
          '<div id="nz-conv-dots" data-nz-daily-dots="7" data-nz-daily-title="This week" ' +
            'style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 14px;"></div>' +
        '</div>' +

        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;align-items:center;">' +
          '<button data-conv-back-levels class="nz-flow-back" style="margin-right:4px;">← Back to Levels</button>' +
          '<span style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:800;' +
            'color:' + jlptColor(state.filter) + ';background:' + jlptColor(state.filter) + '18;' +
            'border:1px solid ' + jlptColor(state.filter) + ';padding:6px 14px;border-radius:8px;">' +
            LEVEL_ICON[state.filter] + ' ' + state.filter + '</span>' +
          '<button data-conv-to-pron class="nz-btn nz-btn-ghost" style="font-size:12px;padding:9px 14px;margin-left:auto;">' +
            '🔊 Pronunciation Practice →</button>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px;">' +
          list.map(function (s) {
            var c = jlptColor(s.level);
            return '<div class="nz-card nz-hoverable" data-conv-open="' + s.id + '" ' +
              'style="padding:0;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;">' +
                '<div style="padding:18px 18px 14px;background:linear-gradient(135deg,' + c + '22,transparent);' +
                  'border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
                  '<div style="width:42px;height:42px;border-radius:12px;background:' + c + '22;' +
                    'border:1px solid ' + c + '55;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">' +
                    s.icon + '</div>' +
                  '<div style="min-width:0;">' +
                    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
                      '<span style="font-size:10px;font-weight:800;color:' + c + ';background:' + c + '18;' +
                        'border:1px solid ' + c + ';padding:2px 8px;border-radius:5px;' +
                        'font-family:\'JetBrains Mono\',monospace;">' + s.level + '</span>' +
                    '</div>' +
                    '<h3 style="font-size:15px;font-weight:700;color:var(--fg);margin:5px 0 1px;">' + H(s.title) + '</h3>' +
                    '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;color:var(--fg-muted);margin:0;">' + H(s.titleJp) + '</p>' +
                  '</div>' +
                '</div>' +
                '<div style="padding:14px 18px;flex:1;display:flex;flex-direction:column;gap:10px;">' +
                  '<p style="font-size:12px;color:var(--fg-subtle);margin:0;line-height:1.6;">' + H(s.desc) + '</p>' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;">' +
                    '<span style="font-size:11px;color:var(--fg-muted);">💬 ' + s.lines.length + ' lines</span>' +
                    '<span class="nz-btn nz-btn-pri" style="font-size:12px;padding:6px 14px;">Start ▶</span>' +
                  '</div>' +
                '</div>' +
              '</div>';
          }).join('') +
        '</div>' +
        (list.length === 0
          ? '<div style="padding:40px;text-align:center;color:var(--fg-muted);font-size:13px;">No scenarios at this level yet.</div>'
          : '') +
      '</div>';

    root.querySelectorAll('[data-conv-back-levels]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.step = 'levels';
        renderLevels(root);
      });
    });
    var toPron = root.querySelector('[data-conv-to-pron]');
    if (toPron) {
      toPron.addEventListener('click', function () {
        if (window.Router && typeof window.Router.go === 'function') {
          window.Router.go('pronunciation');
        }
      });
    }
    root.querySelectorAll('[data-conv-open]').forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-conv-open');
        state.selected = SCENARIOS.filter(function (s) { return s.id === id; })[0];
        state.isPlaying = false;
        renderDetail(root);
      });
    });

    if (window.NzDailyTracker) window.NzDailyTracker.refreshAll();
  }

  /* ── Render: detail / chat view ───────────────────────────── */
  function renderDetail(root) {
    var s = state.selected;
    var c = jlptColor(s.level);
    var people = s.participants;

    root.innerHTML =
      '<div class="nz-page nz-fadein">' +
        '<button data-conv-back style="display:flex;align-items:center;gap:6px;background:none;border:none;' +
          'color:var(--fg-muted);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;padding:0;margin-bottom:18px;">' +
          '← Back to scenarios</button>' +

        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">' +
          '<div style="width:40px;height:40px;border-radius:12px;background:' + c + '22;' +
            'border:1px solid ' + c + '55;display:flex;align-items:center;justify-content:center;font-size:19px;">' + s.icon + '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
              '<span style="font-size:10px;font-weight:800;color:' + c + ';background:' + c + '18;' +
                'border:1px solid ' + c + ';padding:3px 10px;border-radius:6px;font-family:\'JetBrains Mono\',monospace;">' + s.level + '</span>' +
              '<h1 style="font-size:18px;font-weight:800;color:var(--fg);margin:0;">' + H(s.title) + '</h1>' +
            '</div>' +
            '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;color:var(--fg-muted);margin:3px 0 0;">' + H(s.titleJp) + '</p>' +
          '</div>' +
          '<div id="nz-conv-dots-detail" data-nz-daily-dots="7" data-nz-daily-title=""></div>' +
        '</div>' +

        '<div class="card" style="padding:14px 16px;margin-bottom:14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;">' +
          '<button id="conv-play-btn" data-conv-playall class="nz-btn nz-btn-pri">' +
            (state.isPlaying ? '⏹ Stop' : '▶ Play Conversation') + '</button>' +
          '<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fg-muted);">' +
            '🐢' +
            '<input type="range" id="conv-speed" min="0.6" max="1.1" step="0.05" value="' + state.speed + '" style="width:90px;">' +
            '🐇' +
          '</div>' +
          '<button data-conv-toggle="showRomaji" class="nz-btn nz-btn-ghost" style="font-size:12px;padding:7px 12px;">' +
            (state.showRomaji ? '🙈 Hide Romaji' : '👁 Show Romaji') + '</button>' +
          '<button data-conv-toggle="showEn" class="nz-btn nz-btn-ghost" style="font-size:12px;padding:7px 12px;">' +
            (state.showEn ? '🙈 Hide English' : '👁 Show English') + '</button>' +
          '<button data-conv-complete class="nz-btn nz-btn-ghost" style="font-size:12px;padding:7px 12px;margin-left:auto;color:var(--n5);border-color:var(--n5);">' +
            '✓ Mark Practiced</button>' +
        '</div>' +

        '<div class="card" style="padding:18px;display:flex;flex-direction:column;gap:12px;">' +
          s.lines.map(function (ln, i) {
            var personIdx = people.indexOf(ln.who);
            var isLeft = personIdx === 0;
            var bubbleColor = isLeft ? 'var(--card-elevated)' : c + '18';
            var borderColor = isLeft ? 'var(--border)' : c + '55';
            return '<div id="conv-line-' + i + '" style="display:flex;flex-direction:column;' +
                'align-items:' + (isLeft ? 'flex-start' : 'flex-end') + ';gap:4px;transition:opacity .2s;">' +
              '<span style="font-size:10px;font-weight:700;color:var(--fg-subtle);' +
                'text-transform:uppercase;letter-spacing:.08em;padding:0 4px;">' + H(ln.who) + '</span>' +
              '<div style="max-width:80%;background:' + bubbleColor + ';border:1px solid ' + borderColor + ';' +
                'border-radius:14px;padding:10px 14px;display:flex;align-items:flex-start;gap:8px;">' +
                '<div style="min-width:0;">' +
                  '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:14px;color:var(--fg);margin:0 0 2px;line-height:1.6;">' + H(ln.jp) + '</p>' +
                  (state.showRomaji ? '<p style="font-size:11px;color:var(--accent);font-family:var(--font-mono);margin:0 0 2px;">' + H(ln.romaji) + '</p>' : '') +
                  (state.showEn ? '<p style="font-size:12px;color:var(--fg-muted);font-style:italic;margin:0;">' + H(ln.en) + '</p>' : '') +
                '</div>' +
                '<button data-conv-speak="' + i + '" style="background:none;border:none;cursor:pointer;color:var(--primary);' +
                  'font-size:14px;flex-shrink:0;padding:2px 2px;">🔊</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';

    /* style for active line during full playback */
    if (!$id('nz-conv-active-style')) {
      var style = document.createElement('style');
      style.id = 'nz-conv-active-style';
      style.textContent = '.nz-conv-active{box-shadow:0 0 0 2px var(--primary) inset;border-radius:14px;}';
      document.head.appendChild(style);
    }

    /* events */
    root.querySelector('[data-conv-back]').addEventListener('click', function () {
      stopPlayback();
      renderList(root);
    });

    root.querySelectorAll('[data-conv-speak]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-conv-speak'), 10);
        var ln = s.lines[i];
        var personIdx = people.indexOf(ln.who);
        speakLine(ln.jp, state.speed, personIdx === 0 ? 1 : 1.15);
      });
    });

    root.querySelectorAll('[data-conv-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-conv-toggle');
        state[key] = !state[key];
        renderDetail(root);
      });
    });

    var speedInput = $id('conv-speed');
    if (speedInput) {
      speedInput.addEventListener('input', function () { state.speed = parseFloat(speedInput.value); });
    }

    root.querySelector('[data-conv-playall]').addEventListener('click', function () {
      if (state.isPlaying) { stopPlayback(); renderDetailLight(); return; }
      playAll(root);
    });

    root.querySelector('[data-conv-complete]').addEventListener('click', function (e) {
      if (window.NzDailyTracker) window.NzDailyTracker.mark('conversation');
      e.target.textContent = '✓ Practiced today!';
      e.target.style.opacity = '0.7';
      setTimeout(function () { e.target.style.opacity = ''; }, 1200);
    });

    if (window.NzDailyTracker) window.NzDailyTracker.refreshAll();
  }

  /* light reset of play button + active line highlights, without rebuilding whole DOM */
  function renderDetailLight() {
    var btn = $id('conv-play-btn');
    if (btn) btn.textContent = '▶ Play Conversation';
    var s = state.selected;
    s.lines.forEach(function (ln, i) {
      var el = $id('conv-line-' + i);
      if (el) {
        var bubble = el.querySelector('div');
        if (bubble) bubble.classList.remove('nz-conv-active');
      }
    });
  }

  function stopPlayback() {
    state.isPlaying = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  async function playAll(root) {
    state.isPlaying = true;
    var btn = $id('conv-play-btn');
    if (btn) btn.textContent = '⏹ Stop';
    var s = state.selected;
    var people = s.participants;

    for (var i = 0; i < s.lines.length; i++) {
      if (!state.isPlaying) break;
      var ln = s.lines[i];
      var personIdx = people.indexOf(ln.who);
      var el = $id('conv-line-' + i);
      var bubble = el ? el.querySelector('div') : null;
      if (bubble) {
        bubble.classList.add('nz-conv-active');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      await speakLineAsync(ln.jp, state.speed, personIdx === 0 ? 1 : 1.15, 550);
      if (bubble) bubble.classList.remove('nz-conv-active');
    }

    if (state.isPlaying) {
      if (window.NzDailyTracker) window.NzDailyTracker.mark('conversation');
      markScenarioComplete(s.id);
    }
    state.isPlaying = false;
    if (btn) btn.textContent = '▶ Play Conversation';
  }

  /* ── Public module API ─────────────────────────────────────── */
  window.ConversationPage = {
    mount: function (rootId) {
      var root = $id(rootId);
      if (!root) return;
      state.selected = null;
      state.isPlaying = false;
      state.step = 'levels';
      renderLevels(root);
    },
    cleanup: function () {
      stopPlayback();
    }
  };
})();
