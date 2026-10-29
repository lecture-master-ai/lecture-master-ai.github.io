/* AI 배정 도우미(대회용 d4a) — 강의배정 편성 화면 오른쪽 드로워
   - 처음 열 때만 불러옴. 화면 기능은 window.__cbApi(lecture-assignment.html)로만 읽고 저장함
   - AI는 문장 해석(chatParse)과 후보 근거(aiRecommend)만. 저장은 담당자가 확인 카드의 [배정]을 눌러야 함
   - 화면에 넣는 글자는 모두 esc() 처리(AI 응답 포함), 이름은 cb- 전용 */
(function(){
  'use strict';
  var A = window.__cbApi; if (!A) return;
  var GL = [
    ['교과목 편성', '1단계입니다. 시간표 빈 교시에 교과목을 넣습니다. 빈 교시를 모두 채우거나 [비워둠 처리]하면 2단계로 넘어갑니다.'],
    ['강사 배정', '2단계입니다. 교과목마다 강사를 정합니다. [AI 강사 일괄 배정], 칸별 [적합한 강사 찾기], 또는 저에게 말씀하셔도 됩니다.'],
    ['배정 완료', '3단계입니다. 모든 교과목에 강사가 정해진 상태입니다. 화면 맨 아래 [4단계로 넘기기]를 누르면 보드 4단계로 옮겨집니다.'],
    ['최종 확인·발송', '4단계입니다. 보드 4단계 카드의 [최종 확인하고 발송]에서 교과목·강사를 한 번 더 확인하고, 강사별로 문자·메일을 1통씩 보냅니다.'],
    ['빈 교시', '교육 기간 중 교과목이 들어가지 않은 수업 교시입니다. 오늘 이후 칸만 셉니다.'],
    ['비워둠 처리', '일부러 교과목을 넣지 않는 교시를 표시하는 기능입니다. 비워둠으로 처리한 칸은 빈 교시로 세지 않습니다. 시간표 위 [비워둠 처리 켜기]를 누르면 칸마다 버튼이 나타납니다.'],
    ['지난 기수 편성 불러오기', '같은 과정 지난 기수의 교과목·교시를 이번 기수 날짜에 맞춰 가져옵니다. 강사는 그동안의 설문 평가를 반영해 AI가 유지·교체를 제안합니다.'],
    ['지난 기수로 빈 교시 채우기', '편성 도중 남은 빈 교시만 지난 기수 편성으로 채웁니다. 직접 넣은 칸은 그대로 둡니다. 시간표 바로 위 파란 줄에 버튼이 있습니다.'],
    ['AI 강사 일괄 배정', '강사가 비어 있는 칸 전체에 AI가 후보를 골라 초안을 만듭니다. 초안을 확인하고 [적용]해야 저장됩니다.'],
    ['적합한 강사 찾기', '한 칸의 교과목·일시에 맞는 강사 후보를 담당 이력·평가로 정리하고, AI가 이름이 다른 비슷한 교과목도 연결해 근거를 붙입니다.'],
    ['랭크', '강사 별점입니다. 교육 후 설문(5점 척도)의 응답 수 가중 평균이며, 응답이 10건 미만이면 \'평가 자료 부족\'으로 표시합니다.'],
    ['신규 강사', '평가가 아직 쌓이지 않은 강사입니다. 순위와 별도로 함께 보여 드려 기회를 드립니다.'],
    ['담당자 지정', '담당자가 칸에서 직접 고른 강사입니다. AI 재검토에서도 기본으로 유지합니다.'],
    ['카드 없음', '강사카드에 없는 이름을 직접 입력한 강사입니다. 연락처가 없어 문자·메일 안내가 가지 않으니 직접 연락해야 합니다.'],
    ['이동 모드', '시간표에서 교과목을 다른 칸으로 옮기거나 맞바꾸는 기능입니다. 시간표 위 [이동 모드 켜기]를 누릅니다.'],
    ['같은 주 전체 과정', '같은 주에 진행되는 다른 과정까지 한 시간표에 보여 줍니다. 강의실·강사 겹침을 확인할 때 씁니다.'],
    ['겹침 경고', '같은 강의실이나 강사가 같은 시각에 두 곳에 배정된 경우 표시합니다. 입력칸 저장은 경고 후 저장하고, 도우미 저장은 서버가 막습니다.'],
    ['4단계로 넘기기', '3단계(배정 완료)에서 누르는 버튼입니다. 보드 4단계 칸으로 옮겨 최종 확인·발송을 합니다. 넘긴 표시는 이 브라우저에 저장됩니다.'],
    ['보드', '강의배정 첫 화면의 1~4단계 칸입니다. 진행 중인 과정 카드가 지금 단계 칸에 놓입니다.'],
    ['멈춤 카드', '진행하다 다른 과정을 올리면 저장되어 회색 \'멈춤\' 카드로 남습니다. [이어서 하기]로 다시 진행합니다.'],
    ['이 과정 초기화', '1단계 과정의 교과목·강사를 모두 지우고 보드에서 내려 과정 목록으로 돌려보냅니다.'],
    ['올리기 취소', '교과목이 아직 없는 1단계 과정을 보드에서 내립니다. 그 전에 올라 있던 과정이 있으면 다시 올라옵니다.'],
    ['시연 모드', '대회용 사본은 문자·메일을 실제로 보내지 않고 \'보낸 내용 보기\'에 기록합니다(승인된 신규 등록 강사·초대 메일 등은 상한 안에서 실제 발송).'],
    ['이어짐', '점심시간을 걸쳐 이어지는 교과목에 붙는 표시입니다.'],
    ['보낸 내용 보기', '시연 모드에서 보낸(것처럼 처리한) 문자·메일 내용을 확인하는 창입니다.'],
    ['배정 도우미', '이 창입니다. 말로 교과목을 넣고 강사를 추천받아 배정합니다. AI는 해석과 근거만 드리고, 저장은 [배정]을 누르셔야 합니다.']
  ];
  var TERMS = GL.map(function(g){ return g[0]; });
  var S = { key: '', open: false, busy: false, off: false, wait: '', cands: null, slot: null, hl: null, dates: null, greeted: '' };
  var root, body, inp, sendB, ctxEl, mo;
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function blank(){ return { subj: '', d: '', s: null, e: null, hours: null, iid: '', iname: '', noInstr: false, row: null, wd: '' }; }
  function ctx(){ return A.ctx(); }
  function dl(d){ return A.md(d); }   // 예: 12/4(금)
  function pl(s, e){ return A.periodLabel(s, e); }

  /* ---------- 화면 ---------- */
  function css(){
    if (document.getElementById('cbCss')) return;
    var st = document.createElement('style'); st.id = 'cbCss';
    st.textContent = '' +
      '.cb-dr{position:fixed;top:0;right:0;bottom:0;width:384px;z-index:1600;background:#fff;box-shadow:-8px 0 24px rgba(16,24,40,.14);display:flex;flex-direction:column;transform:translateX(105%);transition:transform .22s cubic-bezier(.2,.8,.2,1);font-family:inherit}' +
      'body.cb-open .cb-dr{transform:none}' +
      '@media (min-width:1001px){body.cb-open{padding-right:384px;box-sizing:border-box}}' +
      '.cb-hd{padding:14px 14px 10px 16px;border-bottom:1px solid #E4E7EC}.cb-t{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:800;color:#101828}' +
      '.cb-t .cb-new{margin-left:auto;border:1px solid #D0D5DD;background:#fff;color:#344054;border-radius:6px;font:inherit;font-size:12px;font-weight:700;height:28px;padding:0 9px;cursor:pointer}' +
      '.cb-t .cb-x{border:none;background:none;width:34px;height:34px;border-radius:8px;font-size:20px;color:#667085;cursor:pointer}.cb-t .cb-x:hover{background:#F2F4F7}' +
      '.cb-ctx{margin-top:5px;font-size:12.5px;color:#475467;line-height:1.45}.cb-ctx b{color:#1B3A5F}' +
      '.cb-body{flex:1;overflow:auto;padding:14px 12px 8px;background:#F7F9FC;display:flex;flex-direction:column;gap:10px}' +
      '.cb-m{max-width:90%;font-size:13.5px;line-height:1.55;padding:9px 12px;border-radius:12px;word-break:keep-all;overflow-wrap:anywhere}' +
      '.cb-m.me{align-self:flex-end;background:#1B3A5F;color:#fff;border-bottom-right-radius:4px;white-space:pre-wrap}' +
      '.cb-m.ai{align-self:flex-start;background:#fff;color:#101828;border:1px solid #E4E7EC;border-bottom-left-radius:4px}' +
      '.cb-m.ai ol{margin:6px 0 4px;padding-left:20px}.cb-m.ai li{margin:2px 0}.cb-m.ai .cb-here{color:#B54708;font-weight:800}' +
      '.cb-m.note{align-self:center;background:#ECFDF3;color:#05603A;border:1px solid #ABEFC6;font-size:12.5px;font-weight:700;padding:5px 10px;border-radius:999px}' +
      '.cb-m.err{align-self:flex-start;background:#FEF3F2;color:#912018;border:1px solid #FECDCA}' +
      '.cb-src{display:block;margin-top:6px;font-size:11px;color:#98A2B3}' +
      '.cb-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}' +
      '.cb-chip{border:1px solid #B9CCE4;background:#F3F8FE;color:#1B3A5F;border-radius:999px;padding:5px 11px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;transition:background-color .15s ease-out}' +
      '.cb-chip:hover{background:#E3EEFA}.cb-chip:disabled{opacity:.5;cursor:default}' +
      '.cb-cand{display:flex;align-items:flex-start;gap:8px;border:1px solid #E4E7EC;border-radius:10px;padding:8px 10px;margin-top:6px;background:#fff}' +
      '.cb-cand .no{flex:none;width:22px;height:22px;border-radius:50%;background:#1B3A5F;color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px}' +
      '.cb-cand .nm{font-weight:800;font-size:13.5px}.cb-cand .og{font-size:11.5px;color:#667085;font-weight:600;margin-left:3px}.cb-cand .rk{font-size:12px;color:#B54708;font-weight:800;margin-left:4px}.cb-cand .rk.n{color:#475467}' +
      '.cb-cand .why{font-size:12px;color:#475467;margin-top:2px;line-height:1.45}.cb-cand .tg{display:inline-block;font-size:10.5px;font-weight:800;border:1px solid #B8C4D6;color:#1B3A5F;border-radius:4px;padding:0 4px;margin-right:4px}' +
      '.cb-cand .pk{margin-left:auto;flex:none;height:28px;border:1px solid #1B3A5F;background:#fff;color:#1B3A5F;border-radius:6px;font:inherit;font-size:12px;font-weight:800;padding:0 9px;cursor:pointer}.cb-cand .pk:hover{background:#EEF4FB}' +
      '.cb-conf{align-self:stretch;border:1.5px solid #1B3A5F;border-radius:12px;background:#fff;padding:10px 12px}.cb-conf .h{font-size:12.5px;font-weight:800;color:#1B3A5F;margin-bottom:6px}' +
      '.cb-conf table{width:100%;font-size:13px;border-collapse:collapse}.cb-conf td{padding:4px 0;vertical-align:top;border-top:1px solid #F2F4F7}.cb-conf tr:first-child td{border-top:none}.cb-conf td:first-child{color:#667085;width:58px}' +
      '.cb-conf .ok{color:#067647}.cb-conf .acts{display:flex;gap:8px;margin-top:10px}.cb-conf .acts button{flex:1;height:38px;border-radius:8px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer}' +
      '.cb-conf .go{background:#1B3A5F;color:#fff;border:1px solid #1B3A5F}.cb-conf .go:hover{background:#17304F}.cb-conf .ed{background:#fff;border:1px solid #D0D5DD;color:#344054}' +
      '.cb-conf.done{opacity:.6}.cb-conf.done .acts{display:none}' +
      '.cb-typing{align-self:flex-start;display:flex;gap:4px;padding:10px 12px;background:#fff;border:1px solid #E4E7EC;border-radius:12px}.cb-typing i{width:6px;height:6px;border-radius:50%;background:#98A2B3;animation:cbDot 1s infinite}.cb-typing i:nth-child(2){animation-delay:.15s}.cb-typing i:nth-child(3){animation-delay:.3s}' +
      '@keyframes cbDot{0%,80%,100%{opacity:.3;transform:none}40%{opacity:1;transform:translateY(-3px)}}' +
      '.cb-ft{border-top:1px solid #E4E7EC;padding:10px 12px 12px;background:#fff}.cb-in{display:flex;gap:8px}' +
      '.cb-in textarea{flex:1;min-height:40px;max-height:96px;resize:none;border:1px solid #D0D5DD;border-radius:8px;padding:9px 10px;font:inherit;font-size:13.5px;line-height:1.4}' +
      '.cb-in textarea:focus{outline:2px solid #2F6FB2;outline-offset:-1px;border-color:#2F6FB2}' +
      '.cb-in button{flex:none;height:40px;padding:0 14px;border:none;border-radius:8px;background:#1B3A5F;color:#fff;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;align-self:flex-end}.cb-in button:disabled{background:#98A2B3;cursor:default}' +
      '.cb-hint{font-size:11.5px;color:#667085;margin-top:6px;line-height:1.4}' +
      '#sGridWrap td.cb-hl{box-shadow:inset 0 0 0 3px #2F6FB2;background:#E8F1FB !important;animation:cbPulse 1.4s ease-in-out infinite}' +
      '@keyframes cbPulse{50%{background:#CFE2F7}}' +
      '@media (max-width:1000px){.cb-dr{width:384px;max-width:100%}}' +
      '@media (max-width:600px){.cb-dr{top:auto;width:100%;height:86vh;border-radius:16px 16px 0 0;transform:translateY(105%)}body.cb-open .cb-dr{transform:none}}' +
      '@media (prefers-reduced-motion:reduce){.cb-dr{transition:none}#sGridWrap td.cb-hl{animation:none}.cb-typing i{animation:none}}' +
      '@media print{.cb-dr{display:none !important}}';
    document.head.appendChild(st);
  }
  function build(){
    if (root) return;
    css();
    root = document.createElement('aside'); root.className = 'cb-dr'; root.setAttribute('aria-label', 'AI 배정 도우미');
    root.innerHTML = '<div class="cb-hd"><div class="cb-t"><span class="ai-badge">AI</span>배정 도우미<button type="button" class="cb-new" title="대화를 지우고 새로 시작합니다">새 대화</button><button type="button" class="cb-x" aria-label="도우미 닫기">×</button></div><div class="cb-ctx"></div></div>' +
      '<div class="cb-body" role="log" aria-live="polite"></div>' +
      '<div class="cb-ft"><div class="cb-in"><textarea rows="1" placeholder="예: 금요일 1~3교시 청렴교육 강사 추천해줘" aria-label="도우미에게 보낼 말"></textarea><button type="button">보내기</button></div><div class="cb-hint">AI는 참고용 후보와 안내를 드립니다. 배정은 확인 카드의 [배정]을 눌러야 저장됩니다.</div></div>';
    document.body.appendChild(root);
    body = root.querySelector('.cb-body'); inp = root.querySelector('textarea'); sendB = root.querySelector('.cb-in button'); ctxEl = root.querySelector('.cb-ctx');
    root.querySelector('.cb-x').addEventListener('click', function(){ close(); });
    root.querySelector('.cb-new').addEventListener('click', function(){ reset(true); });
    sendB.addEventListener('click', function(){ send(); });
    inp.addEventListener('keydown', function(ev){ if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); send(); } });
    inp.addEventListener('input', function(){ inp.style.height = 'auto'; inp.style.height = Math.min(96, inp.scrollHeight) + 'px'; });
    root.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') close(); });
    body.addEventListener('click', onBodyClick);
    var gw = document.getElementById('sGridWrap');
    if (gw && window.MutationObserver) { mo = new MutationObserver(function(){ reHl(); }); mo.observe(gw, { childList: true }); }
  }
  function scroll(){ body.scrollTop = body.scrollHeight; }
  function add(cls, html){ var d = document.createElement('div'); d.className = 'cb-m ' + cls; d.innerHTML = html; body.appendChild(d); scroll(); return d; }
  function me(t){ var d = document.createElement('div'); d.className = 'cb-m me'; d.textContent = t; body.appendChild(d); scroll(); }
  function chips(list){
    if (!list || !list.length) return '';
    return '<div class="cb-chips">' + list.map(function(c, i){ CH[CH.length] = c; return '<button type="button" class="cb-chip" data-cbc="' + (CH.length - 1) + '">' + esc(c.t) + '</button>'; }).join('') + '</div>';
  }
  var CH = [];
  function say(html, chipList, src){ return add('ai', html + chips(chipList) + (src ? '<span class="cb-src">' + esc(src) + '</span>' : '')); }
  function typing(on){
    var t = body.querySelector('.cb-typing');
    if (on && !t) { t = document.createElement('div'); t.className = 'cb-typing'; t.innerHTML = '<i></i><i></i><i></i>'; body.appendChild(t); scroll(); }
    if (!on && t) t.remove();
  }
  function setBusy(b){ S.busy = b; sendB.disabled = b || S.off; typing(b); }
  function renderCtx(){
    var c = ctx(); if (!c) { ctxEl.textContent = ''; return; }
    var st = c.stage, steps = c.steps;
    var tail = st.lane === 1 ? (st.n ? '빈 교시 ' + st.gap + '칸' : '교과목 없음') : st.lane === 2 ? '강사 미지정 ' + st.empty + '칸' : st.lane === 3 ? '배정 완료' : '최종 확인·발송';
    ctxEl.innerHTML = '<b>' + esc(c.label) + '</b> · 지금 <b>' + st.lane + '단계 ' + esc(steps[st.lane - 1].t) + '</b> · ' + esc(tail);
  }

  /* ---------- 열기·닫기 ---------- */
  function open(){
    build();
    var c = ctx(); if (!c) return;
    if (S.key !== c.key) reset(false);
    document.body.classList.add('cb-open'); S.open = true;
    renderCtx();
    if (S.greeted !== c.key) greet();
    setTimeout(function(){ inp.focus(); }, 230);
    A.instrReady();   // 강사 목록을 미리 불러 둠
  }
  function close(){
    if (!root) return;
    document.body.classList.remove('cb-open'); S.open = false; clearHl();
    var f = document.getElementById('cbFab'); if (f) f.focus();
  }
  function reset(greetNow){
    CH = []; S.wait = ''; S.cands = null; S.slot = blank(); S.dates = null; clearHl();
    var c = ctx(); S.key = c ? c.key : '';
    if (body) body.innerHTML = '';
    S.greeted = '';
    if (greetNow && c) { renderCtx(); greet(); }
  }
  function greet(){
    var c = ctx(); S.greeted = c.key;
    var g = '안녕하세요. <b>' + esc(c.label) + '</b>의 교과목 편성과 강사 배정을 말로 도와 드립니다.';
    if (c.viewer) g += '<br>조회 전용 계정이라 배정은 할 수 없고, 사용법과 다음 단계 안내만 드립니다.';
    else if (c.ended) g += '<br>교육이 끝난 과정이라 편성은 바꿀 수 없습니다. 사용법 안내만 드립니다.';
    else g += '<br>예: <b>"금요일 1~3교시 청렴교육 강사 추천해줘"</b>';
    say(g, [{ t: '처음인데 어떻게 해요?', a: { intent: 'help_start' } }, { t: '앞으로 할 일', a: { intent: 'help_next' } }, { t: '교과목 넣기', a: { intent: 'assign' } }, { t: '강사 추천받기', a: { intent: 'recommend' } }]);
  }
  function note(t){ if (!root || !S.open) return; add('note', esc(t)); renderCtx(); }
  function ctxChanged(key){
    if (!root) return;
    if (!key) { close(); return; }
    if (key !== S.key) { var was = S.open; reset(false); if (was) { renderCtx(); add('note', '과정이 바뀌어 새 대화를 시작합니다'); greet(); } }
    else if (S.open) renderCtx();
  }

  /* ---------- 칸 강조 ---------- */
  function setHl(d, s, e){ S.hl = d ? { d: d, s: s, e: e } : null; return d ? A.highlight(d, s, e) : 0; }
  function reHl(){
    if (!S.hl) return;
    for (var q = S.hl.s; q <= S.hl.e; q++) { var td = document.querySelector('#sGridWrap td[data-new="' + S.hl.d + '|' + q + '"]'); if (td && !td.classList.contains('cb-hl')) td.classList.add('cb-hl'); }
  }
  function clearHl(){ S.hl = null; document.querySelectorAll('.cb-hl').forEach(function(x){ x.classList.remove('cb-hl'); }); }

  /* ---------- 규칙 해석(AI가 응답하지 않을 때·짧은 답) ---------- */
  function ruleParse(t){
    var c = ctx(), o = { intent: 'other', weekday: '', date: '', start: null, end: null, hours: null, allday: false, half: '', subject: '', pick: null, term: '' };
    var w = /([월화수목금토일])\s*요일/.exec(t) || /(^|\s)([월화수목금토일])(?=\s|$)/.exec(t); if (w) o.weekday = w[2] || w[1];
    var m = /(\d{1,2})\s*[\/.월]\s*(\d{1,2})\s*일?/.exec(t);
    if (m && c) { var hit = c.days.filter(function(x){ return +x.d.slice(5, 7) === +m[1] && +x.d.slice(8, 10) === +m[2]; })[0]; if (hit) o.date = hit.d; }
    var rg = /(\d{1,2})\s*(?:교시)?\s*(?:~|-|부터|에서)\s*(\d{1,2})\s*교시/.exec(t), hr = /(\d{1,2})\s*시간/.exec(t), one = /(\d{1,2})\s*교시/.exec(t);
    if (rg) { o.start = +rg[1]; o.end = +rg[2]; } else if (one) { o.start = +one[1]; if (!hr) o.end = +one[1]; }
    if (hr) o.hours = +hr[1];
    if (/하루\s*(전체|종일|다)|종일|온종일|하루\s*내내/.test(t)) o.allday = true;
    if (/오전/.test(t)) o.half = '오전'; else if (/오후/.test(t)) o.half = '오후';
    var pk = /(^|\s)(\d)\s*번/.exec(t) || /^\s*(\d)\s*$/.exec(t); if (pk) o.pick = +(pk[2] || pk[1]);
    o.term = TERMS.filter(function(x){ return t.replace(/\s/g, '').indexOf(x.replace(/\s/g, '')) > -1; })[0] || '';
    if (/처음|어떻게\s*(써|사용)|사용법/.test(t) && !/다음|앞으로|해야/.test(t)) o.intent = 'help_start';
    else if (/다음\s*(단계|할\s*일|에\s*뭐)|이제\s*뭐|뭐\s*하면|앞으로|해야\s*(할|하는|될)\s*(일|것)|뭘\s*해야|무엇을\s*해야/.test(t)) o.intent = 'help_next';
    else if (o.term && /뭐|무엇|뜻|뭔|설명|란\??$|이란/.test(t)) o.intent = 'explain';
    else if (/^(취소|그만|처음부터|다시)/.test(t.trim())) o.intent = 'cancel';
    else if (/강사\s*없이|교과목만|강사는\s*나중/.test(t)) o.intent = 'subject_only';
    else if (/추천|찾아|후보|누가\s*좋/.test(t)) o.intent = 'recommend';
    else if (o.pick && t.length <= 10) o.intent = 'pick';
    else if (/^(네|예|응|좋아|좋습니다|그래|확인|배정해|ㅇㅇ)/.test(t.trim())) o.intent = 'confirm';
    else if (/배정|넣어|채워|편성해/.test(t)) o.intent = 'assign';
    else if (o.start || o.weekday || o.date || o.allday || o.half) o.intent = 'time';
    var sj = t.replace(/\d{1,2}\s*(?:교시)?\s*(?:~|-|부터|에서)\s*\d{1,2}\s*교시(?:까지)?|교과목만|과목만|([월화수목금토일])\s*요일|\d{1,2}\s*[\/.월]\s*\d{1,2}\s*일?|\d{1,2}\s*교시|\d{1,2}\s*시간|부터|까지|에서|[~\-]|하루\s*(전체|종일|다)|종일|오전|오후|(^|\s)\d\s*번/g, ' ')
      .replace(/(관련|관한|에\s*맞는|맞는|할|하는)?\s*(강사|교수|선생님)(님)?(을|를|로|으로|가|이)?/g, ' ')
      .replace(/(추천|찾아|배정|넣어|채워|편성)[가-힣]*|해\s*줘|해\s*주세요|주세요|줘|교과목(을|를|은|로)?|과목(을|를)?|좀|그리고/g, ' ')
      .replace(/(^|\s)(에|에서|을|를|은|는|이|가|로|으로|의|도|만|\d+)(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
    if (sj && sj.length <= 24 && /[가-힣A-Za-z]{2,}/.test(sj) && ['recommend', 'assign', 'subject_only', 'time', 'other'].indexOf(o.intent) > -1 && !/^(네|예|응)$/.test(sj)) o.subject = sj;
    return o;
  }
  function quick(t){   // 짧은 답은 AI 없이 바로 처리(호출 절약)
    var tt = t.trim();
    if (S.wait === 'pick' && /^\d\s*번?(으로|이요|요)?$/.test(tt)) return true;
    if (S.wait === 'confirm' && /^(네|예|응|좋아|좋습니다|배정|배정해|확인|취소|아니|아니요)/.test(tt) && tt.length <= 8) return true;
    if (/^(취소|그만|새로|처음부터)$/.test(tt)) return true;
    return false;
  }

  /* ---------- 보내기 ---------- */
  function send(){
    var t = inp.value.trim(); if (!t || S.busy || S.off) return;
    inp.value = ''; inp.style.height = 'auto';
    me(t);
    var c = ctx(); if (!c) return;
    if (quick(t)) { act(ruleParse(t), t, ''); return; }
    var hk = howTopic(t); if (hk) { howTo(hk, ''); return; }
    var R0 = ruleParse(t); if (R0.intent === 'help_start' || R0.intent === 'help_next' || (R0.intent === 'explain' && R0.term)) { act(R0, t, ''); return; }   // 사용법·할 일·용어 질문은 화면 정보로 바로 답함   // d4b: "~하려면?" 같은 방법 질문·도우미가 대신 못 하는 일은 절차 안내
    setBusy(true);
    var timer, done = false;
    var fin = function(I, src){ if (done) return; done = true; clearTimeout(timer); setBusy(false); act(I, t, src); };
    timer = setTimeout(function(){ fin(ruleParse(t), '규칙 해석(AI 응답 지연)'); }, 20000);
    A.parse(t, { 날짜: c.days.map(function(x){ return { d: x.d, w: x.w }; }), 교시: c.cls, 오전: c.am, 오후: c.pm, 용어: TERMS, 후보수: S.cands ? Math.min(S.cands.length, 5) : 0, 대기: S.wait }).then(function(j){
      if (j && j.꺼짐) { S.off = true; done = true; clearTimeout(timer); setBusy(false); say('도우미가 꺼져 있습니다(관리자 설정). 화면의 버튼으로 편성해 주세요.'); sendB.disabled = true; return; }
      if (j && j.status === 'ok' && j.ai && j.해석) fin(fixAi(j.해석, t), 'AI 해석 · ' + (j.모델 || '') + (j.모델번호 ? '(' + j.모델번호 + '번)' : ''));
      else fin(ruleParse(t), '규칙 해석' + (j && j.이유 ? '(' + j.이유 + ')' : ''));
    }).catch(function(){ fin(ruleParse(t), '규칙 해석(서버 연결 실패)'); });
  }
  function fixAi(I, t){   // AI 결과를 규칙 결과로 보완(빠뜨린 값만)
    var R = ruleParse(t);
    ['weekday', 'date', 'start', 'end', 'hours', 'half', 'pick', 'term'].forEach(function(k){ if ((I[k] === null || I[k] === '' || I[k] === undefined) && R[k] !== null && R[k] !== '') I[k] = R[k]; });
    if (!I.allday && R.allday) I.allday = true;
    if (!I.subject && R.subject && ['recommend', 'assign', 'subject_only', 'time'].indexOf(I.intent) > -1) I.subject = R.subject;
    return I;
  }
  function onBodyClick(ev){
    var b = ev.target.closest ? ev.target.closest('button') : null; if (!b) return;
    var ci = b.getAttribute('data-cbc');
    if (ci != null) {
      var c = CH[Number(ci)]; if (!c || S.busy) return;
      b.parentNode.querySelectorAll('.cb-chip').forEach(function(x){ x.disabled = true; });
      me(c.t);
      if (c.fn) { c.fn(); return; }
      act(Object.assign({ intent: 'other', weekday: '', date: '', start: null, end: null, hours: null, allday: false, half: '', subject: '', pick: null, term: '' }, c.a), c.t, '');
      return;
    }
    var pk = b.getAttribute('data-cbpick');
    if (pk != null && S.cands && !S.busy) { me((Number(pk) + 1) + '번'); pickCand(Number(pk)); return; }
    if (b.getAttribute('data-cbgo')) { confirmSave(b); return; }
    if (b.getAttribute('data-cbed')) { b.closest('.cb-conf').classList.add('done'); clearHl(); say('어느 것을 고칠까요?', [{ t: '일시', fn: function(){ S.slot.d = ''; S.slot.s = S.slot.e = null; S.slot.row = null; advance(); } }, { t: '교과목', fn: function(){ S.slot.subj = ''; S.slot.row = null; S.wait = 'subject'; say('교과목 이름을 알려 주세요.'); } }, { t: '강사', fn: function(){ S.slot.iid = ''; S.slot.noInstr = false; S.cands = null; advance(); } }, { t: '처음부터', a: { intent: 'cancel' } }]); }
  }

  /* ---------- 대화 진행 ---------- */
  function badSubj(x){ return !x || x.length > 24 || /[?？]|려면|어떻게|방법|나머지|전체|하나요|되나요|돼요|할까|해야|뭐예요|무엇/.test(x); }
  function act(I, raw, src){
    var c = ctx(); if (!c) return;
    if (I.subject && badSubj(I.subject)) I.subject = '';   // d4b
    if (I.intent === 'other' && S.wait !== 'subject') I.subject = '';   // 교과목을 묻는 중이 아니면 알 수 없는 문장을 교과목으로 쓰지 않음
    if (!S.slot) S.slot = blank();
    var sl = S.slot;
    switch (I.intent) {
      case 'help_start': return helpStart(src);
      case 'help_next': return helpNext(src);
      case 'explain': return explain(I.term, raw, src);
      case 'cancel': S.slot = blank(); S.cands = null; S.wait = ''; clearHl(); return say('처음부터 다시 하겠습니다. 무엇을 도와 드릴까요?', [{ t: '교과목 넣기', a: { intent: 'assign' } }, { t: '강사 추천받기', a: { intent: 'recommend' } }], src);
    }
    if (c.viewer) return say('조회 전용 계정은 배정할 수 없습니다. 사용법이나 다음 단계는 안내해 드릴 수 있습니다.', [{ t: '앞으로 할 일', a: { intent: 'help_next' } }], src);
    if (c.ended || c.cancelled) return say((c.ended ? '교육이 끝난 과정' : '취소된 기수') + '이라 편성을 바꿀 수 없습니다.', null, src);
    if (I.intent === 'confirm' && S.wait === 'confirm') { var gb = body.querySelector('.cb-conf:not(.done) [data-cbgo]'); if (gb) return confirmSave(gb); }
    if (/^(아니|아니요|취소)/.test(String(raw || '').trim()) && S.wait === 'confirm') { var cf = body.querySelector('.cb-conf:not(.done)'); if (cf) cf.classList.add('done'); clearHl(); S.wait = ''; return say('배정하지 않았습니다. 고칠 것을 말씀해 주세요.', null, src); }
    // 다른 교과목으로 새로 요청하면 이전 값(일시·강사)을 비우고 새로 시작
    if (I.subject && sl.subj && norm(I.subject) !== norm(sl.subj) && ['recommend', 'assign', 'subject_only'].indexOf(I.intent) > -1) {
      var pc = body.querySelector('.cb-conf:not(.done)'); if (pc) pc.classList.add('done');
      clearHl(); S.slot = blank(); S.cands = null; S.wait = ''; sl = S.slot;
    } else if (S.wait === 'confirm' && ['recommend', 'assign', 'subject_only'].indexOf(I.intent) > -1 && (I.start != null || I.weekday || I.date || I.allday)) {
      var pc2 = body.querySelector('.cb-conf:not(.done)'); if (pc2) pc2.classList.add('done');
      clearHl(); var keep = sl.subj; S.slot = blank(); S.slot.subj = keep; S.cands = null; S.wait = ''; sl = S.slot;
    }
    // 값 반영
    var nm = S.cands && S.cands.length ? S.cands.map(function(x, i){ return { i: i, n: x.name }; }).filter(function(x){ return raw && raw.indexOf(x.n) > -1; })[0] : null;
    if (I.subject && !(S.wait === 'pick' && (I.pick || nm))) { if (I.subject !== sl.subj) { sl.subj = I.subject; sl.row = null; if (sl.iid && S.cands) { sl.iid = ''; } S.cands = null; } }
    if (I.intent === 'subject_only') { sl.noInstr = true; sl.iid = ''; }
    var tchg = applyTime(I, src); if (tchg === false) return;
    if ((I.intent === 'pick' || S.wait === 'pick' || I.pick) && S.cands && (I.pick || nm)) {
      var idx = nm ? nm.i : I.pick - 1;
      if (S.cands[idx]) { sl.iid = S.cands[idx].id; sl.iname = S.cands[idx].name; sl.noInstr = false; }
    }
    if (I.intent === 'recommend') { sl.iid = ''; sl.noInstr = false; return advance(src, true); }
    if (I.intent === 'other' && !I.subject && tchg !== true && !sl.iid) return say('말씀을 정확히 알아듣지 못했습니다.<br>' + situation() + '<br>이렇게 말씀해 보세요.<br>· 교과목 넣기: "금요일 1~3교시 청렴교육 강사 추천해줘"<br>· 방법 묻기: "남은 빈 교시를 지난 기수로 채우려면?"<br>· 할 일 묻기: "앞으로 뭘 해야 해요?"', [{ t: '앞으로 할 일', a: { intent: 'help_next' } }, { t: '처음인데 어떻게 해요?', a: { intent: 'help_start' } }], src);
    advance(src, false);
  }
  // 시간 반영: true=바뀜, null=변화 없음, false=되물음(멈춤)
  function applyTime(I, src){
    var c = ctx(), sl = S.slot, chg = null;
    var future = c.days.filter(function(x){ return x.d >= c.today; });
    if (I.date) { if (future.some(function(x){ return x.d === I.date; })) { sl.d = I.date; chg = true; } else { say(dl(I.date) + '은(는) 이미 지난 날짜라 편성할 수 없습니다.', null, src); return false; } }
    else if (I.weekday) {
      var ds = future.filter(function(x){ return x.w === I.weekday; });
      if (!ds.length) { var all = c.days.map(function(x){ return x.w; }).filter(function(w, i, a){ return a.indexOf(w) === i; }).join('·'); say(c.days.some(function(x){ return x.w === I.weekday; }) ? '이 과정의 ' + I.weekday + '요일은 이미 지났습니다.' : '이 과정은 ' + all + '요일에 진행합니다. 다른 요일을 알려 주세요.', null, src); return false; }
      if (ds.length > 1 && !(sl.d && ds.some(function(x){ return x.d === sl.d; }))) { S.dates = ds; sl.wd = I.weekday; keepTime(I); S.wait = 'date'; say(I.weekday + '요일이 ' + ds.length + '번 있습니다. 언제인가요?', ds.map(function(x){ return { t: x.md + '(' + x.w + ')', a: { intent: 'time', date: x.d } }; }), src); return false; }
      if (ds.length === 1) { sl.d = ds[0].d; chg = true; }
    }
    if (keepTime(I)) chg = true;
    return chg;
  }
  function keepTime(I){
    var c = ctx(), sl = S.slot, chg = false, cls = c.cls;
    if (I.allday) { sl.s = cls[0]; sl.e = cls[cls.length - 1]; sl.hours = null; return true; }
    if (I.half) { var h = I.half === '오전' ? c.am : c.pm; if (h.length) { if (I.start == null) { sl.s = h[0]; sl.e = h[h.length - 1]; if (I.hours) sl.e = Math.min(h[h.length - 1], h[0] + I.hours - 1); chg = true; } } }
    if (I.start != null) {
      sl.s = I.start;
      if (I.end != null) sl.e = I.end; else if (I.hours) sl.e = I.start + I.hours - 1; else sl.e = I.start;
      sl.hours = null; chg = true;
    } else if (I.hours && !I.half) { sl.hours = I.hours; if (sl.s != null) sl.e = sl.s + I.hours - 1; chg = true; }
    return chg;
  }
  function advance(src, forceRec){
    var c = ctx(), sl = S.slot;
    // 칸에 강사 없는 기존 교과목이 있으면 그 교과목에 강사를 배정
    if (sl.d && sl.s != null && sl.e != null && !sl.row) {
      var rows = A.rows(sl.d).filter(function(r){ return r.s <= sl.e && sl.s <= r.e; });
      if (rows.length === 1 && !rows[0].iid && !rows[0].iname && (!sl.subj || norm(sl.subj) === norm(rows[0].subj))) { sl.row = rows[0]; sl.subj = rows[0].subj; sl.s = rows[0].s; sl.e = rows[0].e; }
    }
    if (!sl.subj) { S.wait = 'subject'; var ex = sl.d ? dl(sl.d) + (sl.s != null ? ' ' + pl(sl.s, sl.e) : '') + '에 ' : ''; return say(ex + '어떤 교과목인가요? 교과목 이름을 알려 주세요.' + (forceRec ? '<br>교과목에 맞는 강사를 찾아 드립니다.' : ''), null, src); }
    if (!sl.iid && !sl.noInstr && (forceRec || !S.cands)) {
      var slot = sl.d && sl.s != null && sl.e != null ? { d: sl.d, s: sl.s, e: sl.e } : null;
      if (slot) { var bad = slotProblem(); if (bad) return bad(); setHl(slot.d, slot.s, slot.e); }
      return recommend(slot, src);
    }
    if (!sl.iid && !sl.noInstr && S.cands && !S.cands.length) { S.wait = ''; return say('<b>' + esc(sl.subj) + '</b>에 맞는 강사 후보가 없습니다. 교과목만 먼저 넣고 강사는 나중에 배정할까요?', [{ t: '교과목만 넣기', a: { intent: 'subject_only' } }, { t: '다른 교과목으로', fn: function(){ S.slot = blank(); S.cands = null; S.wait = 'subject'; say('교과목 이름을 알려 주세요.'); } }], src); }
    if (!sl.iid && !sl.noInstr && S.cands) { S.wait = 'pick'; return say('배정할 강사 번호를 골라 주세요. 강사 없이 교과목만 넣으려면 "교과목만"이라고 말씀해 주세요.', candChips(), src); }
    if (!sl.d || sl.s == null || sl.e == null) return askTime(src);
    var pb = slotProblem(); if (pb) return pb();
    confirmCard(src);
  }
  function norm(s){ return String(s || '').replace(/\s+/g, ''); }
  function askTime(src){
    var c = ctx(), sl = S.slot, fr = A.free();
    if (sl.d) fr = fr.filter(function(r){ return r.d === sl.d; });
    var want = sl.hours || 0, opts = [];
    fr.forEach(function(r){
      var len = r.e - r.s + 1;
      if (want) { if (len >= want) opts.push({ d: r.d, s: r.s, e: r.s + want - 1 }); }
      else { opts.push({ d: r.d, s: r.s, e: r.e, full: r.full }); }
    });
    opts = opts.slice(0, 5);
    S.wait = 'time';
    var who = sl.iid ? sl.iname + ' 강사를 ' : sl.noInstr ? '교과목만 ' : '';
    if (!opts.length) return say((sl.d ? dl(sl.d) + '에는 ' : '') + '비어 있는 ' + (want ? want + '시간짜리 ' : '') + '시간이 없습니다. 다른 날짜를 말씀해 주세요.', null, src);
    say(who + '언제 배정할까요? 비어 있는 시간입니다.' + (want ? '' : '<br>예: "월요일 2교시부터 2시간", "수요일 하루 전체"'), opts.map(function(o){ return { t: dl(o.d) + ' ' + (o.full ? '하루 전체' : pl(o.s, o.e)), a: { intent: 'time', date: o.d, start: o.s, end: o.e } }; }), src);
  }
  function slotProblem(){
    var c = ctx(), sl = S.slot, cls = c.cls;
    if (cls.indexOf(sl.s) < 0 || cls.indexOf(sl.e) < 0 || sl.e < sl.s) { var s0 = sl.s, e0 = sl.e; sl.s = sl.e = null; return function(){ S.wait = 'time'; say(pl(s0, e0) + '은(는) 이 과정의 수업 교시(' + cls[0] + '~' + cls[cls.length - 1] + '교시)를 벗어납니다. 다시 알려 주세요.'); }; }
    if (sl.row) return null;
    var occ = A.occ(sl.d), hit = [];
    for (var q = sl.s; q <= sl.e; q++) if (occ[q]) hit.push(q + '교시 ' + occ[q]);
    if (hit.length) {
      var d = sl.d, fr = A.free().filter(function(r){ return r.d === d; });
      return function(){ S.wait = 'time'; sl.s = sl.e = null; say(dl(d) + ' ' + esc(hit.join(', ')) + '이(가) 이미 있습니다. 비어 있는 시간을 골라 주세요.', fr.slice(0, 4).map(function(r){ return { t: dl(r.d) + ' ' + pl(r.s, r.e), a: { intent: 'time', date: r.d, start: r.s, end: r.e } }; }).concat([{ t: '다른 날짜', fn: function(){ S.slot.d = ''; askTime(); } }])); };
    }
    return null;
  }
  function recommend(slot, src){
    var sl = S.slot;
    setBusy(true);
    A.cands(sl.subj, slot).then(function(g){
      setBusy(false);
      var list = g.main.slice(0, 3).concat(g.fresh.slice(0, Math.max(0, 3 - Math.min(3, g.main.length)) || (g.fresh.length ? 1 : 0)));
      var seen = {}; list = list.filter(function(x){ if (seen[x.id]) return false; seen[x.id] = 1; return true; }).slice(0, 4);
      S.cands = list;
      var when = slot ? dl(slot.d) + ' ' + pl(slot.s, slot.e) + ' · ' : '';
      var srcTxt = g.ai ? 'AI 근거 · ' + g.model + (g.slotNo ? '(' + g.slotNo + '번)' : '') + ' · ' + (g.ms / 1000).toFixed(1) + '초' : (g.note || '규칙 결과');
      if (!list.length) {
        S.wait = '';
        var why = g.ex.length ? '<br>관련 강사 ' + g.ex.length + '명은 ' + esc(g.ex.slice(0, 2).map(function(x){ return x.name + '(' + x.why[0] + ')'; }).join(', ')) + (g.ex.length > 2 ? ' 등' : '') + ' 사유로 제외했습니다.' : '';
        return say('<b>' + esc(when + sl.subj) + '</b>에 맞는 강사를 찾지 못했습니다.' + why + '<br>다른 시간으로 찾거나, 교과목만 먼저 넣을 수 있습니다.', [{ t: '다른 시간으로', fn: function(){ S.slot.d = ''; S.slot.s = S.slot.e = null; clearHl(); askTime(); } }, { t: '교과목만 넣기', a: { intent: 'subject_only' } }], srcTxt);
      }
      var h = '<b>' + esc(when + sl.subj) + '</b>에 맞는 참고용 후보입니다.' + list.map(function(x, i){
        var rk = x.rank === null ? '<span class="rk n">' + (x.evN ? '평가 자료 부족' : '신규') + '</span>' : '<span class="rk">★' + x.rank.toFixed(1) + '</span>';
        var tag = x.h ? '<span class="tg">같은 교과목 ' + x.h + '회</span>' : x.listed ? '<span class="tg">등록 교과목</span>' : x.rel === '비슷함' ? '<span class="tg">비슷한 교과목(AI)</span>' : '';
        return '<div class="cb-cand"><span class="no">' + (i + 1) + '</span><div><span class="nm">' + esc(x.name) + '</span><span class="og">' + esc(x.org || '') + '</span>' + rk + '<div class="why">' + tag + esc(x.reason || '') + '</div></div><button type="button" class="pk" data-cbpick="' + i + '">선택</button></div>';
      }).join('') + (g.ex.length ? '<div class="cb-src" style="font-size:11.5px;color:#667085;">일정이 겹치거나 불가 일정인 강사 ' + g.ex.length + '명은 뺐습니다.</div>' : '') +
        '<div style="margin-top:6px;">' + (slot ? '이 중 한 분을 배정할까요?' : '이 중 한 분을 고르시면 시간을 여쭙겠습니다.') + '</div>';
      S.wait = 'pick';
      say(h, candChips(), srcTxt);
    }).catch(function(){ setBusy(false); add('err', '후보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'); });
  }
  function candChips(){ return (S.cands || []).slice(0, 4).map(function(x, i){ return { t: (i + 1) + '번 ' + x.name, fn: function(){ pickCand(i); } }; }).concat([{ t: '교과목만 넣기', a: { intent: 'subject_only' } }]); }
  function pickCand(i){
    var x = S.cands && S.cands[i]; if (!x) return;
    S.slot.iid = x.id; S.slot.iname = x.name; S.slot.noInstr = false;
    advance();
  }
  function confirmCard(src){
    var c = ctx(), sl = S.slot, n = sl.e - sl.s + 1;
    var chk = [];
    if (sl.row) chk.push('<span class="ok">기존 교과목에 강사만 배정</span>'); else chk.push('<span class="ok">빈 칸 확인</span>');
    if (sl.iid) {
      var k = A.check(sl.iid, sl.d, sl.s, sl.e);
      if (k.why.length) {
        S.slot.iid = ''; var nm = sl.iname; S.cands = null;
        return say(esc(nm) + ' 강사는 ' + esc(k.why.join(', ')) + '입니다. 이 시간에 맞는 다른 강사를 찾을까요?', [{ t: '다른 강사 찾기', a: { intent: 'recommend' } }, { t: '다른 시간', fn: function(){ S.slot.iid = ''; S.slot.d = ''; S.slot.s = S.slot.e = null; clearHl(); askTime(); } }], src);
      }
      chk.push('<span class="ok">강사 같은 시각 일정 없음</span>', '이날 이 강사 ' + (k.dayTotal + n) + '교시');
    }
    var lunch = c.am.length && c.pm.length && sl.s <= c.am[c.am.length - 1] && sl.e >= c.pm[0];
    var pr = c.periods.filter(function(p){ return p.n === sl.s; })[0], pe = c.periods.filter(function(p){ return p.n === sl.e; })[0];
    var tm = pr && pe && pr.start && pe.end ? ' (' + pr.start + '~' + pe.end + ')' : '';
    setHl(sl.row ? '' : sl.d, sl.s, sl.e);
    S.wait = 'confirm';
    var room = sl.row ? sl.row.room : c.room;
    var h = '<div class="cb-conf"><div class="h">이렇게 배정할까요?' + (sl.row ? '' : ' (시간표에 파란 칸으로 표시)') + '</div><table>' +
      '<tr><td>일시</td><td><b>' + esc(dl(sl.d) + ' ' + pl(sl.s, sl.e)) + '</b> · ' + n + '시간' + esc(tm) + (lunch ? '<br><span style="color:#667085;font-size:12px;">점심시간을 걸쳐 \'이어짐\'으로 표시됩니다</span>' : '') + '</td></tr>' +
      '<tr><td>교과목</td><td>' + esc(sl.subj) + '</td></tr>' +
      '<tr><td>강사</td><td>' + (sl.iid ? esc(sl.iname) : '<span style="color:#667085;">미지정(나중에 배정)</span>') + '</td></tr>' +
      '<tr><td>강의실</td><td>' + esc(room || '미정') + '</td></tr>' +
      '<tr><td>검사</td><td>' + chk.join(' · ') + '</td></tr></table>' +
      '<div class="acts"><button type="button" class="ed" data-cbed="1">고치기</button><button type="button" class="go" data-cbgo="1">배정</button></div></div>';
    var d = document.createElement('div'); d.innerHTML = h; var cf = d.firstChild; body.appendChild(cf);
    if (src) { var s2 = document.createElement('div'); s2.className = 'cb-src'; s2.style.alignSelf = 'flex-start'; s2.textContent = src; body.appendChild(s2); }
    var nt = document.createElement('div'); nt.className = 'cb-src'; nt.style.alignSelf = 'center'; nt.textContent = sl.iid ? '강사 안내는 4단계에서 한꺼번에 보냅니다' : '강사는 2단계에서 배정합니다';
    body.appendChild(nt); scroll();
  }
  function confirmSave(btn){
    if (S.busy || btn.disabled) return;
    var sl = S.slot, cf = btn.closest('.cb-conf');
    var o = { d: sl.d, s: sl.s, e: sl.e, subj: sl.subj, iid: sl.iid, row: sl.row };
    S.busy = true; sendB.disabled = true;
    if (window.btnBusy) window.btnBusy(btn, '저장하는 중…'); else { btn.disabled = true; btn.textContent = '저장하는 중…'; }
    cf.querySelector('.ed').disabled = true;
    A.save(o).then(function(res){
      S.busy = false; sendB.disabled = S.off;
      if (!res || res.status !== 'ok') {
        cf.classList.add('done'); clearHl();
        S.wait = '';
        return add('err', esc((res && res.message) || '저장하지 못했습니다') + chips([{ t: '최신 시간표로 다른 시간 고르기', fn: function(){ setBusy(true); A.reload().catch(function(){}).then(function(){ setBusy(false); renderCtx(); S.slot.d = ''; S.slot.s = S.slot.e = null; S.slot.row = null; askTime(); }); } }, { t: '처음부터', a: { intent: 'cancel' } }]));
      }
      if (window.btnOk) window.btnOk(btn, '배정 완료');
      setTimeout(function(){
        cf.classList.add('done'); clearHl();
        var c = ctx(); renderCtx();
        var who = o.iid ? sl.iname + ' 강사' : '강사 미지정';
        var nx = A.free().filter(function(r){ return !(r.d === o.d && r.s <= o.e && o.s <= r.e); })[0];
        var st = c.stage;
        var next = st.lane === 1 ? (st.gap ? '남은 빈 교시 ' + st.gap + '칸' : '빈 교시를 모두 채웠습니다') : st.lane === 2 ? '강사 미지정 ' + st.empty + '칸이 남았습니다' : st.lane === 3 ? '모든 칸을 채웠습니다. 화면 맨 아래 [4단계로 넘기기]를 누르면 됩니다' : '';
        var warns = (res.warnings || []).length ? '<br><span style="color:#B54708;">확인: ' + esc(res.warnings.join(' / ')) + '</span>' : '';
        var ch = [];
        if (nx) ch.push({ t: '다음 빈 시간 ' + dl(nx.d) + ' ' + pl(nx.s, nx.e) + ' 채우기', a: { intent: 'time', date: nx.d, start: nx.s, end: nx.e } });
        if (st.lane === 3) ch.push({ t: '[4단계로 넘기기] 위치 보기', fn: function(){ A.guide('[data-handoff]', '<i>4단계로 넘기기</i> — 보드 4단계에서 최종 확인하고 발송합니다'); say('화면 맨 아래 버튼을 강조했습니다.'); } });
        ch.push({ t: '앞으로 할 일', a: { intent: 'help_next' } });
        S.slot = blank(); S.cands = null; S.wait = '';
        say('배정했습니다: <b>' + esc(dl(o.d) + ' ' + pl(o.s, o.e) + ' ' + o.subj) + '</b> · ' + esc(who) + '<br>' + esc(next) + warns, ch);
        if (nx) S.slot = blank();
      }, 650);
    }).catch(function(){ S.busy = false; sendB.disabled = S.off; if (window.btnReset) window.btnReset(btn); cf.querySelector('.ed').disabled = false; add('err', '서버에 연결하지 못했습니다. 잠시 후 [배정]을 다시 눌러 주세요.'); });
  }

  /* ---------- d4b: 방법 질문("~하려면?")·할 일 안내 ---------- */
  var HOWQ = /(려면|어떻게|방법|하나요|하나\?|되나요|돼요\?|되요\?|할\s*수\s*있|어디서|어디에|어디\s*있|뭘\s*눌러|무엇을\s*눌러|\?\s*$)/;
  var DOQ = /(채워|해\s*줘|해줘|해\s*주세요|돌려|불러와|보내\s*줘|넘겨\s*줘)/;
  function guideChip(t, sel, txt){ return { t: t, fn: function(){ A.guide(sel, txt); say('화면의 버튼을 강조했습니다.'); } }; }
  function howTopic(t){
    var c = ctx(), st = c.stage, how = HOWQ.test(t), doit = DOQ.test(t);
    var T = [
      { k: 'copy', re: /지난\s*기수|지난기수|이전\s*기수|전\s*기수|작년\s*편성/, ok: how || doit },
      { k: 'batch', re: /일괄|한\s*번에\s*강사|강사.*(한꺼번에|전부|모두|다\s*채)/, ok: how || doit },
      { k: 'blank', re: /비워둠|비워\s*두|비우/, ok: how || doit },
      { k: 'move', re: /옮기|옮겨|이동\s*모드|맞바꾸|자리\s*바꾸/, ok: how || doit },
      { k: 'delete', re: /삭제|지우/, ok: how || doit },
      { k: 'handoff', re: /4\s*단계로|넘기|넘겨/, ok: how || doit },
      { k: 'send', re: /발송|안내\s*(를\s*)?보내|문자|메일/, ok: how || doit },
      { k: 'reset', re: /초기화|처음부터\s*다시/, ok: how || doit },
      { k: 'instr', re: /강사.*(바꾸|바꿔|교체|변경)/, ok: how },
      { k: 'room', re: /강의실/, ok: how },
      { k: 'add', re: /교과목.*(넣|추가|입력)|과목.*(넣|추가)/, ok: how }
    ];
    for (var i = 0; i < T.length; i++) if (T[i].re.test(t) && T[i].ok) return T[i].k;
    return '';
  }
  function situation(){
    var c = ctx(), st = c.stage, a = [];
    a.push('교과목 ' + st.n + '칸');
    if (st.lane === 1) a.push('빈 교시 ' + st.gap + '칸');
    if (st.n) a.push('강사 미지정 ' + st.empty + '칸');
    if (st.held) a.push('안내 대기 강사 ' + st.held + '명');
    return '지금 상황: <b>' + st.lane + '단계 ' + esc(c.steps[st.lane - 1].t) + '</b> · ' + esc(a.join(' · '));
  }
  function howTo(k, src){
    var c = ctx(), st = c.stage, h = '', ch = [], li = function(arr){ return '<ol>' + arr.map(function(x){ return '<li>' + x + '</li>'; }).join('') + '</ol>'; };
    if (k === 'copy') {
      if (!c.canCopy) h = '이 과정은 불러올 <b>지난 기수 편성이 없습니다.</b> 교과목은 시간표 빈 칸을 누르거나 저에게 말씀해 넣어 주세요. 예: "월요일 1~3교시 소방전술"';
      else if (!st.n) { h = '<b>지난 기수 편성 불러오기</b> 방법입니다.' + li(['시간표 위 \'편성을 시작할 방법\'에서 <b>[지난 기수 편성 불러오기]</b>를 누릅니다', '창에서 가져올 교과목·교시를 확인하고 저장합니다(날짜는 이번 기수에 맞춰 바뀝니다)', '이어서 <b>AI 강사 재검토</b> 창이 열리면 강사 유지·교체 제안을 보고 [적용]합니다']) + '그다음: 빈 교시가 없으면 2단계, 강사까지 채워지면 3단계로 넘어갑니다.'; ch.push(guideChip('버튼 위치 보기', '#sEmpty [data-cp]', '<i>지난 기수 편성 불러오기</i>')); }
      else if (!st.gap) h = '빈 교시가 없어 지난 기수로 채울 칸이 없습니다. 지금은 ' + (st.empty ? '강사 미지정 ' + st.empty + '칸에 강사를 배정할 차례입니다.' : '다음 단계로 넘어갈 차례입니다.');
      else { h = '남은 <b>빈 교시 ' + st.gap + '칸</b>을 지난 기수로 채우는 방법입니다. 이미 넣은 교과목은 그대로 둡니다.' + li(['시간표 바로 위 파란 줄의 <b>[지난 기수로 빈 교시 채우기]</b>를 누릅니다', '창에서 채울 줄을 확인합니다(이미 편성된 교시와 겹치는 줄은 \'제외\'로 표시)', '<b>[n줄로 빈 교시 채우기]</b>를 누르면 저장되고, <b>AI 강사 재검토</b> 창에서 강사 유지·교체를 확인해 [적용]합니다']) + '이 작업은 확인 창이 필요해 제가 대신 누르지 않습니다.'; ch.push(guideChip('버튼 위치 보기', '.gfillbar [data-cp]', '<i>지난 기수로 빈 교시 채우기</i> — 남은 빈 교시만 채웁니다')); }
    } else if (k === 'batch') {
      if (!st.n) h = '아직 교과목이 없어 강사를 배정할 칸이 없습니다. 먼저 교과목을 넣어 주세요.';
      else if (!st.empty) h = '강사가 비어 있는 칸이 없습니다. ' + (st.lane === 3 ? '화면 맨 아래 [4단계로 넘기기]를 누를 차례입니다.' : '');
      else { h = '강사 미지정 <b>' + st.empty + '칸</b>을 한 번에 채우는 방법입니다.' + li(['위쪽 \'지금 할 일\'의 <b>[AI 강사 일괄 배정]</b>을 누릅니다', 'AI 초안 창에서 칸별 후보와 근거를 확인하고, 바꾸지 않을 칸은 체크를 풉니다', '<b>[선택한 n칸 적용]</b>을 누르면 저장됩니다(강사 안내는 4단계에서 한꺼번에)']) + '한 칸씩 하려면 저에게 "화요일 2교시 강사 추천해줘"처럼 말씀해 주세요.'; ch.push(guideChip('버튼 위치 보기', '#abBar [data-ab="draft"]', '<i>AI 강사 일괄 배정</i>')); }
    } else if (k === 'blank') {
      h = '일부러 비우는 교시를 <b>비워둠 처리</b>하는 방법입니다.' + li(['시간표 위 <b>[비워둠 처리 켜기]</b>를 누릅니다', '빈 교시 칸마다 나타나는 [비워둠] 버튼을 누르고 사유를 고릅니다', '모두 처리하면 빈 교시로 세지 않아 1단계를 마칠 수 있습니다']);
      ch.push(guideChip('버튼 위치 보기', '#sGridWrap [data-gpmode]', '<i>비워둠 처리 켜기</i>'));
    } else if (k === 'move') {
      h = '교과목을 다른 칸으로 <b>옮기는</b> 방법입니다.' + li(['시간표 위 <b>[이동 모드 켜기]</b>를 누릅니다', '옮길 교과목 칸의 [이동]을 누릅니다', '옮겨 갈 빈 칸을 누르면 저장됩니다(교과목끼리 맞바꾸기도 가능)']);
      ch.push(guideChip('버튼 위치 보기', '#sGridWrap [data-mvmode]', '<i>이동 모드 켜기</i>'));
    } else if (k === 'delete') {
      h = '교과목을 <b>삭제</b>하는 방법입니다.' + li(['시간표에서 지울 교과목 칸을 누릅니다', '열린 <b>교과목 수정</b> 창 아래 [삭제]를 누르고 확인합니다']) + '이미 끝난 강의는 실적으로 보관되어 삭제할 수 없습니다.';
    } else if (k === 'handoff') {
      h = st.lane === 3 ? '지금 <b>3단계 배정 완료</b>이므로 넘길 수 있습니다.' + li(['화면 맨 아래 <b>[4단계로 넘기기]</b>를 누릅니다', '보드로 바뀌고 이 과정이 4단계 칸에 놓입니다', '4단계 카드의 [최종 확인하고 발송]에서 강사별 안내를 보냅니다']) : '[4단계로 넘기기]는 <b>3단계(배정 완료)</b>에서 나타납니다. 지금은 ' + st.lane + '단계라 ' + (st.lane === 1 ? '빈 교시 ' + st.gap + '칸을 먼저 채워야 합니다.' : st.lane === 2 ? '강사 미지정 ' + st.empty + '칸을 먼저 채워야 합니다.' : '이미 4단계입니다.');
      if (st.lane === 3) ch.push(guideChip('버튼 위치 보기', '[data-handoff]', '<i>4단계로 넘기기</i>'));
    } else if (k === 'send') {
      h = '강사 안내(문자·메일) 발송 방법입니다.' + li(['3단계에서 화면 맨 아래 <b>[4단계로 넘기기]</b>를 누릅니다', '보드 4단계 카드의 <b>[최종 확인하고 발송]</b>을 누릅니다', '확인 창에서 강사별 교과목·일시를 보고 [발송]합니다(강사 1명에게 1통씩)']) + (st.lane < 3 ? '지금은 ' + st.lane + '단계라 아직 발송할 수 없습니다.' : '');
    } else if (k === 'reset') {
      h = '과정을 <b>처음부터 다시</b> 하는 방법입니다.' + li(['편성 화면 맨 아래 [닫기 · 보드로]를 누릅니다', '1단계 카드면 <b>[이 과정 초기화]</b>, 다른 단계면 <b>[처음부터]</b>를 누르고 확인합니다']) + '초기화하면 이 과정의 교과목·강사가 모두 지워집니다.';
    } else if (k === 'instr') {
      h = '이미 정한 <b>강사를 바꾸는</b> 방법입니다.' + li(['시간표에서 그 교과목 칸을 누릅니다', '교과목 수정 창의 강사 검색칸에서 다른 강사를 고르거나 <b>[적합한 강사 찾기]</b>로 후보를 봅니다', '[수정 저장]을 누릅니다']) + '강사가 비어 있는 칸이면 저에게 "화요일 2교시 강사 추천해줘"라고 말씀하셔도 됩니다.';
    } else if (k === 'room') {
      h = '<b>강의실</b>을 바꾸는 방법입니다.' + li(['시간표에서 교과목 칸을 누릅니다', '수정 창의 강의실 목록에서 고릅니다. 비어 있는 곳은 <b>[빈 강의실 보기]</b>로 확인합니다', '[수정 저장]을 누릅니다']) + '저를 통해 넣는 교과목은 과정의 예정 강의실(' + esc(c.room || '미정') + ')로 들어갑니다.';
    } else if (k === 'add') {
      h = '교과목을 넣는 방법은 세 가지입니다.' + li(['저에게 말씀하기 — 예: "금요일 1~3교시 청렴교육 강사 추천해줘"', '시간표의 빈 칸을 누르기 — 입력 창이 열립니다', '시간표 아래 <b>[교과목 추가]</b>를 펼쳐 직접 입력하기']);
      ch.push({ t: '말로 교과목 넣기', a: { intent: 'assign' } });
    }
    say(situation() + '<br>' + h, ch, src);
  }

  /* ---------- 도움말 ---------- */
  function helpStart(src){
    var c = ctx(), st = c.stage;
    var h = '배정은 4단계로 진행합니다.<ol>' + c.steps.map(function(s, i){ return '<li><b>' + esc(s.t) + '</b> — ' + esc(s.d) + (st.lane === i + 1 ? ' <span class="cb-here">← 지금 여기</span>' : '') + '</li>'; }).join('') + '</ol>' +
      '시간표의 빈 칸을 눌러 직접 넣어도 되고, 저에게 <b>"월요일 2교시부터 2시간 청렴교육"</b>처럼 말씀하셔도 됩니다. 저장은 늘 확인 카드의 [배정]을 눌러야 합니다.';
    say(h, [{ t: '앞으로 할 일', a: { intent: 'help_next' } }, { t: '교과목 넣기', a: { intent: 'assign' } }, { t: '용어 설명 보기', fn: termList }], src);
  }
  function helpNext(src){
    var c = ctx(), st = c.stage, h = '', ch = [], li = function(arr){ return '<ol>' + arr.map(function(x){ return '<li>' + x + '</li>'; }).join('') + '</ol>'; };
    if (!st.sure && st.lane >= 3) return say('단계 정보를 불러오는 중입니다. 잠시 후 다시 물어봐 주세요.', [{ t: '앞으로 할 일', a: { intent: 'help_next' } }], src);
    if (st.lane === 1 && !st.n) {
      h = '아직 교과목이 없습니다. <b>먼저 교과목을 시간표에 넣는 것</b>이 할 일입니다. 방법을 하나 고르세요.' +
        li((c.canCopy ? ['<b>지난 기수 편성 불러오기</b>(권장) — 지난 기수 교과목·교시를 그대로 가져오고, 강사는 AI가 평가를 반영해 유지·교체를 제안합니다'] : []).concat(['<b>저에게 말씀하기</b> — 예: "월요일 1~3교시 소방전술 강사 추천해줘"', '<b>시간표 빈 칸 누르기</b> — 입력 창에서 직접 넣습니다'])) +
        '그다음: 빈 교시를 모두 채우면(또는 비워둠 처리) 2단계 강사 배정으로 넘어갑니다.';
      if (c.canCopy) ch.push(guideChip('지난 기수 버튼 보기', '#sEmpty [data-cp]', '<i>지난 기수 편성 불러오기</i> — 교과목·교시를 그대로 가져옵니다'));
      ch.push({ t: '말로 교과목 넣기', a: { intent: 'assign' } });
    } else if (st.lane === 1) {
      h = '할 일은 <b>남은 빈 교시 ' + st.gap + '칸을 처리</b>하는 것입니다. 칸마다 아래 중 하나로 처리하면 됩니다.' +
        li((c.canCopy ? ['<b>지난 기수로 한꺼번에 채우기</b> — 시간표 위 파란 줄 버튼. 이미 넣은 칸은 그대로 둡니다'] : []).concat(['<b>저에게 말로 넣기</b> — 예: "수요일 하루 전체 현장지휘 실습"', '<b>일부러 비울 칸은 비워둠 처리</b> — 시간표 위 [비워둠 처리 켜기]'])) +
        '그다음: 빈 교시가 0칸이 되면 2단계 강사 배정으로 넘어갑니다' + (st.empty ? '(지금 강사 미지정 ' + st.empty + '칸도 그때 채웁니다)' : '') + '.';
      ch.push({ t: '빈 시간 보기', fn: function(){ S.slot = blank(); askTimeOnly(); } });
      if (c.canCopy) ch.push(guideChip('지난 기수로 채우기 버튼 보기', '.gfillbar [data-cp]', '<i>지난 기수로 빈 교시 채우기</i> — 남은 빈 교시만 채웁니다'));
    } else if (st.lane === 2) {
      h = '교과목 편성은 끝났습니다. 할 일은 <b>강사가 비어 있는 ' + st.empty + '칸에 강사를 정하는 것</b>입니다.' +
        li(['<b>AI 강사 일괄 배정</b>(빠름) — 위쪽 \'지금 할 일\' 버튼. 칸별 후보와 근거를 보고 [적용]합니다', '<b>저에게 칸 말하기</b> — 예: "화요일 2교시 강사 추천해줘"', '<b>칸 직접 누르기</b> — 수정 창에서 [적합한 강사 찾기]']) +
        '그다음: 모든 칸에 강사가 정해지면 3단계 배정 완료가 됩니다. 강사 안내는 4단계에서 한꺼번에 보내므로 지금은 발송되지 않습니다.';
      ch.push(guideChip('AI 일괄 배정 버튼 보기', '#abBar [data-ab="draft"]', '<i>AI 강사 일괄 배정</i> — 빈 칸을 한 번에 채웁니다'));
    } else if (st.lane === 3) {
      h = '교과목과 강사를 모두 정했습니다. 할 일은 <b>[4단계로 넘기기]</b> 하나입니다.' +
        li(['화면 맨 아래 <b>[4단계로 넘기기]</b>를 누릅니다', '보드 4단계 카드의 <b>[최종 확인하고 발송]</b>에서 강사별 교과목·일시를 한 번 더 확인합니다', '[발송]을 누르면 강사 ' + (st.held || 'n') + '명에게 문자·메일이 1통씩 갑니다']) +
        '고칠 곳이 있으면 넘기기 전에 시간표에서 고치면 됩니다.';
      ch.push(guideChip('버튼 위치 보기', '[data-handoff]', '<i>4단계로 넘기기</i>'));
    } else {
      h = st.held ? '마지막 단계입니다. 할 일은 <b>보드 4단계 카드의 [최종 확인하고 발송]</b>입니다. 확인 창에서 강사 ' + st.held + '명의 교과목·일시를 보고 [발송]하면 이 과정이 끝납니다.' : '이 과정은 4단계까지 마쳤습니다. 보드 아래 \'진행한 과정\'에서 [보낸 내용 보기]로 문자·메일을 확인할 수 있습니다. 다른 과정은 보드에서 [+ 다른 과정 올리기]로 시작합니다.';
    }
    say(situation() + '<br>' + h, ch, src);
  }
  function askTimeOnly(){
    var fr = A.free().slice(0, 6);
    if (!fr.length) return say('남은 빈 시간이 없습니다.');
    S.wait = 'time';
    say('비어 있는 시간입니다. 누르면 그 시간에 넣을 교과목을 여쭙겠습니다.', fr.map(function(r){ return { t: dl(r.d) + ' ' + (r.full ? '하루 전체' : pl(r.s, r.e)), a: { intent: 'time', date: r.d, start: r.s, end: r.e } }; }));
  }
  function explain(term, raw, src){
    var g = GL.filter(function(x){ return x[0] === term; })[0];
    if (!g) return say('그 용어는 제가 가진 설명에 없습니다. 아래 용어 중에서 골라 보시겠어요?', TERMS.slice(4, 12).map(function(t){ return { t: t, a: { intent: 'explain', term: t } }; }), src);
    var rel = GL.indexOf(g), more = [GL[(rel + 1) % GL.length][0], GL[(rel + 2) % GL.length][0]];
    say('<b>' + esc(g[0]) + '</b> — ' + esc(g[1]), more.map(function(t){ return { t: t + '?', a: { intent: 'explain', term: t } }; }), src);
  }
  function termList(){ say('궁금한 용어를 누르세요.', TERMS.map(function(t){ return { t: t, a: { intent: 'explain', term: t } }; })); }

  window.__cbChat = { open: open, close: close, note: note, ctxChanged: ctxChanged, _rule: ruleParse };
})();
