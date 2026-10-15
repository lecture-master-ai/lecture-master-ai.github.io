/* 대회용 설정 (공공 AI 대전환 챌린지 출품용 사본)
   - 배포한 대회용 Apps Script 웹앱 주소를 WEBAPP_URL 한 곳에만 넣으면 모든 화면이 그 주소를 씁니다.
   - 운영 서버 주소를 넣지 마십시오. */
window.CONTEST_CONFIG = {
  WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbzYdVSZsLnSw3JN01aIDuXa1Ubxh6ERWYC-0TEQxu6tRYrcI9-WNYEoKv3Cfk9qyUvJ/exec',
  VERSION: '대회용 c6d',
  ORG_NAME: '○○소방학교'
};
(function () {
  function banner() {
    if (document.getElementById('contestBanner')) return;
    var b = document.createElement('div');
    b.id = 'contestBanner';
    b.setAttribute('role', 'note');
    b.textContent = '대회용 · 모의데이터 — 실제 인물·연락처가 아닙니다. 메일·문자는 실제로 발송되지 않습니다(시연 모드).';
    b.style.cssText = 'background:#7A2E0E;color:#fff;font-size:12.5px;font-weight:700;text-align:center;padding:6px 12px;line-height:1.4;letter-spacing:-0.2px;';
    document.body.insertBefore(b, document.body.firstChild);
    var v = document.createElement('div');
    v.id = 'contestVersion';
    v.textContent = window.CONTEST_CONFIG.VERSION;
    v.style.cssText = 'text-align:center;color:#9AA5B1;font-size:11px;padding:10px 0 14px;';
    document.body.appendChild(v);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', banner); else banner();
})();
