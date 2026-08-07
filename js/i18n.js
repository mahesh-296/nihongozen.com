/*==============================================
  NihongoZen — i18n Engine
  Dynamic, no-reload language switching.
  Include AFTER css/tokens.css and BEFORE your page's
  own inline <script> that reads translated strings
  (e.g. login.html's form-title logic).

  Usage in HTML:
    <span data-i18n="stat_learners">Active learners</span>
    <input data-i18n-placeholder="placeholder_email" placeholder="kenji@example.com">

  Usage in JS:
    NZI18N.t('title_welcome_back')       // -> translated string
    NZI18N.setLang('hi')                 // -> switches + persists + re-renders
    document.addEventListener('nz:langchange', e => { ... e.detail.lang ... })
================================================*/
(function () {
  var SUPPORTED = ['en','ja','hi','es','fr','de','id','vi','ko','zh','pt'];
  var LANG_NAMES = {
    en: 'English', ja: '日本語', hi: 'हिन्दी', es: 'Español', fr: 'Français',
    de: 'Deutsch', id: 'Indonesia', vi: 'Tiếng Việt', ko: '한국어', zh: '中文', pt: 'Português'
  };

  // Keys currently translated: login/landing page. Add more keys here as
  // other pages adopt data-i18n — every language below already has the
  // same key set so nothing silently falls back to English mid-sentence.
  var DICT = {
    headline_master:        { en:'Master', ja:'日本語を', hi:'जापानी में', es:'Domina el', fr:'Maîtrisez le', de:'Beherrsche', id:'Kuasai', vi:'Chinh phục', ko:'일본어를', zh:'掌握', pt:'Domine o' },
    headline_japanese:      { en:'Japanese.', ja:'マスターしよう', hi:'महारत हासिल करें', es:'japonés.', fr:'japonais.', de:'Japanisch.', id:'Bahasa Jepang.', vi:'tiếng Nhật.', ko:'마스터하세요', zh:'日语', pt:'japonês.' },
    sub_headline:           { en:'From your first hiragana to JLPT N1 — a structured, gamified path to Japanese fluency.', ja:'初めてのひらがなからJLPT N1まで — 体系的でゲーム感覚の日本語習得プログラム。', hi:'पहली हीरागाना से लेकर JLPT N1 तक — जापानी में महारत हासिल करने का एक सुव्यवस्थित, गेमिफाइड रास्ता।', es:'Desde tu primer hiragana hasta el JLPT N1: un camino estructurado y gamificado hacia la fluidez en japonés.', fr:'De votre premier hiragana au JLPT N1 — un parcours structuré et ludique vers la maîtrise du japonais.', de:'Von deinem ersten Hiragana bis zum JLPT N1 — ein strukturierter, spielerischer Weg zur Japanisch-Fluenz.', id:'Dari hiragana pertamamu hingga JLPT N1 — jalur terstruktur dan gamified menuju kefasihan bahasa Jepang.', vi:'Từ hiragana đầu tiên đến JLPT N1 — một lộ trình bài bản, học mà chơi để thông thạo tiếng Nhật.', ko:'첫 히라가나부터 JLPT N1까지 — 체계적이고 게임처럼 즐기는 일본어 유창성 학습 코스.', zh:'从第一个平假名到JLPT N1——通往日语流利的系统化、游戏化学习之路。', pt:'Do seu primeiro hiragana ao JLPT N1 — um caminho estruturado e gamificado para a fluência em japonês.' },
    feat_1:                 { en:'Structured N5→N1 JLPT curriculum', ja:'体系的なN5→N1 JLPTカリキュラム', hi:'व्यवस्थित N5→N1 JLPT पाठ्यक्रम', es:'Currículo estructurado JLPT N5→N1', fr:'Programme structuré JLPT N5→N1', de:'Strukturierter JLPT-Lehrplan N5→N1', id:'Kurikulum JLPT N5→N1 yang terstruktur', vi:'Chương trình JLPT N5→N1 có cấu trúc', ko:'체계적인 N5→N1 JLPT 커리큘럼', zh:'结构化的N5→N1 JLPT课程体系', pt:'Currículo estruturado JLPT N5→N1' },
    feat_2:                 { en:'2,136 kanji with readings and examples', ja:'読みと例文付きの漢字2,136字', hi:'रीडिंग और उदाहरणों सहित 2,136 कांजी', es:'2136 kanji con lecturas y ejemplos', fr:'2 136 kanji avec lectures et exemples', de:'2.136 Kanji mit Lesungen und Beispielen', id:'2.136 kanji dengan cara baca dan contoh', vi:'2.136 chữ Hán với cách đọc và ví dụ', ko:'읽기와 예문이 포함된 한자 2,136자', zh:'2,136个汉字，附读音与例句', pt:'2.136 kanji com leituras e exemplos' },
    feat_3:                 { en:'Listening comprehension with transcripts', ja:'スクリプト付きリスニング学習', hi:'ट्रांसक्रिप्ट सहित लिसनिंग अभ्यास', es:'Comprensión auditiva con transcripciones', fr:'Compréhension orale avec transcriptions', de:'Hörverständnis mit Transkripten', id:'Latihan mendengarkan dengan transkrip', vi:'Luyện nghe kèm bản ghi lời thoại', ko:'스크립트가 포함된 듣기 연습', zh:'配有文字稿的听力练习', pt:'Compreensão auditiva com transcrições' },
    feat_4:                 { en:'Gamified XP, streaks, and rank badges', ja:'XP・連続記録・ランクバッジのゲーム要素', hi:'गेमिफाइड XP, स्ट्रीक और रैंक बैज', es:'XP gamificado, rachas e insignias de rango', fr:'XP ludique, séries et badges de rang', de:'Spielerisches XP, Streaks und Rang-Abzeichen', id:'XP gamified, streak, dan lencana peringkat', vi:'XP, chuỗi ngày học và huy hiệu thứ hạng', ko:'게임화된 XP, 연속 학습, 랭크 배지', zh:'游戏化经验值、连续打卡和等级徽章', pt:'XP gamificado, sequências e emblemas de rank' },
    stat_learners:           { en:'Active learners', ja:'アクティブな学習者', hi:'सक्रिय शिक्षार्थी', es:'Estudiantes activos', fr:'Apprenants actifs', de:'Aktive Lernende', id:'Pelajar aktif', vi:'Người học đang hoạt động', ko:'활성 학습자', zh:'活跃学习者', pt:'Alunos ativos' },
    stat_kanji:              { en:'Kanji covered', ja:'収録漢字数', hi:'कवर किए गए कांजी', es:'Kanji cubiertos', fr:'Kanji couverts', de:'Abgedeckte Kanji', id:'Kanji tercakup', vi:'Số chữ Hán', ko:'수록된 한자', zh:'涵盖汉字', pt:'Kanji abordados' },
    stat_vocab:              { en:'Vocab entries', ja:'収録単語数', hi:'शब्दावली प्रविष्टियां', es:'Entradas de vocabulario', fr:'Entrées de vocabulaire', de:'Vokabeleinträge', id:'Entri kosakata', vi:'Mục từ vựng', ko:'수록 어휘', zh:'词汇条目', pt:'Entradas de vocabulário' },
    stat_examrate:           { en:'Exam pass rate', ja:'合格率', hi:'परीक्षा उत्तीर्ण दर', es:'Tasa de aprobación', fr:'Taux de réussite', de:'Prüfungserfolgsquote', id:'Tingkat kelulusan ujian', vi:'Tỷ lệ đỗ thi', ko:'시험 합격률', zh:'考试通过率', pt:'Taxa de aprovação' },
    footer_privacy:          { en:'Privacy Policy', ja:'プライバシーポリシー', hi:'गोपनीयता नीति', es:'Política de privacidad', fr:'Politique de confidentialité', de:'Datenschutzrichtlinie', id:'Kebijakan Privasi', vi:'Chính sách bảo mật', ko:'개인정보 처리방침', zh:'隐私政策', pt:'Política de Privacidade' },
    footer_terms:            { en:'Terms of Service', ja:'利用規約', hi:'सेवा की शर्तें', es:'Términos del servicio', fr:'Conditions d\u2019utilisation', de:'Nutzungsbedingungen', id:'Ketentuan Layanan', vi:'Điều khoản dịch vụ', ko:'서비스 약관', zh:'服务条款', pt:'Termos de Serviço' },
    tab_signin:              { en:'Sign In', ja:'ログイン', hi:'साइन इन करें', es:'Iniciar sesión', fr:'Se connecter', de:'Anmelden', id:'Masuk', vi:'Đăng nhập', ko:'로그인', zh:'登录', pt:'Entrar' },
    tab_signup:              { en:'Sign Up', ja:'新規登録', hi:'साइन अप करें', es:'Registrarse', fr:'S\u2019inscrire', de:'Registrieren', id:'Daftar', vi:'Đăng ký', ko:'회원가입', zh:'注册', pt:'Cadastrar-se' },
    title_welcome_back:      { en:'Welcome back', ja:'おかえりなさい', hi:'वापसी पर स्वागत है', es:'Bienvenido de nuevo', fr:'Content de vous revoir', de:'Willkommen zurück', id:'Selamat datang kembali', vi:'Chào mừng trở lại', ko:'다시 오신 것을 환영합니다', zh:'欢迎回来', pt:'Bem-vindo de volta' },
    title_start_journey:     { en:'Start your journey', ja:'学習を始めましょう', hi:'अपनी यात्रा शुरू करें', es:'Comienza tu viaje', fr:'Commencez votre parcours', de:'Starte deine Reise', id:'Mulai perjalananmu', vi:'Bắt đầu hành trình của bạn', ko:'여정을 시작하세요', zh:'开启你的学习之旅', pt:'Comece sua jornada' },
    subtitle_signin:         { en:'Sign in to continue your Japanese studies', ja:'ログインして日本語学習を続けましょう', hi:'अपनी जापानी पढ़ाई जारी रखने के लिए साइन इन करें', es:'Inicia sesión para continuar tus estudios de japonés', fr:'Connectez-vous pour poursuivre vos études de japonais', de:'Melde dich an, um dein Japanischstudium fortzusetzen', id:'Masuk untuk melanjutkan belajar bahasa Jepangmu', vi:'Đăng nhập để tiếp tục học tiếng Nhật', ko:'로그인하고 일본어 학습을 계속하세요', zh:'登录以继续你的日语学习', pt:'Entre para continuar seus estudos de japonês' },
    subtitle_signup:         { en:'Create your free account to begin learning', ja:'アカウントを作成して日本語学習を始めましょう', hi:'जापानी सीखना शुरू करने के लिए एक खाता बनाएं', es:'Crea una cuenta para empezar a aprender japonés', fr:'Créez un compte pour commencer à apprendre le japonais', de:'Erstelle ein Konto, um Japanisch zu lernen', id:'Buat akun untuk mulai belajar bahasa Jepang', vi:'Tạo tài khoản để bắt đầu học tiếng Nhật', ko:'계정을 만들고 일본어 학습을 시작하세요', zh:'创建账户，开始学习日语', pt:'Crie uma conta para começar a aprender japonês' },
    btn_google:              { en:'Continue with Google', ja:'Googleで続ける', hi:'Google से जारी रखें', es:'Continuar con Google', fr:'Continuer avec Google', de:'Mit Google fortfahren', id:'Lanjutkan dengan Google', vi:'Tiếp tục với Google', ko:'Google로 계속하기', zh:'使用Google继续', pt:'Continuar com o Google' },
    divider_email:           { en:'or use email', ja:'またはメールで', hi:'या ईमेल का उपयोग करें', es:'o usa el correo', fr:'ou utilisez l\u2019e-mail', de:'oder E-Mail verwenden', id:'atau gunakan email', vi:'hoặc dùng email', ko:'또는 이메일 사용', zh:'或使用邮箱', pt:'ou use o e-mail' },
    label_email:             { en:'Email address', ja:'メールアドレス', hi:'ईमेल पता', es:'Correo electrónico', fr:'Adresse e-mail', de:'E-Mail-Adresse', id:'Alamat email', vi:'Địa chỉ email', ko:'이메일 주소', zh:'电子邮箱地址', pt:'Endereço de e-mail' },
    error_email_invalid:     { en:'Please enter a valid email address.', ja:'有効なメールアドレスを入力してください。', hi:'कृपया एक मान्य ईमेल पता दर्ज करें।', es:'Introduce una dirección de correo válida.', fr:'Veuillez saisir une adresse e-mail valide.', de:'Bitte gib eine gültige E-Mail-Adresse ein.', id:'Masukkan alamat email yang valid.', vi:'Vui lòng nhập địa chỉ email hợp lệ.', ko:'유효한 이메일 주소를 입력해 주세요.', zh:'请输入有效的电子邮箱地址。', pt:'Insira um endereço de e-mail válido.' },
    btn_magic_link:          { en:'Send Magic Link', ja:'マジックリンクを送信', hi:'मैजिक लिंक भेजें', es:'Enviar enlace mágico', fr:'Envoyer le lien magique', de:'Magic Link senden', id:'Kirim Magic Link', vi:'Gửi liên kết đăng nhập', ko:'매직 링크 보내기', zh:'发送登录魔法链接', pt:'Enviar link mágico' },
    success_check_inbox:     { en:'Check your inbox!', ja:'受信箱を確認してください！', hi:'अपना इनबॉक्स जांचें!', es:'¡Revisa tu bandeja de entrada!', fr:'Vérifiez votre boîte de réception\u00a0!', de:'Schau in dein Postfach!', id:'Periksa kotak masukmu!', vi:'Hãy kiểm tra hộp thư của bạn!', ko:'받은편지함을 확인하세요!', zh:'请查收你的邮箱！', pt:'Confira sua caixa de entrada!' },
    success_text:            { en:'We sent a magic link — click it to sign in instantly. No password needed.', ja:'マジックリンクを送信しました。クリックするとすぐにログインできます。パスワードは不要です。', hi:'हमने एक मैजिक लिंक भेजा है — तुरंत साइन इन करने के लिए उस पर क्लिक करें। पासवर्ड की ज़रूरत नहीं।', es:'Enviamos un enlace mágico: haz clic para iniciar sesión al instante. No necesitas contraseña.', fr:'Nous avons envoyé un lien magique — cliquez dessus pour vous connecter instantanément. Aucun mot de passe requis.', de:'Wir haben einen Magic Link gesendet — klicke ihn an, um dich sofort anzumelden. Kein Passwort nötig.', id:'Kami mengirim Magic Link — klik untuk langsung masuk. Tidak perlu kata sandi.', vi:'Chúng tôi đã gửi một liên kết đăng nhập — nhấp vào để đăng nhập ngay. Không cần mật khẩu.', ko:'매직 링크를 보내드렸어요 — 클릭하면 바로 로그인됩니다. 비밀번호가 필요 없어요.', zh:'我们已发送登录魔法链接——点击即可立即登录，无需密码。', pt:'Enviamos um link mágico — clique nele para entrar instantaneamente. Sem necessidade de senha.' },
    btn_use_different_email: { en:'Use a different email', ja:'別のメールアドレスを使う', hi:'एक अलग ईमेल का उपयोग करें', es:'Usar otro correo', fr:'Utiliser une autre adresse e-mail', de:'Andere E-Mail verwenden', id:'Gunakan email lain', vi:'Dùng email khác', ko:'다른 이메일 사용하기', zh:'使用其他邮箱', pt:'Usar outro e-mail' },
    otp_toggle:              { en:'Sign in with phone instead', ja:'電話番号でログイン', hi:'इसके बजाय फ़ोन से साइन इन करें', es:'Iniciar sesión con teléfono', fr:'Se connecter avec le téléphone', de:'Stattdessen mit Telefon anmelden', id:'Masuk dengan nomor telepon', vi:'Đăng nhập bằng số điện thoại', ko:'대신 휴대폰으로 로그인', zh:'改用手机号登录', pt:'Entrar com o telefone' },
    label_phone:             { en:'Phone number', ja:'電話番号', hi:'फोन नंबर', es:'Número de teléfono', fr:'Numéro de téléphone', de:'Telefonnummer', id:'Nomor telepon', vi:'Số điện thoại', ko:'전화번호', zh:'电话号码', pt:'Número de telefone' },
    btn_send_otp:            { en:'Send OTP', ja:'OTPを送信', hi:'OTP भेजें', es:'Enviar OTP', fr:'Envoyer le code OTP', de:'OTP senden', id:'Kirim OTP', vi:'Gửi mã OTP', ko:'OTP 전송', zh:'发送验证码', pt:'Enviar OTP' },
    label_enter_otp:         { en:'Enter OTP', ja:'OTPを入力', hi:'OTP दर्ज करें', es:'Introducir OTP', fr:'Saisir le code OTP', de:'OTP eingeben', id:'Masukkan OTP', vi:'Nhập mã OTP', ko:'OTP 입력', zh:'输入验证码', pt:'Digite o OTP' },
    btn_verify_signin:       { en:'Verify & Sign In', ja:'確認してログイン', hi:'सत्यापित करें और साइन इन करें', es:'Verificar e iniciar sesión', fr:'Vérifier et se connecter', de:'Verifizieren & anmelden', id:'Verifikasi & Masuk', vi:'Xác minh & đăng nhập', ko:'인증 후 로그인', zh:'验证并登录', pt:'Verificar e entrar' },
    apple_soon:              { en:'Apple', ja:'Apple', hi:'Apple', es:'Apple', fr:'Apple', de:'Apple', id:'Apple', vi:'Apple', ko:'Apple', zh:'Apple', pt:'Apple' },
    badge_soon:              { en:'Soon', ja:'近日公開', hi:'जल्द आ रहा है', es:'Pronto', fr:'Bientôt', de:'Bald', id:'Segera', vi:'Sắp có', ko:'출시 예정', zh:'即将推出', pt:'Em breve' },
    facebook_btn:            { en:'Facebook', ja:'Facebook', hi:'Facebook', es:'Facebook', fr:'Facebook', de:'Facebook', id:'Facebook', vi:'Facebook', ko:'Facebook', zh:'Facebook', pt:'Facebook' },
    legal_prefix:            { en:'By continuing, you agree to our', ja:'続行することで、以下に同意したことになります：', hi:'जारी रखकर, आप हमारी शर्तों से सहमत होते हैं', es:'Al continuar, aceptas nuestros', fr:'En continuant, vous acceptez nos', de:'Mit der Fortsetzung stimmst du unseren', de_suffix:'zu', id:'Dengan melanjutkan, Anda menyetujui', vi:'Bằng việc tiếp tục, bạn đồng ý với', ko:'계속 진행하면 다음에 동의하는 것입니다:', zh:'继续即表示您同意我们的', pt:'Ao continuar, você concorda com nossos' },
    legal_and:               { en:'and', ja:'と', hi:'और', es:'y', fr:'et', de:'und', id:'dan', vi:'và', ko:'및', zh:'和', pt:'e' },

    // ── App shell: sidebar / bottom-nav (index.html) ──
    nav_section_study:      { en:'Study', ja:'学習', hi:'अध्ययन', es:'Estudio', fr:'Étude', de:'Lernen', id:'Belajar', vi:'Học tập', ko:'학습', zh:'学习', pt:'Estudo' },
    nav_section_jlpt:        { en:'JLPT Practice', ja:'JLPT対策', hi:'JLPT अभ्यास', es:'Práctica JLPT', fr:'Entraînement JLPT', de:'JLPT-Übung', id:'Latihan JLPT', vi:'Luyện thi JLPT', ko:'JLPT 연습', zh:'JLPT 练习', pt:'Prática JLPT' },
    nav_dashboard:           { en:'Dashboard', ja:'ダッシュボード', hi:'डैशबोर्ड', es:'Panel', fr:'Tableau de bord', de:'Übersicht', id:'Dasbor', vi:'Bảng điều khiển', ko:'대시보드', zh:'仪表盘', pt:'Painel' },
    nav_kana:                { en:'Kana', ja:'かな', hi:'काना', es:'Kana', fr:'Kana', de:'Kana', id:'Kana', vi:'Kana', ko:'가나', zh:'假名', pt:'Kana' },
    nav_kanji:                { en:'Kanji', ja:'漢字', hi:'कांजी', es:'Kanji', fr:'Kanji', de:'Kanji', id:'Kanji', vi:'Kanji', ko:'한자', zh:'汉字', pt:'Kanji' },
    nav_vocab:                { en:'Vocabulary', ja:'語彙', hi:'शब्दावली', es:'Vocabulario', fr:'Vocabulaire', de:'Wortschatz', id:'Kosakata', vi:'Từ vựng', ko:'어휘', zh:'词汇', pt:'Vocabulário' },
    nav_grammar:              { en:'Grammar', ja:'文法', hi:'व्याकरण', es:'Gramática', fr:'Grammaire', de:'Grammatik', id:'Tata Bahasa', vi:'Ngữ pháp', ko:'문법', zh:'语法', pt:'Gramática' },
    nav_reading:              { en:'Reading', ja:'読解', hi:'पठन', es:'Lectura', fr:'Lecture', de:'Lesen', id:'Membaca', vi:'Đọc hiểu', ko:'독해', zh:'阅读', pt:'Leitura' },
    nav_listening:            { en:'Listening', ja:'聴解', hi:'सुनना', es:'Escucha', fr:'Écoute', de:'Hören', id:'Mendengarkan', vi:'Nghe hiểu', ko:'청해', zh:'听力', pt:'Audição' },
    nav_jlpt_test:            { en:'JLPT Test', ja:'JLPT模試', hi:'JLPT परीक्षा', es:'Examen JLPT', fr:'Examen JLPT', de:'JLPT-Prüfung', id:'Tes JLPT', vi:'Bài thi JLPT', ko:'JLPT 시험', zh:'JLPT 考试', pt:'Exame JLPT' },
    nav_conversation:         { en:'Conversation', ja:'会話', hi:'बातचीत', es:'Conversación', fr:'Conversation', de:'Konversation', id:'Percakapan', vi:'Hội thoại', ko:'회화', zh:'会话', pt:'Conversação' },
    nav_home:                 { en:'Home', ja:'ホーム', hi:'होम', es:'Inicio', fr:'Accueil', de:'Start', id:'Beranda', vi:'Trang chủ', ko:'홈', zh:'首页', pt:'Início' },
    nav_level:                { en:'Level', ja:'レベル', hi:'स्तर', es:'Nivel', fr:'Niveau', de:'Stufe', id:'Level', vi:'Cấp độ', ko:'레벨', zh:'等级', pt:'Nível' },
    nav_progress:             { en:'Progress', ja:'進捗', hi:'प्रगति', es:'Progreso', fr:'Progression', de:'Fortschritt', id:'Kemajuan', vi:'Tiến độ', ko:'진행률', zh:'进度', pt:'Progresso' },
    nav_profile:              { en:'Profile', ja:'プロフィール', hi:'प्रोफ़ाइल', es:'Perfil', fr:'Profil', de:'Profil', id:'Profil', vi:'Hồ sơ', ko:'프로필', zh:'个人资料', pt:'Perfil' }
  };

  var STORAGE_KEY = 'nz-lang';

  function detectInitial() {
    var saved;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) !== -1 ? nav : 'en';
  }

  var currentLang = detectInitial();

  function t(key) {
    var entry = DICT[key];
    if (!entry) return key; // missing key — fail loud-ish in dev, never blank in prod
    return entry[currentLang] || entry.en;
  }

  function applyToDOM() {
    document.documentElement.setAttribute('lang', currentLang);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
    });
    var switcher = document.getElementById('nz-lang-switcher');
    if (switcher) switcher.value = currentLang;
    document.dispatchEvent(new CustomEvent('nz:langchange', { detail: { lang: currentLang } }));
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    applyToDOM();
  }

  window.NZI18N = {
    t: t,
    setLang: setLang,
    getLang: function () { return currentLang; },
    supported: SUPPORTED,
    langNames: LANG_NAMES,
    refresh: applyToDOM
  };

  document.addEventListener('DOMContentLoaded', applyToDOM);
})();
