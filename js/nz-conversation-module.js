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
    filter: 'All',
    selected: null,
    isPlaying: false,
    showRomaji: true,
    showEn: true,
    speed: 0.85
  };

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
          LEVELS.map(function (lv) {
            var active = lv === state.filter;
            var c = lv === 'All' ? 'var(--primary)' : jlptColor(lv);
            return '<button data-conv-lv="' + lv + '" ' +
              'style="display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;font-size:13px;' +
              'font-weight:700;font-family:inherit;cursor:pointer;transition:all .15s;' +
              'background:' + (active ? c : 'var(--card-elevated)') + ';' +
              'color:' + (active ? '#fff' : 'var(--fg-muted)') + ';' +
              'border:1px solid ' + (active ? c : 'var(--border)') + ';">' +
              '<span>' + LEVEL_ICON[lv] + '</span>' + lv + '</button>';
          }).join('') +
          '<button data-conv-to-vocab class="nz-btn nz-btn-ghost" style="font-size:12px;padding:9px 14px;margin-left:auto;">' +
            '語 Pronunciation &amp; Conjugation →</button>' +
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

    root.querySelectorAll('[data-conv-lv]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.filter = btn.getAttribute('data-conv-lv');
        renderList(root);
      });
    });
    var toVocab = root.querySelector('[data-conv-to-vocab]');
    if (toVocab) {
      toVocab.addEventListener('click', function () {
        if (window.Router && typeof window.Router.go === 'function') {
          window.Router.go('vocab');
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
      renderList(root);
    },
    cleanup: function () {
      stopPlayback();
    }
  };
})();
