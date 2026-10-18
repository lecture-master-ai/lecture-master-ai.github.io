/* 대회용 설정 (공공 AI 대전환 챌린지 출품용 사본)
   - 배포한 대회용 Apps Script 웹앱 주소를 WEBAPP_URL 한 곳에만 넣으면 모든 화면이 그 주소를 씁니다.
   - 운영 서버 주소를 넣지 마십시오.
   - SIMPLE: 심사용 단순 화면(d1, 2026-10-16 결정). 홈·강의실 메뉴를 숨기고 첫 화면을 강의배정으로,
     로그인은 비밀번호 없이 [로그인] 버튼 하나로, 강사 승인은 확인창으로 줄입니다. false로 바꾸면 원래 화면으로 돌아갑니다(코드는 지우지 않음). */
window.CONTEST_CONFIG = {
  WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbzYdVSZsLnSw3JN01aIDuXa1Ubxh6ERWYC-0TEQxu6tRYrcI9-WNYEoKv3Cfk9qyUvJ/exec',
  VERSION: '대회용 d3e',
  ORG_NAME: '○○소방학교',
  SYS_ORG: '○○소방학교',   // d3e: 로그인 카드 아래 운영기관 이름(다른 학교에서 쓸 때 여기만 바꿈)
  SIMPLE: true,
  DEMO_PW: '0000',      // 심사용 담당자 권한(모의 데이터 전용). 운영판은 개인 비밀번호 사용
  DEMO_ADMIN: '1111',   // 심사용 승인 권한(화면에서는 묻지 않고 확인창만 표시)
  // 강의배정 첫 화면에 먼저 보여 줄 과정(ai: 강사 미배정 → AI 일괄 배정, copy: 편성 전 → 지난 기수 불러오기, cell: 빈 칸 1개)
  // 첫 화면 시연 과정(장면별 첫 과정 + 예비). 앞 과정이 처리되면 같은 장면의 다음 예비 과정이 첫 화면에 자동으로 올라옴
  // d2o: 평가관이 골라 올릴 수 있는 시연 과정(서버 DEMO_POOL과 같게 유지 — 서버 목록이 우선)
  DEMO_POOL: ['구급역량 향상과정 10기', '소방관계법규 실무과정 8기', '민관 합동 위험물 안전과정 6기', '화재조사 전문과정 13기', '구조역량 강화과정 14기', '신임 관리자 리더십과정 17기',
    '현장지휘관 역량과정 12기', '구조대원 전문화과정 2기', '구급 전문역량 심화과정 3기', '위험물·화학사고 대응과정 2기'],
  DEMO_COURSES: { '소방관계법규 실무과정 8기': 'ai', '소방관계법규 실무과정 9기': 'ai', '구급역량 향상과정 11기': 'ai',
    '구급역량 향상과정 10기': 'copy', '구조역량 강화과정 14기': 'copy', '화재조사 전문과정 13기': 'copy',
    '화재조사 전문과정 12기': 'cell', '민관 합동 위험물 안전과정 6기': 'cell', '신임 관리자 리더십과정 17기': 'cell' },
  // 평가관리 첫 화면에 보여 줄 과정(반영 대기 2 + 반영 완료 1)
  DEMO_EVAL: ['신임 관리자 리더십과정 16기', '구조역량 강화과정 13기', '현장지휘관 역량과정 11기', '구급 전문역량 심화과정 2기']
};
(function () {
  var C = window.CONTEST_CONFIG;
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (C.SIMPLE && (page === 'home.html' || page === 'index.html' || page === '')) {
    location.replace('lecture-assignment.html#v=table');
    return;
  }
  function banner() {
    if (document.getElementById('contestBanner')) return;
    var b = document.createElement('div');
    b.id = 'contestBanner';
    b.setAttribute('role', 'note');
    b.innerHTML = '<span class="cb-a">심사용 사본 · 모의 데이터 · 메일·문자 실제 발송 없음 · </span><a href="lecture-assignment.html#v=table" style="color:#1B3A5F;font-weight:700;">강의배정에서 과정을 골라 1~4단계를 직접 진행해 보세요</a>';
    var bs = document.createElement('style'); bs.textContent = '@media (max-width:600px){#contestBanner .cb-a{display:none}#contestBanner{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}'; document.head.appendChild(bs);
    b.style.cssText = 'background:#EEF1F5;color:#5F6877;font-size:11.5px;font-weight:600;text-align:center;padding:3px 12px;line-height:1.4;border-bottom:1px solid #E1E6ED;';
    document.body.insertBefore(b, document.body.firstChild);
    var v = document.createElement('div');
    v.id = 'contestVersion';
    v.textContent = C.VERSION;
    v.style.cssText = 'text-align:center;color:#9AA5B1;font-size:11px;padding:10px 0 14px;';
    document.body.appendChild(v);
  }
  function simple() {
    if (!C.SIMPLE) return;
    // 상단 메뉴: 강의배정 · 강사관리 · 평가관리만
    Array.prototype.forEach.call(document.querySelectorAll('.gnav a.gnav-i'), function (a) {
      var h = a.getAttribute('href') || '';
      if (/home\.html/.test(h) || /#v=room/.test(h) || a.id === 'gnavRoom') a.style.display = 'none';
    });
    // 홈을 숨겼으므로 '홈 ›' 경로 표시도 숨김
    Array.prototype.forEach.call(document.querySelectorAll('#crumb, .crumb'), function (c) { c.style.display = 'none'; });
    var br = document.querySelector('.gnav-brand');
    if (br) { br.style.cursor = 'pointer'; br.onclick = function () { location.href = 'lecture-assignment.html#v=table'; }; }
    // 로그인: 비밀번호 칸 없이 [로그인] 버튼(담당자 권한으로 입장)
    var form = document.getElementById('loginForm'), btn = document.getElementById('loginBtn');
    var pins = document.querySelectorAll('#loginForm .pin-box');
    if (form && btn && pins.length) {
      Array.prototype.forEach.call(pins, function (p) { p.parentNode.style.display = 'none'; });
      btn.textContent = '로그인';
      // d2w: 로그인 카드 표기 통일 — 시스템 이름 + 화면 이름 + 로그인 안내
      var card = document.getElementById('loginCard');
      if (card) {
        var tt = card.querySelector('.title'), subs = card.querySelectorAll('.sub');
        var tparts = String(document.title).split(' · '), pg = (tparts.length > 1 ? tparts[tparts.length - 1] : '').trim();
        // d3c: 운영 로그인 카드 B안과 같은 모양 — 화면 이름 칸 → 고딕 굵은 시스템 이름(ON만 주황) → 부제 한 줄. '담당자 전용·비밀번호' 안내 줄은 뺌(운영 d334b96과 같음)
        if (!document.getElementById('lgCss')) { var ls = document.createElement('style'); ls.id = 'lgCss';
          ls.textContent = '#loginCard .lg-pg{display:inline-block;font-size:12px;font-weight:700;color:#1B3A5F;background:#EEF2F7;border-radius:999px;padding:3px 10px;margin-bottom:12px;}' +
            '#loginCard .lg-name{font-family:Pretendard,"Malgun Gothic","Apple SD Gothic Neo",sans-serif;font-size:24px;line-height:1.3;font-weight:800;color:#1B3A5F;margin-bottom:6px;word-break:keep-all;}' +
            '#loginCard .lg-on{color:#E8590C;} #loginCard .lg-s1{font-weight:700;margin-bottom:22px;word-break:keep-all;}' +
            '#loginCard.lg-dark .lg-name{color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.45);} #loginCard.lg-dark .lg-on{color:#FFB38A;}';   // 사진 배경(강사관리)은 밝은 글자
          document.head.appendChild(ls); }
        try { var bg = getComputedStyle(card).backgroundColor, m = /rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/.exec(bg); if (m && (m[4] !== undefined && Number(m[4]) < 0.6)) card.classList.add('lg-dark'); } catch (e) {}
        if (tt) { tt.className = 'title lg-name'; tt.removeAttribute('style'); tt.innerHTML = '소방교육 외래강사 <span class="lg-on">ON</span>';
          if (pg && !card.querySelector('.lg-pg')) { var chip = document.createElement('div'); chip.className = 'lg-pg'; chip.textContent = pg; tt.parentNode.insertBefore(chip, tt); } }
        Array.prototype.forEach.call(subs, function (x, i) { if (i > 0) x.parentNode.removeChild(x); });
        var last = card.querySelector('.sub');
        if (last) { last.className = 'sub lg-s1'; last.removeAttribute('style'); last.textContent = 'AI 강사 추천·평가·환류 시스템'; last.style.marginBottom = '4px';
          var org = document.createElement('div'); org.className = 'sub'; org.style.cssText = 'margin-bottom:22px;'; org.textContent = C.SYS_ORG || '○○학교'; last.parentNode.insertBefore(org, last.nextSibling); }
      }
      var fill = function () { Array.prototype.forEach.call(pins, function (p, i) { p.value = String(C.DEMO_PW).charAt(i) || ''; }); };
      btn.addEventListener('click', fill, true);
      form.addEventListener('submit', fill, true);
    }
  }
  /* ===== d2b: AI 도움 표지 · AI 작동 중 표시(모든 화면 공통) =====
     - AI가 쓰이는 버튼에 같은 파란 'AI 도움' 표지와 설명 말풍선을 붙임
     - 서버의 AI 액션을 부르는 동안 화면 맨 위에 진행 줄과 경과 초, 누른 버튼은 'AI 작동 중'으로 바뀜. 끝나면 모델 이름·걸린 시간을 3초 보여 줌 */
  var AI_ACT = {
    aiBatchAssign: '강사카드·평가·의견을 읽고 교과목 관련성을 판단하고 있습니다',
    aiCardFill: '강사카드 글을 읽고 칸을 나누고 있습니다',
    aiRecommend: '비슷한 교과목을 찾고 근거를 쓰고 있습니다',
    surveyPreview: '서술형 의견을 분류·요약하고 있습니다'
  };
  var AI_TIP = 'AI 도움: 강사카드·평가·의견 같은 글을 AI가 읽고 근거를 제시합니다. 적용·발송은 담당자가 결정합니다.';
  var AI_BTN = ['#abBar [data-ab="draft"]', '#abBar [data-ab="review"]', '#cxFind', '#cardMdl label.filebtn', '[data-cxsurvey]'];
  function aiCss() {
    if (document.getElementById('aiCss')) return;
    var st = document.createElement('style'); st.id = 'aiCss';
    st.textContent = '.ai-badge{display:inline-flex;align-items:center;font-size:10.5px;font-weight:800;line-height:1;background:#2F6FB2;color:#fff;border-radius:4px;padding:3px 5px;margin-right:6px;letter-spacing:-0.2px;white-space:nowrap;vertical-align:1px}' +
      '.btn.primary .ai-badge,.ai-onnavy .ai-badge{background:#fff;color:#1B3A5F}' +
      '.ai-busy{position:relative;pointer-events:none;opacity:1!important;box-shadow:0 0 0 2px #2F6FB2 inset!important}' +
      '.ai-busy .ai-orig{display:none}.ai-busy-t{display:inline-flex;align-items:center;gap:6px}' +
      '.ai-spin{width:12px;height:12px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:aiSpin .8s linear infinite;display:inline-block}' +
      '@keyframes aiSpin{to{transform:rotate(360deg)}}' +
      '#aiTop{position:fixed;left:0;right:0;top:0;z-index:100000;display:none;font-family:inherit}' +
      '#aiTop .bar{display:block;margin:0;padding:0;border:0;border-radius:0;min-height:0;box-shadow:none;height:3px;background:linear-gradient(90deg,rgba(47,111,178,.15),#2F6FB2,rgba(47,111,178,.15));background-size:40% 100%;background-repeat:no-repeat;animation:aiBar 1.2s ease-in-out infinite;background-color:#D7E5F5}' +
      '#aiTop.aiwk .bar{background-color:#DCE3EC;background-image:linear-gradient(90deg,rgba(27,58,95,.15),#1B3A5F,rgba(27,58,95,.15))}#aiTop.aiwk .msg{border-color:#B8C4D4}#aiTop.done.aiwk .bar{background:#1B3A5F}' +
      '#aiTop.done .bar{animation:none;background:#2F6FB2}#aiTop.warn .bar{animation:none;background:#E8762B}' +
      '@keyframes aiBar{0%{background-position:-40% 0}100%{background-position:140% 0}}' +
      '#aiTop .msg{margin:6px auto 0;width:max-content;max-width:calc(100vw - 24px);display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #9DBCE0;border-radius:999px;padding:5px 12px;font-size:12.5px;font-weight:700;color:#1B3A5F;box-shadow:0 2px 8px rgba(16,24,40,.12)}' +
      '#aiTop.warn .msg{border-color:#F3C9A6;color:#9A3D0A}#aiTop .msg small{font-weight:600;color:#5F6877}' +
      '@media (prefers-reduced-motion:reduce){#aiTop .bar,.ai-spin{animation:none}}' +
      '.ai-hint{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-size:13px;color:#344054;margin:2px 0 10px}.ai-hint b{color:#1B3A5F}';
    document.head.appendChild(st);
  }
  function aiDecorate() {
    AI_BTN.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        if (el.getAttribute('data-aideco')) return;
        el.setAttribute('data-aideco', '1');
        var old = el.querySelector('.ab-tag'); if (old) old.parentNode.removeChild(old);
        var b = document.createElement('span'); b.className = 'ai-badge'; b.textContent = 'AI 도움';
        el.insertBefore(b, el.firstChild);
        el.classList.add('ai-btn');
        if (!el.getAttribute('title') || el.id === 'cxFind') el.setAttribute('title', AI_TIP);
        if (el.matches('label.filebtn, .cxbtn')) el.classList.add('ai-onnavy');
      });
    });
  }
  var aiLast = null, aiLastAt = 0, aiRun = {}, aiN = 0, aiT0 = 0, aiTick = null, aiHide = null, aiBtns = [];
  document.addEventListener('click', function (ev) { var t = ev.target && ev.target.closest ? ev.target.closest('.ai-btn') : null; if (t) { aiLast = t; aiLastAt = Date.now(); } }, true);
  document.addEventListener('change', function (ev) { var t = ev.target && ev.target.closest ? ev.target.closest('.ai-btn') : null; if (t) { aiLast = t; aiLastAt = Date.now(); } }, true);
  function aiTop() {
    var el = document.getElementById('aiTop');
    if (!el) { el = document.createElement('div'); el.id = 'aiTop'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); el.innerHTML = '<div class="bar"></div><div class="msg"></div>'; document.body.appendChild(el); }
    return el;
  }
  function aiSec() { return Math.max(0, Math.round((Date.now() - aiT0) / 100) / 10); }
  function aiStart(act) {
    aiRun[act] = (aiRun[act] || 0) + 1; aiN++;
    if (aiN > 1) return;
    clearTimeout(aiHide); aiT0 = Date.now();
    var el = aiTop(); el.className = ''; el.style.display = 'block';
    var put = function () { el.querySelector('.msg').innerHTML = '<span class="ai-badge">AI</span>AI가 판단하는 중 <small>· ' + AI_ACT[act] + ' · ' + Math.floor(aiSec()) + '초</small>'; aiBtns.forEach(function (b) { var s = b.querySelector('.ai-sec'); if (s) s.textContent = Math.floor(aiSec()) + '초'; }); };
    put(); clearInterval(aiTick); aiTick = setInterval(put, 500);
    if (aiLast && Date.now() - aiLastAt < 3000 && document.body.contains(aiLast)) {
      var b = aiLast; aiLast = null;
      if (!b.classList.contains('ai-busy')) {
        Array.prototype.forEach.call(b.childNodes, function (n) { if (n.nodeType === 3 && n.textContent.trim()) { var sp = document.createElement('span'); sp.className = 'ai-orig'; sp.textContent = n.textContent; b.replaceChild(sp, n); } else if (n.nodeType === 1 && !n.classList.contains('ai-badge') && n.tagName !== 'INPUT') n.classList.add('ai-orig'); });
        var t = document.createElement('span'); t.className = 'ai-busy-t'; t.innerHTML = '<i class="ai-spin" aria-hidden="true"></i>AI 작동 중… <b class="ai-sec">0초</b>';
        b.appendChild(t); b.classList.add('ai-busy'); aiBtns.push(b);
      }
    }
  }
  function aiEnd(act, j) {
    aiRun[act] = Math.max(0, (aiRun[act] || 1) - 1); aiN = Math.max(0, aiN - 1);
    if (aiN > 0) return;
    clearInterval(aiTick);
    aiBtns.forEach(function (b) { b.classList.remove('ai-busy'); var t = b.querySelector('.ai-busy-t'); if (t) t.parentNode.removeChild(t); Array.prototype.forEach.call(b.querySelectorAll('.ai-orig'), function (n) { n.classList.remove('ai-orig'); }); });
    aiBtns = [];
    var el = aiTop(), sec = aiSec().toFixed(1), model = '', ok = true;
    if (j && j.status === 'ok') {
      if (act === 'surveyPreview') { var a = (j.data && j.data.ai) || {}; model = a.요약 || a.연결 || ''; ok = !!model; }
      else { ok = j.ai !== false; model = j.모델 || ''; }
    } else ok = false;
    el.className = ok ? 'done' : 'warn';
    el.querySelector('.msg').innerHTML = ok ? '<span class="ai-badge">AI</span>AI 완료 <small>· ' + (model ? model + ' · ' : '') + sec + '초</small>'
      : '<span class="ai-badge" style="background:#E8762B">AI</span>AI 응답 없음 <small>· 규칙 결과로 표시했습니다 · ' + sec + '초</small>';
    clearTimeout(aiHide); aiHide = setTimeout(function () { el.style.display = 'none'; }, ok ? 3000 : 5000);
  }
  /* d2e: AI가 아닌 오래 걸리는 작업도 화면 맨 위에 '작업 중' 표시(발송·저장·되돌리기 등) */
  var WORK_ACT = {
    sendHeldNotices: ['강사별 안내 메일을 보내는 중', '안내 메일 발송'],
    applyAiDraft: ['배정을 저장하는 중', '배정 저장'],
    copySessions: ['지난 기수 편성을 불러오는 중', '불러오기'],
    demoReset: ['처음 상태로 되돌리는 중', '되돌리기'],
    makeSurveyForm: ['설문 링크를 만드는 중', '설문 링크 만들기'],
    sendFeedback: ['환류 메일을 보내는 중', '환류 메일 발송'],
    surveyCommit: ['설문 결과를 반영하는 중', '설문 결과 반영'],
    surveyUndo: ['반영을 취소하는 중', '반영 취소'],
    saveSession: ['저장하는 중', '저장'],
    deleteSession: ['삭제하는 중', '삭제'],
    abRulesSave: ['배정 규칙 기본값을 저장하는 중', '규칙 저장'],
    boardSet: ['보드에 과정을 올리는 중', '과정 올리기']
  };
  var wkN = 0, wkT0 = 0, wkTick = null, wkAct = '';
  function wkStart(act) {
    wkN++; if (wkN > 1 || aiN > 0) return;
    clearTimeout(aiHide); wkT0 = Date.now(); wkAct = act;
    var el = aiTop(); el.className = 'aiwk'; el.style.display = 'block';
    var put = function () { if (aiN > 0) return; el.querySelector('.msg').innerHTML = '<i class="ai-spin" aria-hidden="true"></i>' + WORK_ACT[wkAct][0] + ' <small>· ' + Math.floor((Date.now() - wkT0) / 1000) + '초</small>'; };
    put(); clearInterval(wkTick); wkTick = setInterval(put, 500);
  }
  function wkEnd(act, j) {
    wkN = Math.max(0, wkN - 1); if (wkN > 0 || aiN > 0) return;
    clearInterval(wkTick);
    var el = aiTop(), ok = !!(j && j.status === 'ok'), sec = ((Date.now() - wkT0) / 1000).toFixed(1);
    if (ok) { el.style.display = 'none'; return; }   // d3c: 완료는 가운데 안내 카드가 알려 주므로 위쪽 '완료' 표시는 생략
    el.className = ok ? 'done aiwk' : 'warn';
    el.querySelector('.msg').innerHTML = ok ? WORK_ACT[act][1] + ' 완료 <small>· ' + sec + '초</small>' : '끝나지 않았습니다 <small>· 화면의 안내를 확인해 주세요</small>';
    clearTimeout(aiHide); aiHide = setTimeout(function () { el.style.display = 'none'; }, ok ? 2500 : 5000);
  }
  if (window.fetch && !window.__aiWrap) {
    window.__aiWrap = true;
    var of = window.fetch.bind(window);
    window.fetch = function (url, opt) {
      var act = '';
      var wk = '';
      try { if (opt && typeof opt.body === 'string' && opt.body.charAt(0) === '{') { var bd = JSON.parse(opt.body); if (AI_ACT[bd.action]) act = bd.action; else if (WORK_ACT[bd.action]) wk = bd.action; } } catch (e) {}
      if (wk) {
        wkStart(wk);
        var wdone = false, wfin = function (j) { if (wdone) return; wdone = true; wkEnd(wk, j); };
        return of(url, opt).then(function (r) { try { r.clone().json().then(wfin, function () { wfin(null); }); } catch (e) { wfin(null); } return r; }, function (err) { wfin(null); throw err; });
      }
      if (!act) return of(url, opt);
      aiStart(act);
      var done = false, fin = function (j) { if (done) return; done = true; aiEnd(act, j); };
      return of(url, opt).then(function (r) {
        try { r.clone().json().then(fin, function () { fin(null); }); } catch (e) { fin(null); }
        return r;
      }, function (err) { fin(null); throw err; });
    };
  }
  /* d3c: 다음 할 일 안내(모든 화면 공통) — 화면 가운데 큰 카드 1장. 결과 한 줄 + "다음: 버튼"만.
     거의 동시에(1초 안) 온 알림은 한 카드로 합치고, 그 뒤 새 알림이 오면 앞 카드를 바로 닫고 새 카드만 보여 줌(겹치지 않음). 4초 뒤 사라지고, 누르면 바로 닫힘 */
  var gQ = [], gCur = null;
  window.cxGuide = function (done, next, sel) {
    var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    if (!document.getElementById('cxGdCss')) {
      var st = document.createElement('style'); st.id = 'cxGdCss';
      st.textContent = '#cxGd{position:fixed;left:50%;top:45%;transform:translate(-50%,-50%);z-index:100001;pointer-events:none;width:min(560px,calc(100vw - 32px))}' +
        '.cxg{pointer-events:auto;cursor:pointer;display:flex;flex-direction:column;gap:10px;background:#1B3A5F;color:#fff;border-radius:16px;padding:22px 26px;box-shadow:0 12px 36px rgba(16,24,40,.32);line-height:1.45;word-break:keep-all;text-align:center;opacity:0;transform:scale(.96);transition:opacity .22s ease-out,transform .22s ease-out}' +
        '.cxg.in{opacity:1;transform:none} .cxg.out{opacity:0;transform:scale(.98)}' +
        '.cxg-d{font-size:19px;font-weight:800} .cxg-d:before{content:"\\2713";color:#7CD4A4;margin-right:8px}' +
        '.cxg-n{font-size:17px;color:#E6ECF3} .cxg-d ~ .cxg-n{border-top:1px solid rgba(255,255,255,.18);padding-top:10px} .cxg-n b{display:inline-block;background:#E8762B;color:#fff;border-radius:999px;padding:1px 10px;margin-right:8px;font-size:14px;vertical-align:2px} .cxg-n i{font-style:normal;font-weight:800;color:#fff}' +
        '.cxg-x{font-size:12px;color:#9FB2C8}' +
        '@keyframes cxgP{0%{box-shadow:0 0 0 0 rgba(232,118,43,.75)}70%{box-shadow:0 0 0 10px rgba(232,118,43,0)}100%{box-shadow:0 0 0 0 rgba(232,118,43,0)}}' +
        '.cxg-pulse{animation:cxgP 1.2s ease-out 2;outline:2px solid #E8762B !important;outline-offset:2px}' +
        '@media (prefers-reduced-motion:reduce){.cxg-pulse{animation:none}.cxg{transition:none}}' +
        '@media (max-width:600px){.cxg{padding:18px 18px}.cxg-d{font-size:17px}.cxg-n{font-size:15.5px}}';
      document.head.appendChild(st);
    }
    var box = document.getElementById('cxGd');
    if (!box) { box = document.createElement('div'); box.id = 'cxGd'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    if (!done && !next) return;
    if (next) next = String(next).split(' — ')[0];   // 핵심만: 버튼 이름까지만 남기고 설명은 뺌
    // 방금(1초 안) 뜬 카드가 있으면 그 카드에 합침
    if (gCur && Date.now() - gCur.at < 1000) { addTo(gCur, done, next, sel); return; }
    if (gCur) { gQ = [[done, next, sel]]; hide(gCur, true); return; }   // 새 안내가 오면 앞 카드는 빨리 닫고 새 카드만(지난 안내가 늦게 뜨지 않게)
    show(done, next, sel);
    function addTo(c, d, n, s) {
      if (d) { var e1 = document.createElement('div'); e1.className = 'cxg-d'; e1.innerHTML = esc(d); var nx = c.el.querySelector('.cxg-n'); c.el.insertBefore(e1, nx || c.el.querySelector('.cxg-x')); }
      if (n) { var old = c.el.querySelector('.cxg-n'); if (old) old.parentNode.removeChild(old); var e2 = document.createElement('div'); e2.className = 'cxg-n'; e2.innerHTML = '<b>다음</b>' + n; c.el.insertBefore(e2, c.el.querySelector('.cxg-x')); }
      if (s) c.sel = s;
      clearTimeout(c.t); c.t = setTimeout(function () { hide(c); }, 4200);
    }
    function show(d, n, s) {
      var el = document.createElement('div'); el.className = 'cxg'; el.innerHTML = '<div class="cxg-x">누르면 닫힙니다</div>';
      box.appendChild(el);
      var c = { el: el, at: Date.now(), sel: '' }; gCur = c;
      addTo(c, d, n, s);
      requestAnimationFrame(function () { el.classList.add('in'); });
      el.addEventListener('click', function () { hide(c); });
    }
    function hide(c, quick) {
      if (c.gone) return; c.gone = true; clearTimeout(c.t);
      c.el.classList.remove('in'); c.el.classList.add('out');
      if (c.sel && !quick) pulse(c.sel);   // 카드가 사라질 때 눌러야 할 버튼을 한 번 강조(가리지 않게)
      setTimeout(function () {
        if (c.el.parentNode) c.el.parentNode.removeChild(c.el);
        if (gCur === c) gCur = null;
        var q = gQ.shift(); if (q) show(q[0], q[1], q[2]);
      }, 240);
    }
    function pulse(sel) {
      clearTimeout(window.__cxgT); var tries = 0;
      var find = function () {
        var t = Array.prototype.filter.call(document.querySelectorAll(sel), function (x) { return x.offsetParent !== null && !x.disabled; })[0];
        if (!t) { if (++tries < 20) window.__cxgT = setTimeout(find, 250); return; }
        var r = t.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight - 10) t.scrollIntoView({ block: 'center', behavior: 'smooth' });
        t.classList.remove('cxg-pulse'); void t.offsetWidth; t.classList.add('cxg-pulse');
        setTimeout(function () { t.classList.remove('cxg-pulse'); }, 2600);
      };
      window.__cxgT = setTimeout(find, 60);
    }
  };
  /* d2b: 긴 상세 카드는 위·아래 모두 [닫기] — 아래에만 [닫기]가 있는 카드의 머리 줄에 같은 동작의 버튼을 붙임 */
  function topClose() {
    ['#iCard', '#bCard', '#cCard'].forEach(function (sel) {
      var card = document.querySelector(sel); if (!card) return;
      var top = card.querySelector(':scope > .top'); if (!top || top.querySelector('.topx')) return;
      var bottom = Array.prototype.filter.call(card.querySelectorAll('button'), function (b) { return b.textContent.trim() === '닫기' && !b.classList.contains('topx'); }).pop();
      if (!bottom) return;
      var x = document.createElement('button'); x.type = 'button'; x.className = 'btn sm topx'; x.textContent = '닫기';
      x.style.cssText = 'margin-left:auto;flex:0 0 auto;align-self:flex-start;';
      x.addEventListener('click', function () { bottom.click(); });
      top.appendChild(x);
    });
  }
  function ready() { banner(); simple(); aiCss(); aiDecorate(); topClose(); try { new MutationObserver(function () { clearTimeout(window.__aiDec); window.__aiDec = setTimeout(function () { aiDecorate(); topClose(); }, 60); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
