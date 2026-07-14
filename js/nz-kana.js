// ============================================================
//  nz-kana.js — Full Hiragana & Katakana interactive chart
//  Includes: study chart (flip/info/learn/search), Kana Quiz
//  (timed flashcard arcade game), character detail view with
//  similar-kana lookup, example words/sentences, and a writing
//  practice canvas with trace mode, undo/redo, and PNG export.
//
//  Usage: place this file at  data/nz-kana.js
//         then add to your HTML:
//           <div id="kana-chart"></div>
//           <script src="data/nz-kana.js"></script>
//
//  Visual theme matches the NihongoZen dark UI (tokens.css /
//  components.css): dark surfaces, pink primary accent, amber
//  highlight, and green for success states.
// ============================================================

(function () {

  var FONT_LINK_ID = 'kana-chart-fonts';
  var STYLE_ID = 'kana-chart-styles';

  // ── FONTS ────────────────────────────────────────────────────
  function injectFonts() {
    if (document.getElementById(FONT_LINK_ID)) return;
    var preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect);
    var link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&family=Nunito:wght@400;600;700;800;900&display=swap';
    document.head.appendChild(link);
  }

  // ── STYLES (scoped under #kana-chart; inherits the app's live theme tokens) ────
  var CSS = `
  #kana-chart *{box-sizing:border-box;}
  #kana-chart{
    display:block;
    background:var(--bg);
    border-radius:22px;
    font-family:"Nunito",sans-serif;
    color:var(--fg);
  }
  #kana-chart .jp{font-family:"Noto Sans JP",sans-serif;}
  #kana-chart main{max-width:760px; margin:0 auto; padding:34px 18px 80px 18px;}

  #kana-chart /* ---------- Header ---------- */
  h1.page-title{
    font-size:clamp(28px,6vw,38px);
    font-weight:900;
    margin:0 0 8px 0;
    display:flex; align-items:baseline; gap:12px;
  }
  #kana-chart p.page-sub{
    font-size:15px; color:var(--fg-muted); line-height:1.55;
    margin:0 0 22px 0; max-width:560px;
  }

  #kana-chart /* ---------- Legend ---------- */
  .legend{
    display:flex; flex-wrap:wrap; gap:10px 18px;
    background:var(--card);
    border:1px solid var(--border);
    border-radius:14px;
    padding:12px 16px;
    margin-bottom:22px;
    font-size:12.5px;
    color:var(--fg-muted);
  }
  #kana-chart .legend b{color:var(--fg);}
  #kana-chart .legend .li{display:flex; align-items:center; gap:6px;}
  #kana-chart .legend .swatch{
    width:16px;height:16px;border-radius:5px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    font-size:9px;color:#fff;
  }
  #kana-chart .sw-speak{background:var(--card-elevated);}
  #kana-chart .sw-info{background:var(--primary);}
  #kana-chart .sw-learn{background:var(--success);}

  #kana-chart /* ---------- Chart card ---------- */
  .chart-card{
    background:var(--card);
    border-radius:22px;
    border:1px solid var(--border);
    padding:26px 22px 22px 22px;
    box-shadow:var(--shadow-xl);
    margin-bottom:26px;
  }
  #kana-chart .chart-top{
    display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap;
    margin-bottom:16px;
  }
  #kana-chart .chart-card h2{ font-size:22px; font-weight:800; color:var(--fg); margin:0 0 4px 0;}
  #kana-chart .chart-card .hint{ font-size:13.5px; color:var(--fg-muted); margin:0;}

  #kana-chart .progress-pill{
    display:flex; align-items:center; gap:10px;
    background:var(--card-elevated);
    border-radius:30px;
    padding:8px 14px;
    font-size:12.5px;
    font-weight:800;
    color:var(--fg-muted);
    white-space:nowrap;
  }
  #kana-chart .progress-pill .bar-outer{
    width:80px; height:6px; border-radius:6px; background:var(--card-elevated); overflow:hidden;
  }
  #kana-chart .progress-pill .bar-inner{
    height:100%; width:0%; background:var(--success); border-radius:6px; transition:width .3s ease;
  }

  #kana-chart .actions-row{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px; align-items:center;}
  #kana-chart .play-all{
    display:inline-flex; align-items:center; gap:8px;
    background:var(--primary); color:#fff; border:none; border-radius:30px;
    padding:11px 20px; font-size:14.5px; font-weight:800;
    font-family:"Nunito",sans-serif; cursor:pointer;
    transition:background .15s ease, transform .1s ease;
  }
  #kana-chart .play-all:hover{background:var(--primary-hover);}
  #kana-chart .play-all:active{transform:scale(0.97);}
  #kana-chart .play-all .ico{font-size:11px;}

  #kana-chart .search-wrap{
    position:relative; flex:1 1 180px; min-width:150px;
  }
  #kana-chart .search-wrap input{
    width:100%;
    border:1.5px solid var(--border);
    background:var(--card-elevated);
    border-radius:30px;
    padding:11px 16px 11px 36px;
    font-size:14px;
    font-family:"Nunito",sans-serif;
    color:var(--fg);
    outline:none;
  }
  #kana-chart .search-wrap input:focus{border-color:var(--primary);}
  #kana-chart .search-wrap .icn{
    position:absolute; left:14px; top:50%; transform:translateY(-50%);
    font-size:13px; color:var(--fg-muted); pointer-events:none;
  }

  #kana-chart .tabs{
    display:flex; background:var(--card-elevated); border-radius:14px; padding:5px; gap:2px;
    margin-bottom:22px; overflow-x:auto;
  }
  #kana-chart .tab{
    flex:1 1 0; text-align:center; padding:9px 6px 10px 6px; border-radius:10px;
    cursor:pointer; font-family:"Noto Sans JP",sans-serif; font-weight:700; font-size:15.5px;
    color:var(--fg-muted); white-space:nowrap; transition:background .15s ease, color .15s ease;
  }
  #kana-chart .tab .en{
    display:block; font-family:"Nunito",sans-serif; font-size:10.5px; font-weight:700;
    color:var(--fg-muted); margin-top:1px;
  }
  #kana-chart .tab.active{ background:var(--primary-dim); color:var(--primary); box-shadow:var(--shadow-sm);}
  #kana-chart .tab.active .en{color:var(--primary);}

  #kana-chart /* ---------- Row groups ---------- */
  .row-group{
    display:flex; align-items:stretch; gap:10px; margin-bottom:10px;
  }
  #kana-chart .row-tag{
    flex:0 0 34px;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:900; letter-spacing:0.02em;
    color:var(--fg-muted);
    writing-mode:horizontal-tb;
    border-right:2px dashed var(--border);
    padding-right:6px;
  }
  #kana-chart .row-cells{
    flex:1;
    display:grid;
    grid-template-columns:repeat(5,1fr);
    gap:9px;
  }
  #kana-chart .row-cells.cols-3{grid-template-columns:repeat(3,1fr);}

  #kana-chart .vowel-row{
    display:grid; grid-template-columns:34px repeat(5,1fr); gap:9px;
    text-align:center; font-size:12px; font-weight:800; color:var(--fg-muted); margin-bottom:8px;
  }
  #kana-chart .vowel-row div:first-child{visibility:hidden;}

  #kana-chart /* ---------- Tile ---------- */
  .tile-outer{
    position:relative;
    aspect-ratio:1/1;
    perspective:600px;
  }
  #kana-chart .tile-outer.empty{visibility:hidden;}
  #kana-chart .tile-inner{
    position:relative; width:100%; height:100%;
    transform-style:preserve-3d;
    transition:transform .45s cubic-bezier(.4,.2,.2,1);
    border-radius:16px;
  }
  #kana-chart .tile-outer.flipped .tile-inner{transform:rotateY(180deg);}

  #kana-chart .face{
    position:absolute; inset:0;
    border-radius:16px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    backface-visibility:hidden;
    -webkit-backface-visibility:hidden;
    cursor:pointer;
    padding:6px;
    text-align:center;
  }
  #kana-chart .face.front{
    background:var(--card-elevated);
    transition:background .12s ease, transform .12s ease;
  }
  #kana-chart .face.front:active{transform:scale(0.94);}
  #kana-chart .face.front.speaking{background:var(--primary);}
  #kana-chart .face.front .kj{
    font-family:"Noto Sans JP",sans-serif; color:var(--fg);
    font-size:clamp(20px,6.5vw,30px); line-height:1;
  }
  #kana-chart .face.front .rm{ color:var(--fg-muted); font-size:10.5px; margin-top:5px; font-weight:700;}

  #kana-chart .face.back{
    background:var(--primary-dim);
    border:1.5px solid rgba(255,77,126,0.35);
    transform:rotateY(180deg);
    font-size:9.5px;
    line-height:1.35;
    color:var(--primary);
    gap:2px;
  }
  #kana-chart .face.back .mn{font-weight:800; font-size:10px; margin-bottom:2px;}
  #kana-chart .face.back .ex{font-size:9px; color:var(--primary); font-weight:700;}
  #kana-chart .face.back .ex .jp{font-size:11px;}

  #kana-chart .tile-outer.dim .face.front{opacity:0.22;}
  #kana-chart .tile-outer.match .face.front{outline:2px solid var(--success); outline-offset:2px;}

  #kana-chart .info-btn, #kana-chart .learn-btn{
    position:absolute; z-index:3;
    width:18px; height:18px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:900; color:#fff;
    cursor:pointer; border:2px solid var(--card);
  }
  #kana-chart .info-btn{ bottom:-4px; right:-4px; background:var(--primary);}
  #kana-chart .learn-btn{ top:-4px; left:-4px; background:var(--card-elevated);}
  #kana-chart .learn-btn.on{background:var(--success);}

  #kana-chart .sub-label{
    font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em;
    color:var(--fg-muted); margin:20px 0 8px 0; display:flex; align-items:center; gap:8px;
  }
  #kana-chart .sub-label:first-child{margin-top:2px;}
  #kana-chart .sub-label::after{content:''; flex:1; height:1px; background:var(--border);}

  #kana-chart .foot-note{ text-align:center; font-size:12px; color:var(--fg-subtle); margin-top:16px; font-weight:600;}
  #kana-chart .no-results{ text-align:center; padding:30px 10px; color:var(--fg-muted); font-size:14px;}

  #kana-chart /* ---------- Notes section ---------- */
  .notes-header{
    display:flex; align-items:baseline; justify-content:space-between; gap:10px; flex-wrap:wrap;
    margin:36px 0 14px 4px;
  }
  #kana-chart .notes-title{ font-size:22px; font-weight:900; color:var(--fg); margin:0;}
  #kana-chart .jump-nav{ display:flex; gap:6px; flex-wrap:wrap;}
  #kana-chart .jump-pill{
    font-size:11.5px; font-weight:700; color:var(--fg-muted);
    background:var(--card); border:1px solid var(--border); border-radius:20px;
    padding:5px 11px; cursor:pointer; text-decoration:none;
  }
  #kana-chart .jump-pill:hover{border-color:var(--primary); color:var(--primary);}

  #kana-chart .note-card{
    background:var(--card); border:1px solid var(--border); border-radius:18px;
    margin-bottom:12px; overflow:hidden; box-shadow:var(--shadow-lg);
    scroll-margin-top:20px;
  }
  #kana-chart .note-head{
    display:flex; align-items:center; justify-content:space-between;
    padding:15px 18px; cursor:pointer; gap:10px;
  }
  #kana-chart .note-head h3{
    font-size:15.5px; margin:0; display:flex; align-items:center; gap:11px; font-weight:800;
  }
  #kana-chart .note-icon{
    width:30px; height:30px; border-radius:9px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:15px; background:var(--primary-dim); color:var(--primary);
  }
  #kana-chart .chev{
    width:9px; height:9px; border-right:2px solid var(--fg-muted); border-bottom:2px solid var(--fg-muted);
    transform:rotate(45deg); transition:transform .2s ease; flex-shrink:0;
  }
  #kana-chart .note-card.collapsed .chev{transform:rotate(-135deg);}
  #kana-chart .note-body{ padding:0 18px 18px 18px; font-size:14px; line-height:1.65; color:var(--fg);}
  #kana-chart .note-card.collapsed .note-body{display:none;}
  #kana-chart .note-body p{margin:0 0 11px 0;}
  #kana-chart .note-body p:last-child{margin-bottom:0;}
  #kana-chart .accent{color:var(--primary); font-weight:800;}

  #kana-chart .xrow{ display:flex; align-items:center; gap:9px; flex-wrap:wrap; margin:13px 0;}
  #kana-chart .xbox{ background:var(--primary-dim); border:1.5px solid rgba(255,77,126,0.35); border-radius:10px; padding:8px 13px; text-align:center; min-width:70px;}
  #kana-chart .xbox .jp{font-size:19px; display:block; color:var(--fg);}
  #kana-chart .xbox .rm{font-size:10px; color:var(--fg-muted); margin-top:2px;}
  #kana-chart .arrow{color:var(--primary); font-weight:900; font-size:16px;}

  #kana-chart .wline{ display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed var(--border); gap:10px;}
  #kana-chart .wline:last-child{border-bottom:none;}
  #kana-chart .wline .jp{font-size:17px;}
  #kana-chart .wline .m{font-size:11.5px; color:var(--fg-muted); text-align:right;}

  #kana-chart table.tbl{width:100%; border-collapse:collapse; margin:11px 0; font-size:12.5px;}
  #kana-chart table.tbl th, #kana-chart table.tbl td{border:1px solid var(--border); padding:7px 8px; text-align:center;}
  #kana-chart table.tbl th{background:var(--card-elevated); font-weight:800;}
  #kana-chart table.tbl .big{font-size:17px;}

  #kana-chart .callout{ background:var(--primary-dim); border-left:3px solid var(--primary); padding:9px 13px; font-size:12.5px; border-radius:0 8px 8px 0; margin:11px 0;}

  @media(max-width:400px){
    #kana-chart .face.front .kj{font-size:20px;}
    #kana-chart .row-cells{gap:6px;}
    #kana-chart .row-tag{flex-basis:26px; font-size:10px;}
  }

  #kana-chart /* =========================================================
     KANA QUIZ
     ========================================================= */
  .quiz-btn{
    position:relative;
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 55%, #B02050 100%);
    color:#fff; border:none; border-radius:30px;
    padding:11px 22px; font-size:14.5px; font-weight:800;
    font-family:"Nunito",sans-serif; cursor:pointer;
    box-shadow:0 6px 18px rgba(255,77,126,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
    overflow:hidden;
    transition:transform .15s ease, box-shadow .15s ease;
    animation:quizFloat 3.2s ease-in-out infinite;
  }
  #kana-chart .quiz-btn .ico{font-size:14px;}
  #kana-chart .quiz-btn::before{
    content:''; position:absolute; inset:0;
    background:linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
    transform:translateX(-120%);
    transition:transform .6s ease;
  }
  #kana-chart .quiz-btn:hover::before{transform:translateX(120%);}
  #kana-chart .quiz-btn:hover{ box-shadow:0 8px 24px rgba(255,77,126,0.5), inset 0 1px 0 rgba(255,255,255,0.3); }
  #kana-chart .quiz-btn:active{ transform:scale(0.95); }
  #kana-chart .quiz-btn:focus-visible{ outline:3px solid #fff; outline-offset:2px; }
  @keyframes quizFloat{
    0%,100%{ transform:translateY(0); }
    50%{ transform:translateY(-3px); }
  }
  #kana-chart .quiz-btn .ripple{
    position:absolute; border-radius:50%; background:rgba(255,255,255,0.5);
    transform:scale(0); animation:rippleAnim .55s ease-out forwards; pointer-events:none;
  }
  @keyframes rippleAnim{ to{ transform:scale(3); opacity:0; } }

  #kana-chart .quiz-overlay{
    position:fixed; inset:0; z-index:100;
    background:var(--bg);
    display:block;
    overflow-y:auto;
  }
  #kana-chart .quiz-overlay.hidden{display:none;}
  #kana-chart .quiz-panel{
    width:100%; min-height:100vh;
    max-width:none;
    background:var(--bg);
    border:none;
    border-radius:0;
    box-shadow:none;
    padding:34px 18px 80px 18px;
    position:relative;
    animation:panelPop .3s cubic-bezier(.2,.9,.3,1.2);
    display:flex; flex-direction:column;
  }
  #kana-chart .quiz-panel-inner{
    width:100%; max-width:560px; margin:0 auto;
    flex:1; display:flex; flex-direction:column;
  }
  @keyframes panelPop{
    from{ opacity:0; transform:translateY(18px) scale(.97); }
    to{ opacity:1; transform:translateY(0) scale(1); }
  }
  #kana-chart .quiz-close{
    position:absolute; top:16px; right:16px;
    width:32px; height:32px; border-radius:50%;
    background:var(--card); border:1px solid var(--border);
    display:flex; align-items:center; justify-content:center;
    font-size:15px; color:var(--fg-muted); cursor:pointer;
  }
  #kana-chart .quiz-close:hover{ color:var(--primary); border-color:var(--primary); }

  #kana-chart .quiz-screen{ display:none; }
  #kana-chart .quiz-screen.active{ display:flex; flex-direction:column; flex:1; }

  #kana-chart .quiz-hero{ text-align:center; padding:6px 6px 4px 6px; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; }
  #kana-chart .quiz-hero h2{ font-size:26px; font-weight:900; margin:6px 0 10px 0; }
  #kana-chart .quiz-hero p{ font-size:14px; color:var(--fg-muted); line-height:1.6; max-width:400px; margin:0 auto 18px auto; }

  #kana-chart .mascot{ width:120px; height:120px; margin:8px auto 6px auto; position:relative; animation:mascotFloat 3.4s ease-in-out infinite; }
  @keyframes mascotFloat{ 0%,100%{ transform:translateY(0) rotate(-1deg);} 50%{ transform:translateY(-8px) rotate(1deg);} }
  #kana-chart .mascot .blink{ animation:blink 4.5s infinite; transform-origin:center; }
  @keyframes blink{ 0%,92%,100%{ transform:scaleY(1);} 94%{ transform:scaleY(0.1);} 96%{ transform:scaleY(1);} }

  #kana-chart .play-now-btn{
    display:inline-flex; align-items:center; gap:10px; justify-content:center;
    background:linear-gradient(135deg,var(--success),#2F8F5B);
    color:#fff; border:none; border-radius:30px; width:100%;
    padding:16px 20px; font-size:17px; font-weight:900;
    font-family:"Nunito",sans-serif; cursor:pointer;
    box-shadow:0 10px 26px rgba(76,175,130,0.4);
    transition:transform .12s ease, box-shadow .12s ease;
    position:relative; overflow:hidden;
  }
  #kana-chart .play-now-btn:hover{ box-shadow:0 12px 30px rgba(76,175,130,0.55); transform:translateY(-1px); }
  #kana-chart .play-now-btn:active{ transform:scale(0.96); }

  #kana-chart .cfg-label{ font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:var(--fg-muted); margin:18px 0 8px 0; }
  #kana-chart .cfg-label:first-of-type{ margin-top:2px; }
  #kana-chart .toggle-row{ display:flex; gap:10px; }
  #kana-chart .toggle-btn{
    flex:1; text-align:center; padding:16px 10px; border-radius:16px;
    border:2px solid var(--border); background:var(--card); cursor:pointer;
    font-family:"Noto Sans JP",sans-serif; font-weight:800; font-size:20px; color:var(--fg-muted);
    transition:all .15s ease;
  }
  #kana-chart .toggle-btn .en{ display:block; font-family:"Nunito",sans-serif; font-size:11px; font-weight:700; margin-top:3px; color:var(--fg-muted);}
  #kana-chart .toggle-btn.active{ border-color:var(--primary); background:var(--primary-dim); color:var(--primary); }
  #kana-chart .toggle-btn.active .en{ color:var(--primary); }

  #kana-chart .seg-row{ display:flex; background:var(--card-elevated); border-radius:14px; padding:4px; gap:2px; }
  #kana-chart .seg-btn{ flex:1; text-align:center; padding:9px 4px; border-radius:10px; cursor:pointer; font-size:12.5px; font-weight:700; color:var(--fg-muted); transition:all .15s ease;}
  #kana-chart .seg-btn.active{ background:var(--primary-dim); color:var(--primary); box-shadow:var(--shadow-sm);}

  #kana-chart .cfg-row-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;}
  #kana-chart .menu-btn{
    display:inline-flex; align-items:center; gap:6px;
    background:var(--card-elevated); border:1px solid var(--border); border-radius:20px;
    padding:8px 14px; font-size:12.5px; font-weight:800; color:var(--fg-muted); cursor:pointer;
  }
  #kana-chart .menu-btn:hover{ color:var(--primary); border-color:var(--primary); }

  #kana-chart .start-btn{
    display:block; width:100%; margin-top:22px;
    background:linear-gradient(135deg,var(--primary),var(--primary-hover));
    color:#fff; border:none; border-radius:30px;
    padding:16px 20px; font-size:17px; font-weight:900;
    font-family:"Nunito",sans-serif; cursor:pointer;
    box-shadow:0 10px 26px rgba(255,77,126,0.4);
    transition:transform .12s ease, box-shadow .12s ease;
  }
  #kana-chart .start-btn:hover{ box-shadow:0 12px 30px rgba(255,77,126,0.55); transform:translateY(-1px); }
  #kana-chart .start-btn:active{ transform:scale(0.96); }

  #kana-chart .slide-menu-backdrop{
    position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(3px);
    z-index:150; display:none;
  }
  #kana-chart .slide-menu-backdrop.open{ display:block; }
  #kana-chart .slide-menu{
    position:fixed; top:0; right:-320px; width:290px; height:100%;
    background:var(--bg); border-left:1px solid var(--border);
    box-shadow:-16px 0 40px rgba(0,0,0,0.25);
    z-index:151; padding:26px 20px; transition:right .3s cubic-bezier(.2,.9,.3,1.1);
  }
  #kana-chart .slide-menu.open{ right:0; }
  #kana-chart .slide-menu h3{ font-size:16px; font-weight:900; margin:0 0 16px 0; }
  #kana-chart .menu-item{
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    padding:13px 14px; border-radius:14px; margin-bottom:8px;
    background:var(--card); border:1px solid var(--border); cursor:pointer;
    font-size:14px; font-weight:700; color:var(--fg);
  }
  #kana-chart .menu-item:hover{ border-color:var(--primary); color:var(--primary); }
  #kana-chart .menu-item .sw{ width:38px; height:20px; border-radius:20px; background:var(--card-elevated); position:relative; flex-shrink:0; transition:background .15s ease;}
  #kana-chart .menu-item .sw::after{ content:''; position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .15s ease; box-shadow:var(--shadow-sm);}
  #kana-chart .menu-item .sw.on{ background:var(--success); }
  #kana-chart .menu-item .sw.on::after{ left:20px; }

  #kana-chart .stat-bar{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }
  #kana-chart .stat-chip{
    flex:1 1 70px; text-align:center; background:var(--card); border:1px solid var(--border);
    border-radius:12px; padding:8px 6px;
  }
  #kana-chart .stat-chip .v{ font-size:16px; font-weight:900; color:var(--fg); }
  #kana-chart .stat-chip .l{ font-size:9.5px; color:var(--fg-muted); font-weight:700; text-transform:uppercase; letter-spacing:.04em;}
  #kana-chart .stat-chip.streak .v{ color:var(--primary); }
  #kana-chart .stat-chip.xp .v{ color:var(--accent); }

  #kana-chart .timer-wrap{ display:flex; justify-content:center; margin-bottom:10px; }
  #kana-chart .timer-ring{ width:56px; height:56px; position:relative; }
  #kana-chart .timer-ring svg{ transform:rotate(-90deg); }
  #kana-chart .timer-ring circle{ fill:none; stroke-width:5; }
  #kana-chart .timer-ring .bgc{ stroke:var(--card-elevated); }
  #kana-chart .timer-ring .fgc{ stroke:var(--success); stroke-linecap:round; transition:stroke-dashoffset 1s linear, stroke .2s ease; }
  #kana-chart .timer-ring .num{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; color:var(--fg); }
  #kana-chart .timer-ring.warn .fgc{ stroke:var(--danger); }

  #kana-chart .flash-wrap{ perspective:900px; margin-bottom:20px; flex:1; display:flex; align-items:center; justify-content:center; min-height:30vh; }
  #kana-chart .flashcard{
    background:var(--card-elevated); border-radius:24px; padding:36px 20px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    width:100%; max-width:340px; min-height:220px; box-shadow:var(--shadow-lg);
    transition:transform .3s ease, opacity .3s ease;
  }
  #kana-chart .flashcard .kj{ font-family:"Noto Sans JP",sans-serif; color:var(--fg); font-size:clamp(48px,16vw,72px); line-height:1; }
  #kana-chart .flashcard.swipe-right{ transform:translateX(160%) rotate(12deg); opacity:0; }
  #kana-chart .flashcard.swipe-left{ transform:translateX(-160%) rotate(-12deg); opacity:0; }
  #kana-chart .flashcard.swipe-up{ transform:translateY(-160%) scale(.85); opacity:0; }
  #kana-chart .flashcard.shake{ animation:shakeAnim .35s ease; }
  @keyframes shakeAnim{ 0%,100%{transform:translateX(0);} 25%{transform:translateX(-8px);} 75%{transform:translateX(8px);} }

  #kana-chart .answer-row{ display:flex; gap:10px; }
  #kana-chart .answer-input{
    flex:1; border:2px solid var(--border); background:var(--card); border-radius:16px;
    padding:14px 16px; font-size:16px; font-family:"Nunito",sans-serif; color:var(--fg); outline:none;
    transition:border-color .15s ease;
  }
  #kana-chart .answer-input:focus{ border-color:var(--primary); }
  #kana-chart .answer-input.correct{ border-color:var(--success); background:rgba(76,175,130,0.15); }
  #kana-chart .answer-input.incorrect{ border-color:var(--danger); background:var(--danger-dim); }
  #kana-chart .submit-btn{
    background:var(--primary); color:#fff; border:none; border-radius:16px;
    padding:0 20px; font-weight:800; font-size:14px; cursor:pointer;
  }
  #kana-chart .submit-btn:active{ transform:scale(.95); }

  #kana-chart .quit-row{ text-align:center; margin-top:16px; }
  #kana-chart .quit-link{ font-size:12.5px; color:var(--fg-muted); cursor:pointer; text-decoration:underline; }
  #kana-chart .quit-link:hover{ color:var(--primary); }

  #kana-chart .result-hero{ text-align:center; }
  #kana-chart .result-hero .big-xp{ font-size:40px; font-weight:900; color:var(--primary); margin:10px 0 2px 0; }
  #kana-chart .result-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:18px 0; }
  #kana-chart .result-card{ background:var(--card); border:1px solid var(--border); border-radius:14px; padding:12px; text-align:center; }
  #kana-chart .result-card .v{ font-size:20px; font-weight:900; }
  #kana-chart .result-card .l{ font-size:10.5px; color:var(--fg-muted); font-weight:700; text-transform:uppercase; }

  #kana-chart .confetti-piece{
    position:fixed; top:-10px; width:8px; height:14px; z-index:200; pointer-events:none;
    animation:confettiFall linear forwards;
  }
  @keyframes confettiFall{
    to{ transform:translateY(110vh) rotate(540deg); opacity:0.2; }
  }

  @media(max-width:400px){
    #kana-chart .quiz-panel{ padding:20px 16px 24px 16px; }
    #kana-chart .flashcard{ min-height:150px; padding:26px 14px; }
  }

  #kana-chart /* =========================================================
     CHARACTER DETAIL VIEW  (reuses quiz-overlay / note-card /
     xbox / wline / menu-btn visual language — same theme)
     ========================================================= */
  .detail-overlay{
    position:fixed; inset:0; z-index:110;
    background:var(--bg);
    display:block; overflow-y:auto;
  }
  #kana-chart .detail-overlay.hidden{ display:none; }
  #kana-chart .detail-panel{
    width:100%; min-height:100vh; max-width:none;
    background:var(--bg); border:none; border-radius:0; box-shadow:none;
    padding:34px 18px 90px 18px; position:relative;
    animation:panelPop .3s cubic-bezier(.2,.9,.3,1.2);
  }
  #kana-chart .detail-inner{ width:100%; max-width:560px; margin:0 auto; }

  #kana-chart .detail-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  #kana-chart .detail-navbtn{
    display:flex; align-items:center; justify-content:center; gap:4px;
    width:38px; height:38px; border-radius:50%;
    background:var(--card); border:1px solid var(--border);
    color:var(--fg-muted); font-size:16px; font-weight:900; cursor:pointer; flex-shrink:0;
  }
  #kana-chart .detail-navbtn:hover{ color:var(--primary); border-color:var(--primary); }
  #kana-chart .detail-navbtn:disabled{ opacity:0.3; cursor:default; }
  #kana-chart .detail-navbtn:disabled:hover{ color:var(--fg-muted); border-color:var(--border); }

  #kana-chart .detail-hero{
    text-align:center; background:var(--card-elevated); border-radius:22px;
    padding:30px 18px 22px 18px; margin:10px 0 18px 0;
    box-shadow:var(--shadow-xl);
  }
  #kana-chart .detail-hero .kj{
    font-family:"Noto Sans JP",sans-serif; color:var(--fg);
    font-size:clamp(56px,18vw,84px); line-height:1; display:block;
  }
  #kana-chart .detail-hero .rm{ color:var(--fg-muted); font-size:16px; font-weight:800; margin-top:6px; }
  #kana-chart .detail-hero .type-badge{
    display:inline-block; margin-top:12px; background:var(--primary); color:#fff;
    font-size:11px; font-weight:800; letter-spacing:.04em; text-transform:uppercase;
    padding:5px 14px; border-radius:20px;
  }
  #kana-chart .detail-hero .say-btn{
    display:inline-flex; align-items:center; gap:8px; margin-top:14px;
    background:var(--primary); color:#fff; border:none; border-radius:30px;
    padding:10px 18px; font-size:13.5px; font-weight:800; font-family:"Nunito",sans-serif;
    cursor:pointer; transition:background .15s ease, transform .1s ease;
  }
  #kana-chart .detail-hero .say-btn:hover{ background:var(--primary-hover); }
  #kana-chart .detail-hero .say-btn:active{ transform:scale(0.96); }
  #kana-chart .detail-hero .say-btn.slow{ background:var(--card-elevated); color:var(--fg-muted); margin-left:8px; }
  #kana-chart .detail-hero .say-btn.slow:hover{ color:var(--primary); }
  #kana-chart .detail-hero .say-btn.speaking{ background:var(--success); }

  #kana-chart .detail-desc{ font-size:14px; line-height:1.65; color:var(--fg); margin:0 0 4px 0; }

  #kana-chart .similar-row{ display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
  #kana-chart .similar-chip{
    display:inline-flex; align-items:center; gap:6px;
    background:var(--primary-dim); border:1.5px solid rgba(255,77,126,0.35); border-radius:20px;
    padding:6px 12px 6px 10px; cursor:pointer; font-family:"Noto Sans JP",sans-serif;
    font-size:16px; font-weight:700; color:var(--primary);
  }
  #kana-chart .similar-chip:hover{ border-color:var(--primary); }
  #kana-chart .similar-chip .lbl{ font-family:"Nunito",sans-serif; font-size:10px; color:var(--primary); font-weight:800; }

  #kana-chart .word-card{
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    background:var(--card); border:1px solid var(--border); border-radius:14px;
    padding:12px 14px; margin-bottom:9px;
  }
  #kana-chart .word-card .wtext .jp{ font-size:18px; display:block; }
  #kana-chart .word-card .wtext .m{ font-size:11.5px; color:var(--fg-muted); margin-top:2px; }
  #kana-chart .word-play{
    flex-shrink:0; width:32px; height:32px; border-radius:50%;
    background:var(--card-elevated); color:var(--fg); border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:11px;
  }
  #kana-chart .word-play.speaking{ background:var(--primary); }

  #kana-chart .sentence-card{
    background:var(--card); border:1px solid var(--border); border-radius:14px;
    padding:13px 15px; margin-bottom:9px;
  }
  #kana-chart .sentence-card .jp{ font-size:16.5px; margin-bottom:4px; }
  #kana-chart .sentence-card .rm{ font-size:11.5px; color:var(--primary); font-weight:700; margin-bottom:2px; }
  #kana-chart .sentence-card .en{ font-size:12px; color:var(--fg-muted); }
  #kana-chart .sentence-card .word-play{ margin-top:8px; }

  #kana-chart .empty-note{ font-size:12.5px; color:var(--fg-muted); font-style:italic; padding:4px 2px; }

  #kana-chart /* ---------- Writing practice ---------- */
  .practice-card{
    background:var(--card); border:1px solid var(--border); border-radius:18px;
    padding:16px 16px 18px 16px; margin-top:8px; box-shadow:var(--shadow-lg);
  }
  #kana-chart .practice-toprow{ display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
  #kana-chart .trace-toggle-wrap{ display:flex; align-items:center; gap:8px; font-size:12.5px; font-weight:700; color:var(--fg-muted); }
  #kana-chart .trace-sw{ width:38px; height:20px; border-radius:20px; background:var(--card-elevated); position:relative; flex-shrink:0; cursor:pointer; transition:background .15s ease; }
  #kana-chart .trace-sw::after{ content:''; position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .15s ease; box-shadow:var(--shadow-sm); }
  #kana-chart .trace-sw.on{ background:var(--success); }
  #kana-chart .trace-sw.on::after{ left:20px; }

  #kana-chart .canvas-wrap{
    position:relative; width:100%; aspect-ratio:1/1; max-width:320px; margin:0 auto;
    background:var(--card-elevated); border:1.5px dashed var(--border); border-radius:16px; overflow:hidden;
    touch-action:none;
  }
  #kana-chart .canvas-wrap canvas{ position:absolute; inset:0; width:100%; height:100%; cursor:crosshair; }

  #kana-chart .practice-toolbar{ display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:14px; }
  #kana-chart .tool-btn{
    display:inline-flex; align-items:center; gap:6px;
    background:var(--card-elevated); border:1px solid var(--border); border-radius:20px;
    padding:8px 14px; font-size:12.5px; font-weight:800; color:var(--fg-muted); cursor:pointer;
    font-family:"Nunito",sans-serif;
  }
  #kana-chart .tool-btn:hover{ color:var(--primary); border-color:var(--primary); }
  #kana-chart .tool-btn:disabled{ opacity:0.4; cursor:default; }
  #kana-chart .tool-btn:disabled:hover{ color:var(--fg-muted); border-color:var(--border); }
  #kana-chart .tool-btn.save{ background:var(--primary); color:#fff; border-color:var(--primary); }
  #kana-chart .tool-btn.save:hover{ background:var(--primary-hover); color:#fff; }
  #kana-chart .tool-btn.clear{ color:var(--danger); }
  #kana-chart .tool-btn.clear:hover{ border-color:var(--danger); color:var(--danger); }

  @media(max-width:400px){
    #kana-chart .detail-hero .kj{ font-size:52px; }
    #kana-chart .canvas-wrap{ max-width:100%; }
  }
`;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ── MARKUP ───────────────────────────────────────────────────
  var MARKUP = `
<main>

  <h1 class="page-title"><span class="jp">かな</span> Kana Chart</h1>
  <p class="page-sub">Hiragana · Katakana · Dakuten · Combinations, organized row by row so patterns are easy to spot. Tap a tile to hear it, flip it for a memory hint, and mark it once you've got it down.</p>

  <div class="legend">
    <div class="li"><span class="swatch sw-speak">♪</span> Tap tile → hear pronunciation</div>
    <div class="li"><span class="swatch sw-info">i</span> Tap ⓘ → memory hint &amp; example word</div>
    <div class="li"><span class="swatch sw-learn">✓</span> Tap ✓ → mark as learned</div>
  </div>

  <div class="chart-card">
    <div class="chart-top">
      <div>
        <h2>Kana Chart</h2>
        <p class="hint">Grouped by consonant row — read left to right, top to bottom</p>
      </div>
      <div class="progress-pill">
        <span id="progLabel">0 / 46 learned</span>
        <div class="bar-outer"><div class="bar-inner" id="progBar"></div></div>
      </div>
    </div>

    <div class="actions-row">
      <button class="play-all" id="playAllBtn"><span class="ico">▶</span> Play All</button>
      <button class="quiz-btn" id="quizBtn" aria-haspopup="dialog"><span class="ico">🎮</span> Kana Quiz</button>
      <div class="search-wrap">
        <span class="icn">🔍</span>
        <input type="text" id="searchInput" placeholder="Find by romaji, e.g. 'ka' or 'shi'">
      </div>
    </div>

    <div class="tabs">
      <div class="tab active" data-tab="hira"><span class="jp">ひらがな</span><span class="en">Hiragana</span></div>
      <div class="tab" data-tab="kata"><span class="jp">カタカナ</span><span class="en">Katakana</span></div>
      <div class="tab" data-tab="daku"><span class="jp">濁点</span><span class="en">Dakuten</span></div>
      <div class="tab" data-tab="combo"><span class="jp">組み合わせ</span><span class="en">Combinations</span></div>
    </div>

    <div id="chartArea"></div>
    <p class="foot-note" id="footNote"></p>
  </div>

  <div class="quiz-overlay hidden" id="quizOverlay" role="dialog" aria-modal="true" aria-label="Kana Quiz">
    <div class="quiz-panel">
      <button class="quiz-close" id="quizCloseBtn" aria-label="Close quiz">✕</button>
      <div class="quiz-panel-inner">

      <!-- LANDING -->
      <div class="quiz-screen active" id="screenLanding">
        <div class="quiz-hero">
          <div class="mascot" aria-hidden="true">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <defs>
                <linearGradient id="mascotGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#FF6B93"/>
                  <stop offset="1" stop-color="#E8386A"/>
                </linearGradient>
              </defs>
              <ellipse cx="60" cy="68" rx="46" ry="40" fill="url(#mascotGrad)"/>
              <circle cx="60" cy="32" r="19" fill="#FF6B93"/>
              <text x="60" y="38" font-size="16" text-anchor="middle" fill="#fff" font-family="'Noto Sans JP',sans-serif" font-weight="700">か</text>
              <g class="blink">
                <ellipse cx="47" cy="64" rx="5" ry="7" fill="#2b1440"/>
                <ellipse cx="73" cy="64" rx="5" ry="7" fill="#2b1440"/>
              </g>
              <path d="M48 80 Q60 89 72 80" stroke="#2b1440" stroke-width="3.5" fill="none" stroke-linecap="round"/>
              <ellipse cx="28" cy="72" rx="7" ry="5" fill="#FF8FA8" opacity="0.65"/>
              <ellipse cx="92" cy="72" rx="7" ry="5" fill="#FF8FA8" opacity="0.65"/>
            </svg>
          </div>
          <h2>Kana Quiz</h2>
          <p>Have fun while learning to read and write in Japanese! This flashcard arcade game helps beginners learn Hiragana and Katakana. First time learning Kana? Try the Study page first.</p>
          <button class="play-now-btn" id="playNowBtn"><span class="ico">▶</span> PLAY NOW</button>
        </div>
      </div>

      <!-- CONFIG -->
      <div class="quiz-screen" id="screenConfig">
        <div class="cfg-row-top">
          <h2 style="font-size:20px;font-weight:900;margin:0;">Set Up Your Quiz</h2>
          <button class="menu-btn" id="menuOpenBtn">☰ Menu</button>
        </div>

        <div class="cfg-label">Script</div>
        <div class="toggle-row">
          <div class="toggle-btn jp active" data-kanatype="hira">か<span class="en">Hiragana</span></div>
          <div class="toggle-btn jp" data-kanatype="kata">カ<span class="en">Katakana</span></div>
        </div>

        <div class="cfg-label">Character Set</div>
        <div class="seg-row">
          <div class="seg-btn active" data-variant="mono">Monographs</div>
          <div class="seg-btn" data-variant="daku">Diacritics</div>
          <div class="seg-btn" data-variant="combo">Digraphs</div>
          <div class="seg-btn" data-variant="all">All</div>
        </div>

        <button class="start-btn" id="startBtn">START</button>
      </div>

      <!-- GAMEPLAY -->
      <div class="quiz-screen" id="screenPlay">
        <div class="stat-bar">
          <div class="stat-chip"><div class="v" id="statCorrect">0</div><div class="l">Correct</div></div>
          <div class="stat-chip"><div class="v" id="statIncorrect">0</div><div class="l">Wrong</div></div>
          <div class="stat-chip"><div class="v" id="statSkipped">0</div><div class="l">Skipped</div></div>
          <div class="stat-chip streak"><div class="v" id="statStreak">0</div><div class="l">Streak</div></div>
          <div class="stat-chip xp"><div class="v" id="statXP">0</div><div class="l">XP</div></div>
        </div>

        <div class="timer-wrap">
          <div class="timer-ring" id="timerRing">
            <svg width="56" height="56">
              <circle class="bgc" cx="28" cy="28" r="24"></circle>
              <circle class="fgc" id="timerCircle" cx="28" cy="28" r="24"></circle>
            </svg>
            <div class="num" id="timerNum">60</div>
          </div>
        </div>

        <div class="flash-wrap">
          <div class="flashcard" id="flashcard">
            <span class="kj jp" id="flashKana">あ</span>
          </div>
        </div>

        <div class="answer-row">
          <input type="text" class="answer-input" id="answerInput" placeholder="Type the Romaji" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type the Romaji">
          <button class="submit-btn" id="submitBtn">Enter</button>
        </div>

        <div class="quit-row"><span class="quit-link" id="quitBtn" tabindex="0">End session</span></div>
      </div>

      <!-- RESULTS -->
      <div class="quiz-screen" id="screenResults">
        <div class="result-hero">
          <h2 style="font-size:22px;font-weight:900;margin:6px 0;">Round Complete!</h2>
          <div class="big-xp"><span id="resXP">0</span> XP</div>
        </div>
        <div class="result-grid">
          <div class="result-card"><div class="v" id="resCorrect">0</div><div class="l">Correct</div></div>
          <div class="result-card"><div class="v" id="resIncorrect">0</div><div class="l">Wrong</div></div>
          <div class="result-card"><div class="v" id="resSkipped">0</div><div class="l">Skipped</div></div>
          <div class="result-card"><div class="v" id="resBest">0</div><div class="l">Best Streak</div></div>
        </div>
        <button class="play-now-btn" id="playAgainBtn"><span class="ico">↻</span> PLAY AGAIN</button>
        <button class="menu-btn" id="backToStudyBtn" style="width:100%;justify-content:center;margin-top:10px;">Back to Study</button>
      </div>
      </div>
    </div>
  </div>

  <div class="slide-menu-backdrop" id="menuBackdrop"></div>
  <div class="slide-menu" id="slideMenu">
    <h3>Quiz Menu</h3>
    <div class="menu-item" id="menuPlayNow" tabindex="0"><span>▶ Play Now</span></div>
    <div class="menu-item" id="menuLeaderboard" tabindex="0"><span>🏆 Leaderboard</span><span id="menuBestScore">Best: 0 XP</span></div>
    <div class="menu-item" id="menuStudy" tabindex="0"><span>📖 Study</span></div>
    <div class="menu-item" id="menuAbout" tabindex="0"><span>ℹ️ About</span></div>
    <div class="menu-item" id="menuSound" tabindex="0"><span>🔊 Sound</span><span class="sw on" id="soundSwitch"></span></div>
  </div>

  <div class="detail-overlay hidden" id="detailOverlay" role="dialog" aria-modal="true" aria-label="Kana character detail">
    <div class="detail-panel">
      <button class="quiz-close" id="detailCloseBtn" aria-label="Close character detail">✕</button>
      <div class="detail-inner">

        <div class="detail-top">
          <button class="detail-navbtn" id="detailPrevBtn" aria-label="Previous character">←</button>
          <span style="font-size:11.5px;font-weight:800;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.06em;" id="detailPosLabel"></span>
          <button class="detail-navbtn" id="detailNextBtn" aria-label="Next character">→</button>
        </div>

        <div class="detail-hero">
          <span class="kj jp" id="dtKana">あ</span>
          <span class="rm" id="dtRomaji">a</span>
          <div class="type-badge" id="dtType">Hiragana</div>
          <div>
            <button class="say-btn" id="dtPlayBtn" aria-label="Play pronunciation"><span>▶</span> Listen</button>
            <button class="say-btn slow" id="dtPlaySlowBtn" aria-label="Play pronunciation slowly"><span>🐢</span> Slow</button>
          </div>
        </div>

        <p class="detail-desc" id="dtDescription"></p>

        <div class="sub-label">Similar-Looking Kana</div>
        <div class="similar-row" id="dtSimilar"></div>

        <div class="sub-label">Usage Notes</div>
        <div class="callout" id="dtUsage"></div>

        <div class="sub-label">Example Words</div>
        <div id="dtWords"></div>

        <div class="sub-label">Example Sentences</div>
        <div id="dtSentences"></div>

        <div class="sub-label">Writing Practice</div>
        <div class="practice-card">
          <div class="practice-toprow">
            <div class="trace-toggle-wrap">
              <span class="trace-sw on" id="traceSw" role="switch" aria-checked="true" tabindex="0" aria-label="Toggle trace mode"></span>
              Trace Mode
            </div>
            <span style="font-size:11.5px;color:var(--fg-muted);">Draw with mouse, touch, or stylus</span>
          </div>
          <div class="canvas-wrap" id="canvasWrap">
            <canvas id="practiceCanvas" aria-label="Handwriting practice canvas"></canvas>
          </div>
          <div class="practice-toolbar">
            <button class="tool-btn" id="undoBtn" aria-label="Undo last stroke">↺ Undo</button>
            <button class="tool-btn" id="redoBtn" aria-label="Redo stroke">↻ Redo</button>
            <button class="tool-btn clear" id="clearBtn" aria-label="Clear canvas">🗑 Clear</button>
            <button class="tool-btn save" id="saveBtn" aria-label="Save canvas as PNG">⬇ Save PNG</button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div class="notes-header">
    <h2 class="notes-title">Notes for Beginners</h2>
    <div class="jump-nav">
      <a class="jump-pill" href="#n1">Basics</a>
      <a class="jump-pill" href="#n3">Dakuten</a>
      <a class="jump-pill" href="#n4">Combos</a>
      <a class="jump-pill" href="#n6">Long Vowels</a>
    </div>
  </div>

  <section class="note-card" id="n1">
    <div class="note-head"><h3><span class="note-icon">文</span>What is Hiragana &amp; Katakana?</h3><div class="chev"></div></div>
    <div class="note-body">
      <p>Japanese has two phonetic scripts that both cover the exact same 46 core sounds, just written differently. <span class="accent">Hiragana</span> (curvy) is used for native Japanese words and grammar. <span class="accent">Katakana</span> (angular, straight-edged) is used for foreign/loan words, brand names, and onomatopoeia.</p>
      <div class="wline"><span class="jp">コーヒー</span><span class="m">coffee — koohii (katakana)</span></div>
      <div class="wline"><span class="jp">ありがとう</span><span class="m">thank you — arigatou (hiragana)</span></div>
      <p>Unlike English, each character is a whole syllable (a consonant + vowel), not a single sound. That's why the chart above is organized <b>row by row</b> — each row shares a consonant, and each column shares a vowel (a, i, u, e, o).</p>
    </div>
  </section>

  <section class="note-card" id="n2">
    <div class="note-head"><h3><span class="note-icon">!</span>Reading Exceptions</h3><div class="chev"></div></div>
    <div class="note-body">
      <p>Most kana follow the pattern consonant+vowel exactly as spelled, but four in the chart don't — spot them by their row position (T-row and H-row):</p>
      <table class="tbl">
        <tr><th>Kana</th><th>Looks like</th><th>Actually said as</th></tr>
        <tr><td class="big jp">し</td><td>si</td><td><b>shi</b></td></tr>
        <tr><td class="big jp">ち</td><td>ti</td><td><b>chi</b></td></tr>
        <tr><td class="big jp">つ</td><td>tu</td><td><b>tsu</b></td></tr>
        <tr><td class="big jp">ふ</td><td>hu</td><td><b>fu</b> (soft, breathy)</td></tr>
      </table>
      <p>These same exceptions carry over to katakana (シ, チ, ツ, フ) and to every dakuten/combination built from them.</p>
    </div>
  </section>

  <section class="note-card" id="n3">
    <div class="note-head"><h3><span class="note-icon">゛</span>Dakuten (゛) &amp; Handakuten (゜)</h3><div class="chev"></div></div>
    <div class="note-body">
      <p>Adding two small strokes (<span class="accent">dakuten</span>) or a small circle (<span class="accent">handakuten</span>) to the upper-right corner of certain kana changes the consonant sound. No new characters to learn — just a sound shift, which is why the Dakuten tab is grouped directly under its base row.</p>
      <div class="xrow">
        <div class="xbox"><span class="jp">か</span><div class="rm">ka</div></div>
        <span class="arrow">→</span>
        <div class="xbox"><span class="jp">が</span><div class="rm">ga</div></div>
      </div>
      <div class="xrow">
        <div class="xbox"><span class="jp">は</span><div class="rm">ha</div></div>
        <span class="arrow">→</span>
        <div class="xbox"><span class="jp">ば</span><div class="rm">ba</div></div>
        <span class="arrow">→</span>
        <div class="xbox"><span class="jp">ぱ</span><div class="rm">pa</div></div>
      </div>
      <p>Pattern: <b>k→g</b>, <b>s→z</b>, <b>t→d</b>, <b>h→b</b> (dakuten) or <b>h→p</b> (handakuten, only on the H-row). Katakana follows the exact same corner-mark rule: カ→ガ, ハ→バ→パ.</p>
    </div>
  </section>

  <section class="note-card" id="n4">
    <div class="note-head"><h3><span class="note-icon">ゃ</span>Small ゃ・ゅ・ょ Combinations</h3><div class="chev"></div></div>
    <div class="note-body">
      <p>Any kana ending in an <span class="jp">い</span> sound (き, し, ち, に, ひ, み, り and their dakuten versions) can pair with a small <span class="accent jp">ゃ・ゅ・ょ</span> to form one combined syllable. The <span class="jp">い</span> sound disappears — it's replaced, not added.</p>
      <div class="xrow">
        <div class="xbox"><span class="jp">き + や</span><div class="rm">ki + ya</div></div>
        <span class="arrow">→</span>
        <div class="xbox"><span class="jp">きゃ</span><div class="rm">kya</div></div>
      </div>
      <p>This works identically in katakana: <span class="jp">キ + ヤ → キャ (kya)</span>. Flip any tile in the Combinations tab to see the two sounds it's built from.</p>
    </div>
  </section>

  <section class="note-card" id="n5">
    <div class="note-head"><h3><span class="note-icon">っ</span>Small っ / ッ — The Glottal Stop</h3><div class="chev"></div></div>
    <div class="note-body">
      <p>A small <span class="jp accent">っ</span> (or katakana <span class="jp accent">ッ</span>) doesn't make its own sound — it marks a tiny pause, and the consonant right after it gets held/doubled. When typing, you double the following consonant's first letter.</p>
      <div class="xrow">
        <div class="xbox"><span class="jp">いた</span><div class="rm">ita</div></div>
        <span class="arrow">→</span>
        <div class="xbox"><span class="jp">いった</span><div class="rm">itta</div></div>
      </div>
      <p>Real examples:</p>
      <div class="wline"><span class="jp">がっこう</span><span class="m">school — gakkou</span></div>
      <div class="wline"><span class="jp">きっぷ</span><span class="m">ticket — kippu</span></div>
      <div class="wline"><span class="jp">まっちゃ</span><span class="m">matcha — maccha</span></div>
    </div>
  </section>

  <section class="note-card" id="n6">
    <div class="note-head"><h3><span class="note-icon">ー</span>Long Vowels: 〜う vs katakana ー</h3><div class="chev"></div></div>
    <div class="note-body">
      <p>In hiragana, adding <span class="accent jp">う</span> after an お-sound kana (こ, そ, と, の, ほ, も, よ, ろ) elongates the vowel — it takes twice as long to say, since every mora in Japanese has equal length.</p>
      <div class="xrow">
        <div class="xbox"><span class="jp">こ</span><div class="rm">ko</div></div>
        <span class="arrow">→</span>
        <div class="xbox"><span class="jp">こう</span><div class="rm">kou</div></div>
      </div>
      <p>Katakana handles this differently — a straight bar <span class="accent jp">ー</span> just stretches whatever vowel came before it, no matter which one it is.</p>
      <div class="xrow">
        <div class="xbox"><span class="jp">コーヒー</span><div class="rm">koohii — coffee</div></div>
        <div class="xbox"><span class="jp">タクシー</span><div class="rm">takushii — taxi</div></div>
      </div>
      <div class="callout">This elongation rule isn't limited to お-sounds in hiragana — any vowel can repeat after its own kana for length, e.g. <span class="jp">おかあさん</span> (okaasan, "mother") repeats あ.</div>
    </div>
  </section>

  <section class="note-card" id="n7">
    <div class="note-head"><h3><span class="note-icon">ヴ</span>Extended Katakana for Foreign Sounds</h3><div class="chev"></div></div>
    <div class="note-body">
      <p>To fit sounds that don't naturally exist in Japanese, a handful of extra katakana-only combinations were invented. These never appear in hiragana.</p>
      <table class="tbl">
        <tr><th>Combo</th><th>Sound</th><th>Example</th></tr>
        <tr><td class="big jp">ファ</td><td>fa</td><td class="jp">ファン (fan)</td></tr>
        <tr><td class="big jp">ティ</td><td>ti</td><td class="jp">パーティー (party)</td></tr>
        <tr><td class="big jp">ディ</td><td>di</td><td class="jp">ディズニー (Disney)</td></tr>
        <tr><td class="big jp">ウィ</td><td>wi</td><td class="jp">ウィキ (wiki)</td></tr>
        <tr><td class="big jp">ヴァ</td><td>va</td><td class="jp">ヴァイオリン (violin)</td></tr>
      </table>
    </div>
  </section>

</main>

`;

  // ── DATA, RENDERING, QUIZ, DETAIL VIEW & WRITING PRACTICE ───

/* =========================================================
   DATA — each entry: k=kana, r=romaji, m=mnemonic (optional),
   e=[example word, meaning] (optional)
   ========================================================= */
const HIRA_ROWS = [
  { tag:'—', cells:[
    {k:'あ',r:'a',  m:'A person kneeling with one leg out',            e:['あさ','morning']},
    {k:'い',r:'i',  m:'Two strands of spaghetti',                       e:['いえ','house']},
    {k:'う',r:'u',  m:'A swooping bird seen from the side',             e:['うみ','sea']},
    {k:'え',r:'e',  m:'An exotic bird with a curled neck',               e:['えき','station']},
    {k:'お',r:'o',  m:'A person fishing, rod curled over their head',    e:['おちゃ','tea']},
  ]},
  { tag:'K', cells:[
    {k:'か',r:'ka', m:'A "key" with a kick at the bottom',               e:['かさ','umbrella']},
    {k:'き',r:'ki', m:'A key on a keyring',                              e:['きん','gold']},
    {k:'く',r:'ku', m:'A boomerang curving through the air',            e:['くつ','shoes']},
    {k:'け',r:'ke', m:'A "keg" with a straw sticking out',               e:['けさ','this morning']},
    {k:'こ',r:'ko', m:'Two coins stacked on top of each other',          e:['こども','child']},
  ]},
  { tag:'S', cells:[
    {k:'さ',r:'sa', m:'A saw slicing through a log',                    e:['さかな','fish']},
    {k:'し',r:'shi',m:'A fishing hook, shiny and curved',                e:['しお','salt']},
    {k:'す',r:'su', m:'A swirl, like a rolled sushi piece',              e:['すし','sushi']},
    {k:'せ',r:'se', m:'A seesaw balanced in the middle',                 e:['せかい','world']},
    {k:'そ',r:'so', m:'A zigzag stitch being sewn',                      e:['そら','sky']},
  ]},
  { tag:'T', cells:[
    {k:'た',r:'ta', m:'A cross planted like a flag on a hill',          e:['たまご','egg']},
    {k:'ち',r:'chi',m:'A curly number 7',                                e:['ちず','map']},
    {k:'つ',r:'tsu',m:'A cresting tsunami wave',                        e:['つき','moon']},
    {k:'て',r:'te', m:'A hand reaching out ("te" = hand)',               e:['てがみ','letter']},
    {k:'と',r:'to', m:'A door with a handle sticking out',               e:['とけい','clock']},
  ]},
  { tag:'N', cells:[
    {k:'な',r:'na', m:'Someone crossing their legs, relaxed',           e:['なつ','summer']},
    {k:'に',r:'ni', m:'A person with two bent knees',                   e:['にく','meat']},
    {k:'ぬ',r:'nu', m:'A bowl of noodles with one strand swirling out', e:['ぬの','cloth']},
    {k:'ね',r:'ne', m:'A cat\'s tail curling around ("neko" = cat)',     e:['ねこ','cat']},
    {k:'の',r:'no', m:'A steering wheel, spun the wrong way — "no!"',    e:['のみもの','drink']},
  ]},
  { tag:'H', cells:[
    {k:'は',r:'ha', m:'A person laughing, "ha ha!"',                     e:['はな','flower']},
    {k:'ひ',r:'hi', m:'A simple curved smile — "hi!"',                   e:['ひと','person']},
    {k:'ふ',r:'fu', m:'The silhouette of Mount Fuji',                    e:['ふゆ','winter']},
    {k:'へ',r:'he', m:'A little roof or mountain peak',                  e:['へや','room']},
    {k:'ほ',r:'ho', m:'A house with a flag flying on top',               e:['ほし','star']},
  ]},
  { tag:'M', cells:[
    {k:'ま',r:'ma', m:'A loop tied like a mother\'s hair bun',           e:['まち','town']},
    {k:'み',r:'mi', m:'A curled ribbon',                                 e:['みず','water']},
    {k:'む',r:'mu', m:'A cow\'s face, saying "moo"',                     e:['むし','insect']},
    {k:'め',r:'me', m:'An eye with a long lash ("me" = eye)',            e:['めがね','glasses']},
    {k:'も',r:'mo', m:'A fishhook catching "mo"re fish',                 e:['もも','peach']},
  ]},
  { tag:'Y', cells:[
    {k:'や',r:'ya', m:'A slingshot pulled back — "ya!"',                 e:['やま','mountain']},
    null,
    {k:'ゆ',r:'yu', m:'A fishhook shape, simple curve',                  e:['ゆき','snow']},
    null,
    {k:'よ',r:'yo', m:'A fishing hook saying "yo!"',                     e:['よる','night']},
  ]},
  { tag:'R', cells:[
    {k:'ら',r:'ra', m:'A rabbit\'s leg mid-kick',                        e:['らいねん','next year']},
    {k:'り',r:'ri', m:'Two chopsticks standing side by side',            e:['りんご','apple']},
    {k:'る',r:'ru', m:'A loop-the-loop, running in circles',             e:['るす','being out']},
    {k:'れ',r:'re', m:'A person kneeling down to rest',                  e:['れきし','history']},
    {k:'ろ',r:'ro', m:'A maze with one long corridor',                   e:['ろうか','hallway']},
  ]},
  { tag:'W', cells:[
    {k:'わ',r:'wa', m:'A swan floating gracefully on water',             e:['わたし','I / me']},
    null, null, null,
    {k:'を',r:'wo', m:'Looks like れ with an extra loop — object marker', e:['(particle)','marks the object']},
  ]},
  { tag:'—', cells:[
    {k:'ん',r:'n', m:'Just a simple hook — the only standalone consonant', e:['ほん','book']},
    null,null,null,null
  ]},
];

const KATA_ROWS = [
  { tag:'—', cells:[
    {k:'ア',r:'a', e:['アメリカ','America']},
    {k:'イ',r:'i', e:['イギリス','England']},
    {k:'ウ',r:'u', e:['ウール','wool']},
    {k:'エ',r:'e', e:['エレベーター','elevator']},
    {k:'オ',r:'o', e:['オレンジ','orange']},
  ]},
  { tag:'K', cells:[
    {k:'カ',r:'ka', e:['カメラ','camera']},
    {k:'キ',r:'ki', e:['キス','kiss']},
    {k:'ク',r:'ku', e:['クラス','class']},
    {k:'ケ',r:'ke', e:['ケーキ','cake']},
    {k:'コ',r:'ko', e:['コーヒー','coffee']},
  ]},
  { tag:'S', cells:[
    {k:'サ',r:'sa', e:['サラダ','salad']},
    {k:'シ',r:'shi',e:['シーツ','sheet']},
    {k:'ス',r:'su', e:['スープ','soup']},
    {k:'セ',r:'se', e:['セーター','sweater']},
    {k:'ソ',r:'so', e:['ソファ','sofa']},
  ]},
  { tag:'T', cells:[
    {k:'タ',r:'ta', e:['タクシー','taxi']},
    {k:'チ',r:'chi',e:['チーズ','cheese']},
    {k:'ツ',r:'tsu',e:['ツアー','tour']},
    {k:'テ',r:'te', e:['テレビ','TV']},
    {k:'ト',r:'to', e:['トマト','tomato']},
  ]},
  { tag:'N', cells:[
    {k:'ナ',r:'na', e:['ナイフ','knife']},
    {k:'ニ',r:'ni', e:['ニュース','news']},
    {k:'ヌ',r:'nu', e:['ヌードル','noodle']},
    {k:'ネ',r:'ne', e:['ネクタイ','necktie']},
    {k:'ノ',r:'no', e:['ノート','notebook']},
  ]},
  { tag:'H', cells:[
    {k:'ハ',r:'ha', e:['ハート','heart']},
    {k:'ヒ',r:'hi', e:['ヒーロー','hero']},
    {k:'フ',r:'fu', e:['フォーク','fork']},
    {k:'ヘ',r:'he', e:['ヘリコプター','helicopter']},
    {k:'ホ',r:'ho', e:['ホテル','hotel']},
  ]},
  { tag:'M', cells:[
    {k:'マ',r:'ma', e:['マスク','mask']},
    {k:'ミ',r:'mi', e:['ミルク','milk']},
    {k:'ム',r:'mu', e:['ムード','mood']},
    {k:'メ',r:'me', e:['メニュー','menu']},
    {k:'モ',r:'mo', e:['モデル','model']},
  ]},
  { tag:'Y', cells:[
    {k:'ヤ',r:'ya', e:['ヤード','yard']},
    null,
    {k:'ユ',r:'yu', e:['ユーモア','humor']},
    null,
    {k:'ヨ',r:'yo', e:['ヨーロッパ','Europe']},
  ]},
  { tag:'R', cells:[
    {k:'ラ',r:'ra', e:['ラジオ','radio']},
    {k:'リ',r:'ri', e:['リボン','ribbon']},
    {k:'ル',r:'ru', e:['ルール','rule']},
    {k:'レ',r:'re', e:['レストラン','restaurant']},
    {k:'ロ',r:'ro', e:['ロボット','robot']},
  ]},
  { tag:'W', cells:[
    {k:'ワ',r:'wa', e:['ワイン','wine']},
    null,null,null,
    {k:'ヲ',r:'wo', e:['(particle)','rarely written in katakana']},
  ]},
  { tag:'—', cells:[
    {k:'ン',r:'n', e:['パン','bread']},
    null,null,null,null
  ]},
];

const DAKU_ROWS_HIRA = [
  { tag:'G', cells:[
    {k:'が',r:'ga',e:['がっこう','school']},{k:'ぎ',r:'gi',e:['ぎん','silver']},
    {k:'ぐ',r:'gu',e:['ぐあい','condition']},{k:'げ',r:'ge',e:['げんき','energy']},{k:'ご',r:'go',e:['ごはん','rice/meal']},
  ]},
  { tag:'Z', cells:[
    {k:'ざ',r:'za',e:['ざっし','magazine']},{k:'じ',r:'ji',e:['じかん','time']},
    {k:'ず',r:'zu',e:['ずつう','headache']},{k:'ぜ',r:'ze',e:['ぜんぶ','all']},{k:'ぞ',r:'zo',e:['ぞう','elephant']},
  ]},
  { tag:'D', cells:[
    {k:'だ',r:'da',e:['だいがく','university']},{k:'ぢ',r:'ji',e:['はなぢ','nosebleed']},
    {k:'づ',r:'zu',e:['つづく','to continue']},{k:'で',r:'de',e:['でんわ','telephone']},{k:'ど',r:'do',e:['どようび','Saturday']},
  ]},
  { tag:'B', cells:[
    {k:'ば',r:'ba',e:['ばしょ','place']},{k:'び',r:'bi',e:['びょういん','hospital']},
    {k:'ぶ',r:'bu',e:['ぶた','pig']},{k:'べ',r:'be',e:['べんきょう','study']},{k:'ぼ',r:'bo',e:['ぼうし','hat']},
  ]},
  { tag:'P', cells:[
    {k:'ぱ',r:'pa',e:['ぱん','bread']},{k:'ぴ',r:'pi',e:['えんぴつ','pencil']},
    {k:'ぷ',r:'pu',e:['てんぷら','tempura']},{k:'ぺ',r:'pe',e:['かんぺき','perfect']},{k:'ぽ',r:'po',e:['さんぽ','walk']},
  ]},
];
const DAKU_ROWS_KATA = [
  { tag:'G', cells:[
    {k:'ガ',r:'ga',e:['ガム','gum']},{k:'ギ',r:'gi',e:['ギター','guitar']},
    {k:'グ',r:'gu',e:['グラス','glass']},{k:'ゲ',r:'ge',e:['ゲーム','game']},{k:'ゴ',r:'go',e:['ゴール','goal']},
  ]},
  { tag:'Z', cells:[
    {k:'ザ',r:'za',e:['ピザ','pizza']},{k:'ジ',r:'ji',e:['ジーンズ','jeans']},
    {k:'ズ',r:'zu',e:['サイズ','size']},{k:'ゼ',r:'ze',e:['ゼロ','zero']},{k:'ゾ',r:'zo',e:['ゾンビ','zombie']},
  ]},
  { tag:'D', cells:[
    {k:'ダ',r:'da',e:['ダンス','dance']},{k:'ヂ',r:'ji',e:['(rare)','']},
    {k:'ヅ',r:'zu',e:['(rare)','']},{k:'デ',r:'de',e:['デート','date']},{k:'ド',r:'do',e:['ドア','door']},
  ]},
  { tag:'B', cells:[
    {k:'バ',r:'ba',e:['バス','bus']},{k:'ビ',r:'bi',e:['ビール','beer']},
    {k:'ブ',r:'bu',e:['ブログ','blog']},{k:'ベ',r:'be',e:['ベッド','bed']},{k:'ボ',r:'bo',e:['ボール','ball']},
  ]},
  { tag:'P', cells:[
    {k:'パ',r:'pa',e:['パン','bread']},{k:'ピ',r:'pi',e:['ピザ','pizza']},
    {k:'プ',r:'pu',e:['プール','pool']},{k:'ペ',r:'pe',e:['ペン','pen']},{k:'ポ',r:'po',e:['ポスト','mailbox']},
  ]},
];

function comboSet(consRow, romBase){
  // consRow: [base_i_kana, small_ya, small_yu, small_yo] helper not used directly; built manually below
}
const COMBO_ROWS_HIRA = [
  { tag:'KY', cells:[{k:'きゃ',r:'kya',e:['base: き+や']},{k:'きゅ',r:'kyu',e:['base: き+ゆ']},{k:'きょ',r:'kyo',e:['base: き+よ']}]},
  { tag:'GY', cells:[{k:'ぎゃ',r:'gya',e:['base: ぎ+や']},{k:'ぎゅ',r:'gyu',e:['base: ぎ+ゆ']},{k:'ぎょ',r:'gyo',e:['base: ぎ+よ']}]},
  { tag:'SH', cells:[{k:'しゃ',r:'sha',e:['base: し+や']},{k:'しゅ',r:'shu',e:['base: し+ゆ']},{k:'しょ',r:'sho',e:['base: し+よ']}]},
  { tag:'J',  cells:[{k:'じゃ',r:'ja', e:['base: じ+や']},{k:'じゅ',r:'ju', e:['base: じ+ゆ']},{k:'じょ',r:'jo', e:['base: じ+よ']}]},
  { tag:'CH', cells:[{k:'ちゃ',r:'cha',e:['base: ち+や']},{k:'ちゅ',r:'chu',e:['base: ち+ゆ']},{k:'ちょ',r:'cho',e:['base: ち+よ']}]},
  { tag:'NY', cells:[{k:'にゃ',r:'nya',e:['base: に+や']},{k:'にゅ',r:'nyu',e:['base: に+ゆ']},{k:'にょ',r:'nyo',e:['base: に+よ']}]},
  { tag:'HY', cells:[{k:'ひゃ',r:'hya',e:['base: ひ+や']},{k:'ひゅ',r:'hyu',e:['base: ひ+ゆ']},{k:'ひょ',r:'hyo',e:['base: ひ+よ']}]},
  { tag:'BY', cells:[{k:'びゃ',r:'bya',e:['base: び+や']},{k:'びゅ',r:'byu',e:['base: び+ゆ']},{k:'びょ',r:'byo',e:['base: び+よ']}]},
  { tag:'PY', cells:[{k:'ぴゃ',r:'pya',e:['base: ぴ+や']},{k:'ぴゅ',r:'pyu',e:['base: ぴ+ゆ']},{k:'ぴょ',r:'pyo',e:['base: ぴ+よ']}]},
  { tag:'MY', cells:[{k:'みゃ',r:'mya',e:['base: み+や']},{k:'みゅ',r:'myu',e:['base: み+ゆ']},{k:'みょ',r:'myo',e:['base: み+よ']}]},
  { tag:'RY', cells:[{k:'りゃ',r:'rya',e:['base: り+や']},{k:'りゅ',r:'ryu',e:['base: り+ゆ']},{k:'りょ',r:'ryo',e:['base: り+よ']}]},
];
const COMBO_ROWS_KATA = [
  { tag:'KY', cells:[{k:'キャ',r:'kya',e:['base: キ+ヤ']},{k:'キュ',r:'kyu',e:['base: キ+ユ']},{k:'キョ',r:'kyo',e:['base: キ+ヨ']}]},
  { tag:'GY', cells:[{k:'ギャ',r:'gya',e:['base: ギ+ヤ']},{k:'ギュ',r:'gyu',e:['base: ギ+ユ']},{k:'ギョ',r:'gyo',e:['base: ギ+ヨ']}]},
  { tag:'SH', cells:[{k:'シャ',r:'sha',e:['base: シ+ヤ']},{k:'シュ',r:'shu',e:['base: シ+ユ']},{k:'ショ',r:'sho',e:['base: シ+ヨ']}]},
  { tag:'J',  cells:[{k:'ジャ',r:'ja', e:['base: ジ+ヤ']},{k:'ジュ',r:'ju', e:['base: ジ+ユ']},{k:'ジョ',r:'jo', e:['base: ジ+ヨ']}]},
  { tag:'CH', cells:[{k:'チャ',r:'cha',e:['base: チ+ヤ']},{k:'チュ',r:'chu',e:['base: チ+ユ']},{k:'チョ',r:'cho',e:['base: チ+ヨ']}]},
  { tag:'NY', cells:[{k:'ニャ',r:'nya',e:['base: ニ+ヤ']},{k:'ニュ',r:'nyu',e:['base: ニ+ユ']},{k:'ニョ',r:'nyo',e:['base: ニ+ヨ']}]},
  { tag:'HY', cells:[{k:'ヒャ',r:'hya',e:['base: ヒ+ヤ']},{k:'ヒュ',r:'hyu',e:['base: ヒ+ユ']},{k:'ヒョ',r:'hyo',e:['base: ヒ+ヨ']}]},
  { tag:'BY', cells:[{k:'ビャ',r:'bya',e:['base: ビ+ヤ']},{k:'ビュ',r:'byu',e:['base: ビ+ユ']},{k:'ビョ',r:'byo',e:['base: ビ+ヨ']}]},
  { tag:'PY', cells:[{k:'ピャ',r:'pya',e:['base: ピ+ヤ']},{k:'ピュ',r:'pyu',e:['base: ピ+ユ']},{k:'ピョ',r:'pyo',e:['base: ピ+ヨ']}]},
  { tag:'MY', cells:[{k:'ミャ',r:'mya',e:['base: ミ+ヤ']},{k:'ミュ',r:'myu',e:['base: ミ+ユ']},{k:'ミョ',r:'myo',e:['base: ミ+ヨ']}]},
  { tag:'RY', cells:[{k:'リャ',r:'rya',e:['base: リ+ヤ']},{k:'リュ',r:'ryu',e:['base: リ+ユ']},{k:'リョ',r:'ryo',e:['base: リ+ヨ']}]},
];


  // ── STATE, RENDER, QUIZ, DETAIL & WRITING-PRACTICE LOGIC ──
  let currentRootRef = null;
  function mountApp(root){
  currentRootRef = root;
/* =========================================================
   STATE
   ========================================================= */
let openKanaDetailFn = null;
  const learned = new Set();
let currentTiles = [];
let currentTab = 'hira';

/* =========================================================
   RENDERING
   ========================================================= */
const chartArea = root.querySelector('#chartArea');
const footNote = root.querySelector('#footNote');

function tileHTML(cell){
  if(!cell) return '<div class="tile-outer empty"></div>';
  const hasBack = cell.m || cell.e;
  const backHTML = hasBack ? `
    <div class="face back">
      ${cell.m ? `<div class="mn">${cell.m}</div>` : ''}
      ${cell.e ? `<div class="ex">${cell.e[0]&&cell.e[0].match(/^[\u3040-\u30ff]/) ? `<span class="jp">${cell.e[0]}</span> — ${cell.e[1]||''}` : `${cell.e[0]}${cell.e[1]?' — '+cell.e[1]:''}`}</div>` : ''}
    </div>` : `<div class="face back"><div class="mn">${cell.r}</div></div>`;

  return `
  <div class="tile-outer" data-kana="${cell.k}" data-rom="${cell.r}">
    <button class="learn-btn" title="Mark as learned">✓</button>
    <div class="tile-inner">
      <div class="face front"><span class="kj jp">${cell.k}</span><span class="rm">${cell.r}</span></div>
      ${backHTML}
    </div>
    <button class="info-btn" title="Memory hint">i</button>
  </div>`;
}

function renderRows(rows, cols){
  let html = '';
  if(cols===5){
    html += '<div class="vowel-row"><div></div><div>a</div><div>i</div><div>u</div><div>e</div><div>o</div></div>';
  }
  rows.forEach(row=>{
    html += `<div class="row-group"><div class="row-tag">${row.tag}</div><div class="row-cells ${cols===3?'cols-3':''}">`;
    row.cells.forEach(cell=>{ html += tileHTML(cell); });
    html += '</div></div>';
  });
  return html;
}

function render(tab){
  currentTab = tab;
  let html = '';
  let total = 0;
  if(tab==='hira'){
    html = renderRows(HIRA_ROWS, 5);
    total = 46;
    footNote.textContent = '46 base characters';
  } else if(tab==='kata'){
    html = renderRows(KATA_ROWS, 5);
    total = 46;
    footNote.textContent = '46 base characters';
  } else if(tab==='daku'){
    html += '<div class="sub-label">Hiragana</div>' + renderRows(DAKU_ROWS_HIRA, 5);
    html += '<div class="sub-label">Katakana</div>' + renderRows(DAKU_ROWS_KATA, 5);
    total = 50;
    footNote.textContent = '25 dakuten/handakuten pairs, both scripts';
  } else if(tab==='combo'){
    html += '<div class="sub-label">Hiragana Combinations</div>' + renderRows(COMBO_ROWS_HIRA, 3);
    html += '<div class="sub-label">Katakana Combinations</div>' + renderRows(COMBO_ROWS_KATA, 3);
    total = 66;
    footNote.textContent = '33 combinations, both scripts';
  }
  chartArea.innerHTML = html;
  wireTiles();
  updateProgress(total);
  applyFilter(root.querySelector('#searchInput').value);
}

function wireTiles(){
  currentTiles = Array.from(chartArea.querySelectorAll('.tile-outer:not(.empty)'));
  currentTiles.forEach(outer=>{
    const front = outer.querySelector('.face.front');
    const infoBtn = outer.querySelector('.info-btn');
    const learnBtn = outer.querySelector('.learn-btn');
    const kana = outer.dataset.kana;

    if(learned.has(kana)) learnBtn.classList.add('on');

    front.addEventListener('click', ()=>{
      speak(front, kana);
      if (openKanaDetailFn) openKanaDetailFn(kana);
    });
    infoBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      outer.classList.toggle('flipped');
    });
    learnBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(learned.has(kana)){ learned.delete(kana); learnBtn.classList.remove('on'); }
      else { learned.add(kana); learnBtn.classList.add('on'); }
      updateProgress(currentTiles.length===0?0:currentTotal);
    });
  });
}

let currentTotal = 0;
function updateProgress(total){
  currentTotal = total;
  const tilesKana = currentTiles.map(t=>t.dataset.kana);
  const learnedInTab = tilesKana.filter(k=>learned.has(k)).length;
  root.querySelector('#progLabel').textContent = `${learnedInTab} / ${total} learned`;
  root.querySelector('#progBar').style.width = (total? (learnedInTab/total*100):0) + '%';
}

/* =========================================================
   SPEECH
   ========================================================= */
function speak(frontEl, text){
  if(!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.8;
  frontEl.classList.add('speaking');
  utter.onend = ()=> frontEl.classList.remove('speaking');
  utter.onerror = ()=> frontEl.classList.remove('speaking');
  window.speechSynthesis.speak(utter);
}

let playAllRunning = false;
root.querySelector('#playAllBtn').addEventListener('click', async ()=>{
  if(playAllRunning) return;
  playAllRunning = true;
  for(const outer of currentTiles){
    if(outer.classList.contains('dim')) continue;
    const front = outer.querySelector('.face.front');
    await new Promise(resolve=>{
      speak(front, outer.dataset.kana);
      setTimeout(resolve, 620);
    });
  }
  playAllRunning = false;
});

/* =========================================================
   SEARCH / FILTER
   ========================================================= */
function applyFilter(query){
  const q = query.trim().toLowerCase();
  currentTiles.forEach(outer=>{
    const rom = outer.dataset.rom.toLowerCase();
    if(!q){
      outer.classList.remove('dim','match');
      return;
    }
    if(rom.includes(q)){
      outer.classList.remove('dim'); outer.classList.add('match');
    } else {
      outer.classList.add('dim'); outer.classList.remove('match');
    }
  });
}
root.querySelector('#searchInput').addEventListener('input', (e)=> applyFilter(e.target.value));

/* =========================================================
   TABS
   ========================================================= */
root.querySelectorAll('.tab').forEach(tabEl=>{
  tabEl.addEventListener('click', ()=>{
    root.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tabEl.classList.add('active');
    root.querySelector('#searchInput').value='';
    render(tabEl.dataset.tab);
  });
});

/* =========================================================
   NOTES COLLAPSE
   ========================================================= */
root.querySelectorAll('.note-head').forEach(head=>{
  head.addEventListener('click', ()=>{
    head.parentElement.classList.toggle('collapsed');
  });
});

/* init */
render('hira');

/* =========================================================
   KANA QUIZ
   ========================================================= */
(function(){
  const overlay = root.querySelector('#quizOverlay');
  const quizBtn = root.querySelector('#quizBtn');
  const closeBtn = root.querySelector('#quizCloseBtn');
  const screens = {
    landing: root.querySelector('#screenLanding'),
    config: root.querySelector('#screenConfig'),
    play: root.querySelector('#screenPlay'),
    results: root.querySelector('#screenResults'),
  };
  function showScreen(name){
    Object.values(screens).forEach(s=>s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function openQuiz(){
    overlay.classList.remove('hidden');
    showScreen('landing');
  }
  function closeQuiz(){
    overlay.classList.add('hidden');
    closeMenu();
    stopTimer();
  }
  quizBtn.addEventListener('click', (e)=>{
    spawnRipple(e, quizBtn);
    openQuiz();
  });
  closeBtn.addEventListener('click', closeQuiz);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeQuiz(); });
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape' && !overlay.classList.contains('hidden')) closeQuiz();
  });

  function spawnRipple(e, btn){
    const r = document.createElement('span');
    r.className='ripple';
    const rect = btn.getBoundingClientRect();
    r.style.left = (e.clientX-rect.left-8)+'px';
    r.style.top = (e.clientY-rect.top-8)+'px';
    r.style.width = r.style.height = '16px';
    btn.appendChild(r);
    setTimeout(()=>r.remove(), 600);
  }

  root.querySelector('#playNowBtn').addEventListener('click', ()=> showScreen('config'));
  root.querySelector('#backToStudyBtn').addEventListener('click', closeQuiz);

  /* ---- config state ---- */
  let kanaType = 'hira';
  let variant = 'mono';

  root.querySelectorAll('.toggle-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      root.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      kanaType = btn.dataset.kanatype;
    });
  });
  root.querySelectorAll('.seg-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      root.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      variant = btn.dataset.variant;
    });
  });

  /* ---- slide menu ---- */
  const slideMenu = root.querySelector('#slideMenu');
  const menuBackdrop = root.querySelector('#menuBackdrop');
  function openMenu(){ slideMenu.classList.add('open'); menuBackdrop.classList.add('open'); }
  function closeMenu(){ slideMenu.classList.remove('open'); menuBackdrop.classList.remove('open'); }
  root.querySelector('#menuOpenBtn').addEventListener('click', openMenu);
  menuBackdrop.addEventListener('click', closeMenu);
  root.querySelector('#menuPlayNow').addEventListener('click', ()=>{ closeMenu(); startGame(); });
  root.querySelector('#menuStudy').addEventListener('click', ()=>{ closeMenu(); closeQuiz(); });
  root.querySelector('#menuAbout').addEventListener('click', ()=>{
    closeMenu();
    alert('Kana Quiz — a flashcard arcade game built right into the Kana Chart. Pick a script and character set, then race the clock to type the correct romaji for each card!');
  });
  let soundOn = true;
  const soundSwitch = root.querySelector('#soundSwitch');
  root.querySelector('#menuSound').addEventListener('click', ()=>{
    soundOn = !soundOn;
    soundSwitch.classList.toggle('on', soundOn);
  });
  let bestXP = 0;
  root.querySelector('#menuLeaderboard').addEventListener('click', ()=>{
    alert('Best score this session: '+bestXP+' XP');
  });

  /* ---- pool building (reuses the same data used by the Study chart above) ---- */
  function flatten(rows){
    const out = [];
    rows.forEach(row=> row.cells.forEach(c=>{ if(c) out.push({k:c.k, r:c.r}); }));
    return out;
  }
  function buildPool(){
    let pool = [];
    if(kanaType==='hira'){
      if(variant==='mono') pool = flatten(HIRA_ROWS);
      else if(variant==='daku') pool = flatten(DAKU_ROWS_HIRA);
      else if(variant==='combo') pool = flatten(COMBO_ROWS_HIRA);
      else pool = flatten(HIRA_ROWS).concat(flatten(DAKU_ROWS_HIRA)).concat(flatten(COMBO_ROWS_HIRA));
    } else {
      if(variant==='mono') pool = flatten(KATA_ROWS);
      else if(variant==='daku') pool = flatten(DAKU_ROWS_KATA);
      else if(variant==='combo') pool = flatten(COMBO_ROWS_KATA);
      else pool = flatten(KATA_ROWS).concat(flatten(DAKU_ROWS_KATA)).concat(flatten(COMBO_ROWS_KATA));
    }
    return pool;
  }
  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  root.querySelector('#startBtn').addEventListener('click', startGame);

  /* ---- game state ---- */
  let pool = [];
  let pIndex = 0;
  let stats = {correct:0, incorrect:0, skipped:0, streak:0, best:0, xp:0};
  let timeLeft = 60;
  let timerInt = null;

  const flashcard = root.querySelector('#flashcard');
  const flashKana = root.querySelector('#flashKana');
  const answerInput = root.querySelector('#answerInput');
  const timerNum = root.querySelector('#timerNum');
  const timerCircle = root.querySelector('#timerCircle');
  const timerRing = root.querySelector('#timerRing');
  const CIRC = 2*Math.PI*24;
  timerCircle.style.strokeDasharray = CIRC;

  function startGame(){
    pool = shuffle(buildPool());
    if(pool.length===0){ pool = shuffle(flatten(HIRA_ROWS)); }
    pIndex = 0;
    stats = {correct:0, incorrect:0, skipped:0, streak:0, best:0, xp:0};
    updateStatsUI();
    showScreen('play');
    loadCard();
  }

  function currentCard(){
    if(pIndex >= pool.length){ pool = shuffle(pool); pIndex = 0; }
    return pool[pIndex];
  }

  function loadCard(){
    const card = currentCard();
    flashKana.textContent = card.k;
    flashcard.classList.remove('swipe-right','swipe-left','swipe-up','shake');
    answerInput.value = '';
    answerInput.classList.remove('correct','incorrect');
    answerInput.disabled = false;
    setTimeout(()=> answerInput.focus(), 50);
    startTimer();
  }

  function startTimer(){
    stopTimer();
    timeLeft = 60;
    updateTimerUI();
    timerInt = setInterval(()=>{
      timeLeft--;
      updateTimerUI();
      if(timeLeft<=0){ handleSkip(); }
    }, 1000);
  }
  function stopTimer(){ if(timerInt){ clearInterval(timerInt); timerInt=null; } }
  function updateTimerUI(){
    timerNum.textContent = timeLeft;
    const offset = CIRC * (1 - timeLeft/60);
    timerCircle.style.strokeDashoffset = offset;
    timerRing.classList.toggle('warn', timeLeft<=10);
  }

  function updateStatsUI(){
    root.querySelector('#statCorrect').textContent = stats.correct;
    root.querySelector('#statIncorrect').textContent = stats.incorrect;
    root.querySelector('#statSkipped').textContent = stats.skipped;
    root.querySelector('#statStreak').textContent = stats.streak;
    root.querySelector('#statXP').textContent = stats.xp;
  }

  function beep(freq, dur){
    if(!soundOn) return;
    try{
      const ctx = beep._ctx || (beep._ctx = new (window.AudioContext||window.webkitAudioContext)());
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+dur);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime+dur);
    }catch(e){}
  }

  function confettiBurst(){
    const colors = ['#FF4D7E','#4CAF82','#FFB454','#E8446A','#7C4DD8'];
    for(let i=0;i<24;i++){
      const p = document.createElement('div');
      p.className='confetti-piece';
      p.style.left = Math.random()*100+'vw';
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      p.style.animationDuration = (1.6+Math.random()*1.2)+'s';
      p.style.transform = 'rotate('+(Math.random()*360)+'deg)';
      document.body.appendChild(p);
      setTimeout(()=>p.remove(), 3200);
    }
  }

  function advance(delay){
    stopTimer();
    setTimeout(()=>{
      pIndex++;
      loadCard();
    }, delay);
  }

  function handleCorrect(){
    stopTimer();
    stats.correct++; stats.streak++; stats.xp += 10 + Math.min(stats.streak,10);
    if(stats.streak > stats.best) stats.best = stats.streak;
    updateStatsUI();
    answerInput.classList.add('correct');
    answerInput.disabled = true;
    flashcard.classList.add('swipe-right');
    beep(880,0.18);
    if(stats.streak>0 && stats.streak % 5 === 0) confettiBurst();
    advance(550);
  }
  function handleIncorrect(){
    stopTimer();
    stats.incorrect++; stats.streak = 0;
    updateStatsUI();
    answerInput.classList.add('incorrect');
    flashcard.classList.add('shake');
    beep(180,0.25);
    setTimeout(()=>{
      flashcard.classList.remove('shake');
      flashcard.classList.add('swipe-left');
      answerInput.disabled = true;
      advance(400);
    }, 350);
  }
  function handleSkip(){
    stopTimer();
    stats.skipped++; stats.streak = 0;
    updateStatsUI();
    flashcard.classList.add('swipe-up');
    answerInput.disabled = true;
    advance(400);
  }

  function submitAnswer(){
    if(answerInput.disabled) return;
    const val = answerInput.value.trim().toLowerCase();
    if(!val) return;
    const card = currentCard();
    if(val === card.r.toLowerCase()) handleCorrect();
    else handleIncorrect();
  }
  root.querySelector('#submitBtn').addEventListener('click', submitAnswer);
  answerInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') submitAnswer(); });

  function endSession(){
    stopTimer();
    if(stats.xp > bestXP){ bestXP = stats.xp; }
    root.querySelector('#resXP').textContent = stats.xp;
    root.querySelector('#resCorrect').textContent = stats.correct;
    root.querySelector('#resIncorrect').textContent = stats.incorrect;
    root.querySelector('#resSkipped').textContent = stats.skipped;
    root.querySelector('#resBest').textContent = stats.best;
    root.querySelector('#menuBestScore').textContent = 'Best: '+bestXP+' XP';
    if(stats.best>=5) confettiBurst();
    showScreen('results');
  }
  root.querySelector('#quitBtn').addEventListener('click', endSession);
  root.querySelector('#playAgainBtn').addEventListener('click', startGame);
})();

/* =========================================================
   CHARACTER DETAIL VIEW + WRITING PRACTICE
   (extends the existing Kana Chart — same theme/components)
   ========================================================= */
(function(){

  /* ---- known visually-confusable kana pairs ---- */
  const SIMILAR_MAP = {
    'ぬ':['め','ね'], 'め':['ぬ','ね'], 'ね':['ぬ','め','わ','れ'], 'わ':['ね','れ'],
    'れ':['わ','ね'], 'る':['ろ'], 'ろ':['る'], 'き':['さ'], 'さ':['き','ち'],
    'ち':['さ'], 'し':['つ'], 'つ':['し'], 'は':['ほ'], 'ほ':['は'],
    'ま':['も'], 'も':['ま'], 'す':['む'], 'む':['す'], 'り':['い'], 'い':['り'],
    'ん':['そ'], 'そ':['ん'], 'く':['へ'],
    'ソ':['ン','ツ'], 'ン':['ソ','ツ'], 'ツ':['ソ','ン'], 'シ':['ツ','ン'],
    'ク':['ケ'], 'ケ':['ク'], 'ワ':['ウ'], 'ウ':['ワ'], 'チ':['テ'], 'テ':['チ'],
    'コ':['ユ'], 'ユ':['コ'], 'ヲ':['ラ']
  };

  /* ---- flatten all datasets into one ordered master list ---- */
  function flattenSet(rows, script, typeFn){
    const out = [];
    rows.forEach(row=>{
      row.cells.forEach(cell=>{
        if(!cell) return;
        out.push({
          kana: cell.k, romaji: cell.r, m: cell.m || '', e: cell.e || null,
          tag: row.tag, script, type: typeFn(row)
        });
      });
    });
    return out;
  }
  const ALL = []
    .concat(flattenSet(HIRA_ROWS, 'hiragana', ()=> 'Hiragana'))
    .concat(flattenSet(KATA_ROWS, 'katakana', ()=> 'Katakana'))
    .concat(flattenSet(DAKU_ROWS_HIRA, 'hiragana', row=> row.tag==='P' ? 'Handakuten (Hiragana)' : 'Dakuten (Hiragana)'))
    .concat(flattenSet(DAKU_ROWS_KATA, 'katakana', row=> row.tag==='P' ? 'Handakuten (Katakana)' : 'Dakuten (Katakana)'))
    .concat(flattenSet(COMBO_ROWS_HIRA, 'hiragana', ()=> 'Combination — Yōon (Hiragana)'))
    .concat(flattenSet(COMBO_ROWS_KATA, 'katakana', ()=> 'Combination — Yōon (Katakana)'));

  const BY_KANA = {};
  ALL.forEach((entry, i)=>{ entry.idx = i; BY_KANA[entry.kana] = entry; });

  /* ---- description / usage-note text generation ---- */
  function buildDescription(entry){
    const {kana, romaji, type, tag, m} = entry;
    let base;
    if(type === 'Hiragana'){
      base = `${kana} is a hiragana character pronounced "${romaji}." It belongs to the ${tag==='—' ? 'vowel' : tag+'-row'} group and is used for native Japanese words, grammar particles, and word endings.`;
    } else if(type === 'Katakana'){
      base = `${kana} is a katakana character pronounced "${romaji}." Katakana's angular strokes are reserved mainly for loanwords, foreign names, and onomatopoeia.`;
    } else if(type.startsWith('Dakuten')){
      base = `${kana} is pronounced "${romaji}." It's formed by adding two small dakuten strokes (゛) to its base kana, which shifts the consonant sound.`;
    } else if(type.startsWith('Handakuten')){
      base = `${kana} is pronounced "${romaji}." It's formed by adding a small handakuten circle (゜) to an H-row kana, giving a crisp "p" sound.`;
    } else {
      base = `${kana} is a combination (yōon) syllable pronounced "${romaji}." It blends an い-column consonant with a small ゃ・ゅ・ょ into a single beat, rather than two separate sounds.`;
    }
    if(m) base += ` Memory hint: ${m}.`;
    return base;
  }
  function buildUsage(entry){
    const {type} = entry;
    if(type === 'Hiragana') return 'Used for native Japanese words, grammar particles (は・が・を・に…), and verb or adjective endings. It\'s the first script most beginners learn.';
    if(type === 'Katakana') return 'Used for loanwords (e.g. コーヒー "coffee"), foreign names, and sound effects in manga — the same 46 core sounds as hiragana, written differently.';
    if(type.startsWith('Dakuten')) return 'The dakuten mark only ever attaches to k-, s-, t-, and h-row kana — never to vowels, ん, or the y-/r-row kana.';
    if(type.startsWith('Handakuten')) return 'Handakuten only appears on the H-row (は・ひ・ふ・へ・ほ), turning them into pa・pi・pu・pe・po.';
    return 'Only kana ending in the "i" sound (き し ち に ひ み り, plus their dakuten forms) can combine with a small ゃ・ゅ・ょ this way.';
  }

  const JP_RE = /^[\u3040-\u30ff]/;
  function buildWords(entry){
    if(!entry.e) return [];
    const [w, meaning] = entry.e;
    if(!w || !JP_RE.test(w)) return []; // combo "base: x+y" notes / particle placeholders
    return [{ jp: w, meaning: meaning || '' }];
  }
  function buildSentences(entry){
    const words = buildWords(entry);
    if(words.length === 0) return [];
    const { jp, meaning } = words[0];
    if(!meaning || meaning.startsWith('to ') || meaning==='marks the object') return [];
    return [{
      jp: `これは${jp}です。`,
      rm: `Kore wa ${jp} desu.`,
      en: `This is a ${meaning}.`
    }];
  }

  /* ---- speech helper for word/sentence play buttons ---- */
  function speakText(btn, text){
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ja-JP';
    utter.rate = 0.85;
    if(btn){
      btn.classList.add('speaking');
      utter.onend = ()=> btn.classList.remove('speaking');
      utter.onerror = ()=> btn.classList.remove('speaking');
    }
    window.speechSynthesis.speak(utter);
  }

  /* ---- DOM refs ---- */
  const overlay = root.querySelector('#detailOverlay');
  const closeBtn = root.querySelector('#detailCloseBtn');
  const prevBtn = root.querySelector('#detailPrevBtn');
  const nextBtn = root.querySelector('#detailNextBtn');
  const posLabel = root.querySelector('#detailPosLabel');
  const dtKana = root.querySelector('#dtKana');
  const dtRomaji = root.querySelector('#dtRomaji');
  const dtType = root.querySelector('#dtType');
  const dtDescription = root.querySelector('#dtDescription');
  const dtSimilar = root.querySelector('#dtSimilar');
  const dtUsage = root.querySelector('#dtUsage');
  const dtWords = root.querySelector('#dtWords');
  const dtSentences = root.querySelector('#dtSentences');
  const playBtn = root.querySelector('#dtPlayBtn');
  const playSlowBtn = root.querySelector('#dtPlaySlowBtn');

  let currentIdx = 0;

  function renderDetail(){
    const entry = ALL[currentIdx];
    dtKana.textContent = entry.kana;
    dtRomaji.textContent = entry.romaji;
    dtType.textContent = entry.type;
    dtDescription.textContent = buildDescription(entry);
    posLabel.textContent = (currentIdx+1) + ' / ' + ALL.length;
    prevBtn.disabled = false;
    nextBtn.disabled = false;

    const sims = SIMILAR_MAP[entry.kana] || [];
    dtSimilar.innerHTML = sims.length ? sims.map(k=>{
      const s = BY_KANA[k];
      return `<span class="similar-chip jp" data-kana="${k}">${k}<span class="lbl">${s ? s.romaji : ''}</span></span>`;
    }).join('') : '<span class="empty-note">No commonly confused look-alikes for this character.</span>';
    dtSimilar.querySelectorAll('.similar-chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const k = chip.dataset.kana;
        if(BY_KANA[k]) goTo(BY_KANA[k].idx);
      });
    });

    dtUsage.textContent = buildUsage(entry);

    const words = buildWords(entry);
    dtWords.innerHTML = words.length ? words.map(w=>`
      <div class="word-card">
        <div class="wtext"><span class="jp">${w.jp}</span><span class="m">${w.meaning}</span></div>
        <button class="word-play" data-jp="${w.jp}" aria-label="Play example word">▶</button>
      </div>`).join('') : '<div class="empty-note">No example word for this character.</div>';
    dtWords.querySelectorAll('.word-play').forEach(b=> b.addEventListener('click', ()=> speakText(b, b.dataset.jp)));

    const sentences = buildSentences(entry);
    dtSentences.innerHTML = sentences.length ? sentences.map(s=>`
      <div class="sentence-card">
        <div class="jp">${s.jp}</div>
        <div class="rm">${s.rm}</div>
        <div class="en">${s.en}</div>
        <button class="word-play" data-jp="${s.jp}" aria-label="Play example sentence">▶</button>
      </div>`).join('') : '<div class="empty-note">No example sentence available for this character.</div>';
    dtSentences.querySelectorAll('.word-play').forEach(b=> b.addEventListener('click', ()=> speakText(b, b.dataset.jp)));

    resetCanvasForEntry(entry);
  }

  function goTo(idx){
    currentIdx = ((idx % ALL.length) + ALL.length) % ALL.length;
    renderDetail();
  }

  openKanaDetailFn = function(kana){
    const entry = BY_KANA[kana];
    if(!entry) return;
    currentIdx = entry.idx;
    overlay.classList.remove('hidden');
    renderDetail();
    requestAnimationFrame(resizeCanvas);
    closeBtn.focus();
  };
  function closeDetail(){
    overlay.classList.add('hidden');
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
  closeBtn.addEventListener('click', closeDetail);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeDetail(); });
  prevBtn.addEventListener('click', ()=> goTo(currentIdx - 1));
  nextBtn.addEventListener('click', ()=> goTo(currentIdx + 1));
  document.addEventListener('keydown', (e)=>{
    if(overlay.classList.contains('hidden')) return;
    if(e.key === 'Escape') closeDetail();
    else if(e.key === 'ArrowLeft') goTo(currentIdx - 1);
    else if(e.key === 'ArrowRight') goTo(currentIdx + 1);
  });
  playBtn.addEventListener('click', ()=>{
    playBtn.classList.add('speaking');
    speak({ classList: { add(){}, remove(){ playBtn.classList.remove('speaking'); } } }, ALL[currentIdx].kana);
    // fallback timeout in case onend doesn't fire consistently
    setTimeout(()=> playBtn.classList.remove('speaking'), 1200);
  });
  playSlowBtn.addEventListener('click', ()=>{
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(ALL[currentIdx].kana);
    utter.lang = 'ja-JP';
    utter.rate = 0.45;
    playSlowBtn.classList.add('speaking');
    utter.onend = ()=> playSlowBtn.classList.remove('speaking');
    utter.onerror = ()=> playSlowBtn.classList.remove('speaking');
    window.speechSynthesis.speak(utter);
  });

  /* =========================================================
     WRITING PRACTICE CANVAS
     ========================================================= */
  const wrap = root.querySelector('#canvasWrap');
  const canvas = root.querySelector('#practiceCanvas');
  const ctx = canvas.getContext('2d');
  const traceSw = root.querySelector('#traceSw');
  const undoBtn = root.querySelector('#undoBtn');
  const redoBtn = root.querySelector('#redoBtn');
  const clearBtn = root.querySelector('#clearBtn');
  const saveBtn = root.querySelector('#saveBtn');

  let traceOn = true;
  let strokes = [];
  let redoStack = [];
  let activeStroke = null;
  let cssW = 0, cssH = 0;

  function resizeCanvas(){
    const rect = wrap.getBoundingClientRect();
    if(rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = rect.width; cssH = rect.height;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    redrawCanvas();
  }
  window.addEventListener('resize', ()=>{ if(!overlay.classList.contains('hidden')) resizeCanvas(); });
  document.addEventListener('nz:themechange', ()=>{ if(cssW && cssH) redrawCanvas(); });

  function drawTraceGlyph(){
    const entry = ALL[currentIdx];
    ctx.save();
    ctx.globalAlpha = 0.30;
    // Canvas can't read CSS var() directly — resolve the current theme's
    // subtle-foreground color live so the trace glyph stays visible
    // (previously hardcoded to the dark-theme color, so it vanished on
    // the Light Pink / Light Orange backgrounds).
    var traceColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--fg-subtle').trim() || '#8888AC';
    ctx.fillStyle = traceColor;
    ctx.font = `${Math.round(cssH*0.72)}px "Noto Sans JP", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(entry.kana, cssW/2, cssH/2 + cssH*0.03);
    ctx.restore();
  }
  function drawStroke(points){
    if(points.length < 1) return;
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, cssW * 0.028);
    ctx.strokeStyle = '#FF4D7E';
    if(points.length === 1){
      ctx.arc(points[0].x, points[0].y, ctx.lineWidth/2, 0, Math.PI*2);
      ctx.fillStyle = '#FF4D7E';
      ctx.fill();
      return;
    }
    ctx.moveTo(points[0].x, points[0].y);
    for(let i=1;i<points.length;i++){
      const p0 = points[i-1], p1 = points[i];
      const mx = (p0.x+p1.x)/2, my = (p0.y+p1.y)/2;
      ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
    }
    ctx.stroke();
  }
  function redrawCanvas(){
    ctx.clearRect(0, 0, cssW, cssH);
    if(traceOn) drawTraceGlyph();
    strokes.forEach(drawStroke);
    if(activeStroke) drawStroke(activeStroke);
    updateToolbarState();
  }
  function updateToolbarState(){
    undoBtn.disabled = strokes.length === 0;
    redoBtn.disabled = redoStack.length === 0;
  }

  function pointFromEvent(e){
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  canvas.addEventListener('pointerdown', (e)=>{
    canvas.setPointerCapture(e.pointerId);
    activeStroke = [pointFromEvent(e)];
    redoStack = [];
    redrawCanvas();
  });
  canvas.addEventListener('pointermove', (e)=>{
    if(!activeStroke) return;
    activeStroke.push(pointFromEvent(e));
    redrawCanvas();
  });
  function endStroke(){
    if(activeStroke && activeStroke.length){
      strokes.push(activeStroke);
    }
    activeStroke = null;
    redrawCanvas();
  }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  canvas.addEventListener('pointerleave', ()=>{ if(activeStroke) endStroke(); });

  traceSw.addEventListener('click', toggleTrace);
  traceSw.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleTrace(); } });
  function toggleTrace(){
    traceOn = !traceOn;
    traceSw.classList.toggle('on', traceOn);
    traceSw.setAttribute('aria-checked', String(traceOn));
    redrawCanvas();
  }

  undoBtn.addEventListener('click', ()=>{
    if(strokes.length === 0) return;
    redoStack.push(strokes.pop());
    redrawCanvas();
  });
  redoBtn.addEventListener('click', ()=>{
    if(redoStack.length === 0) return;
    strokes.push(redoStack.pop());
    redrawCanvas();
  });
  clearBtn.addEventListener('click', ()=>{
    strokes = []; redoStack = []; activeStroke = null;
    redrawCanvas();
  });
  saveBtn.addEventListener('click', ()=>{
    const link = document.createElement('a');
    link.download = `${ALL[currentIdx].kana}-practice.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  function resetCanvasForEntry(){
    strokes = []; redoStack = []; activeStroke = null;
    if(cssW && cssH) redrawCanvas();
  }

})();

  }


  // ── INIT ─────────────────────────────────────────────────────
  function init() {
    var mountEl = document.getElementById('kana-chart');
    if (!mountEl) {
      console.warn('[nz-kana.js] No element with id="kana-chart" found.');
      return;
    }
    injectFonts();
    injectStyles();
    mountEl.innerHTML = MARKUP;
    mountApp(mountEl);
  }

  // Expose re-init so the SPA can call it after dynamically injecting #kana-chart
  window._nzKanaInit = function() {
    var el = document.getElementById('kana-chart');
    if (!el) return;
    injectFonts();
    injectStyles();
    el.innerHTML = MARKUP;
    mountApp(el);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
