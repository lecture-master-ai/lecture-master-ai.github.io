/* 대회용: 서버에 저장·제출 요청을 보내는 동안 "처리 중" 표시(회전 원 + 경과 초)
   - 화면 코드는 그대로 두고, 서버(WEBAPP_URL)로 가는 저장·제출 요청만 골라 표시합니다.
   - 0.6초 안에 끝나는 요청은 표시하지 않습니다(깜빡임 방지).
   - 15초가 넘으면 "정상 처리 중" 안내로 바뀝니다. 응답이 오면(성공·실패 모두) 바로 사라집니다. */
(function () {
  'use strict';
  if (window.__cxWait) return;
  var LABELS = {
    register: ['등록 신청을 보내는 중입니다', '첨부 파일이 있으면 올리는 데 시간이 걸릴 수 있습니다.'],
    inviteRegister: ['강사 등록 정보를 보내는 중입니다', '첨부 파일이 있으면 올리는 데 시간이 걸릴 수 있습니다.'],
    submitLecture: ['강의자료를 제출하는 중입니다', '파일을 올리고 서버에 저장하고 있습니다.'],
    submitSessionPlan: ['강의계획서를 제출하는 중입니다', '파일을 올리고 서버에 저장하고 있습니다.'],
    requestDocReplace: ['서류 교체 요청을 보내는 중입니다', ''],
    requestLodging: ['숙소 신청을 보내는 중입니다', ''],
    saveSession: ['교과목을 저장하는 중입니다', ''],
    deleteSession: ['교과목을 삭제하는 중입니다', ''],
    copySessions: ['편성을 복사하는 중입니다', ''],
    updatePlan: ['과정 정보를 저장하는 중입니다', ''],
    confirmConflict: ['확인 내용을 저장하는 중입니다', ''],
    decideApproval: ['승인 결과를 저장하는 중입니다', ''],
    deleteInstructor: ['강사 정보를 삭제하는 중입니다', ''],
    setDormant: ['강사 상태를 바꾸는 중입니다', ''],
    recordReconsent: ['재동의 기록을 저장하는 중입니다', ''],
    updateSchoolInfo: ['학교 정보를 저장하는 중입니다', ''],
    decideDocReplace: ['서류 교체 결과를 저장하는 중입니다', ''],
    resendSessionNotice: ['강사 안내를 다시 보내는 중입니다', ''],
    confirmLodging: ['숙소 확정 내용을 저장하는 중입니다', ''],
    saveReservation: ['강의실 예약을 저장하는 중입니다', ''],
    cancelReservation: ['강의실 예약을 취소하는 중입니다', ''],
    requestReservation: ['대관 신청을 보내는 중입니다', ''],
    decideReservation: ['대관 신청 결과를 저장하는 중입니다', ''],
    surveyPreview: ['설문 결과를 분석하는 중입니다', 'AI가 문항을 맞추고 의견을 요약하고 있습니다.'],
    surveyCommit: ['설문 결과를 반영하는 중입니다', '']
  };
  var SHOW_AFTER = 600, SLOW_AFTER = 15000;
  var css = '#cxWait{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(16,24,40,.38);padding:16px}' +
    '#cxWait.on{display:flex}' +
    '#cxWait .cxw-card{background:#fff;border-radius:14px;box-shadow:0 12px 32px rgba(16,24,40,.22);padding:22px 24px 18px;max-width:340px;width:100%;text-align:center;font-family:inherit}' +
    '#cxWait .cxw-ring{position:relative;width:76px;height:76px;margin:0 auto 12px}' +
    '#cxWait .cxw-ring svg{width:76px;height:76px;animation:cxwSpin 1s linear infinite}' +
    '#cxWait .cxw-ring circle{fill:none;stroke-width:6}' +
    '#cxWait .cxw-num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#1B3A5F;line-height:1}' +
    '#cxWait .cxw-num small{font-size:11px;font-weight:600;color:#667085;margin-top:3px}' +
    '#cxWait .cxw-t{font-size:15.5px;font-weight:800;color:#1B2433;margin-bottom:4px;word-break:keep-all}' +
    '#cxWait .cxw-s{font-size:13px;color:#475467;line-height:1.5;min-height:19px;word-break:keep-all}' +
    '#cxWait .cxw-n{font-size:12px;color:#9B1C12;font-weight:700;margin-top:10px}' +
    '@keyframes cxwSpin{to{transform:rotate(360deg)}}' +
    '@media (prefers-reduced-motion:reduce){#cxWait .cxw-ring svg{animation-duration:3s}}';
  var box = null, timerShow = null, timerTick = null, t0 = 0, active = 0, cur = null;
  function build() {
    if (box) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'cxWait'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<div class="cxw-card"><div class="cxw-ring"><svg viewBox="0 0 76 76" aria-hidden="true">' +
      '<circle cx="38" cy="38" r="32" stroke="#E4E9F0"></circle>' +
      '<circle cx="38" cy="38" r="32" stroke="#1B3A5F" stroke-linecap="round" stroke-dasharray="60 141"></circle></svg>' +
      '<div class="cxw-num"><span id="cxwSec">0</span><small>초</small></div></div>' +
      '<div class="cxw-t" id="cxwT"></div><div class="cxw-s" id="cxwS"></div><div class="cxw-n">처리 중에는 창을 닫거나 새로고침하지 마세요.</div></div>';
    document.body.appendChild(box);
  }
  function tick() {
    var sec = Math.floor((Date.now() - t0) / 1000);
    var el = document.getElementById('cxwSec'); if (el) el.textContent = String(sec);
    if (Date.now() - t0 > SLOW_AFTER) {
      var s = document.getElementById('cxwS');
      if (s) s.textContent = '시간이 조금 더 걸리고 있습니다. 서버는 정상적으로 처리하고 있으니 잠시만 기다려 주세요.';
    }
  }
  function start(action) {
    active++;
    if (active > 1) return;
    cur = LABELS[action] || ['서버에 저장하는 중입니다', ''];
    t0 = Date.now();
    clearTimeout(timerShow);
    timerShow = setTimeout(function () {
      if (!active) return;
      build();
      document.getElementById('cxwT').textContent = cur[0];
      document.getElementById('cxwS').textContent = cur[1];
      tick(); box.classList.add('on');
      clearInterval(timerTick); timerTick = setInterval(tick, 250);
    }, SHOW_AFTER);
  }
  function stop() {
    active = Math.max(0, active - 1);
    if (active) return;
    clearTimeout(timerShow); clearInterval(timerTick);
    if (box) box.classList.remove('on');
  }
  function actionOf(init) {
    try {
      if (!init || String(init.method || 'GET').toUpperCase() !== 'POST' || typeof init.body !== 'string') return '';
      var b = init.body;
      var m = /"action"\s*:\s*"([A-Za-z]+)"/.exec(b.slice(0, 400));
      return m ? m[1] : '';
    } catch (e) { return ''; }
  }
  var origFetch = window.fetch;
  if (typeof origFetch !== 'function') return;
  window.fetch = function (url, init) {
    var cfgUrl = (window.CONTEST_CONFIG && window.CONTEST_CONFIG.WEBAPP_URL) || '';
    var a = (cfgUrl && String(url).indexOf(cfgUrl) === 0) ? actionOf(init) : '';
    if (!a || !LABELS[a]) return origFetch.apply(this, arguments);
    start(a);
    var p;
    try { p = origFetch.apply(this, arguments); } catch (e) { stop(); throw e; }
    // 응답 본문을 다 받을 때까지 표시(res.json()이 끝나는 시점과 거의 같음)
    return p.then(function (res) {
      try {
        var c = res.clone();
        c.text().then(stop, stop);
      } catch (e) { stop(); }
      return res;
    }, function (err) { stop(); throw err; });
  };
  window.__cxWait = { start: start, stop: stop };
})();
