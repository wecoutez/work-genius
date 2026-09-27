(function () {
  var S = window.SITE || {};
  var $ = function (q, r) { return (r || document).querySelector(q); };
  var $$ = function (q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); };
  var ko = function () { return document.documentElement.lang === 'ko'; };

  /* 언어 전환 */
  function setLang(l) {
    document.documentElement.lang = l;
    try { localStorage.setItem('tdh-lang', l); } catch (e) {}
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.l === l ? 'true' : 'false'); });
    var t = document.body.dataset['title' + (l === 'ko' ? 'Ko' : 'En')];
    if (t) document.title = t;
    $$('option[data-en]').forEach(function (o) { o.innerHTML = o.dataset[l === 'ko' ? 'ko' : 'en']; });
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.l); }); });
  setLang(ko() ? 'ko' : 'en');

  /* 메일 주소 · 복사 */
  $$('[data-email]').forEach(function (el) { el.textContent = S.email || ''; });
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = S.email || '', o = btn.innerHTML;
      var done = function () { btn.textContent = ko() ? '복사됨' : 'Copied'; setTimeout(function () { btn.innerHTML = o; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {});
    });
  });

  /* 사업자 정보 */
  var B = S.business || {};
  var biz = $('#biz');
  if (biz) {
    var rows = [['상호', B.name], ['대표', B.owner], ['사업자등록번호', B.regNo], ['통신판매업 신고', B.mailOrderNo], ['주소', B.address], ['전화', B.phone], ['이메일', S.email]]
      .filter(function (r) { return r[1]; })
      .map(function (r) { return '<span>' + r[0] + ' ' + r[1] + '</span>'; });
    biz.innerHTML = rows.join('');
  }

  /* 결제 · 예약 버튼: 링크가 있으면 열고, 없으면 의뢰서로 안내 */
  function wire(sel, url, fallbackType) {
    $$(sel).forEach(function (a) {
      if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.classList.remove('off'); }
      else {
        a.href = 'request.html?type=' + (a.dataset.type || fallbackType) + (a.dataset.method ? '&pay=' + a.dataset.method : '');
        a.classList.add('off');
        var n = a.querySelector('.soon'); if (n) n.hidden = false;
      }
    });
  }
  wire('[data-pay="callCard"]', (S.pay || {}).callCard, 'call');
  wire('[data-pay="callPaypal"]', (S.pay || {}).callPaypal, 'call');
  wire('[data-pay="krCard"]', (S.pay || {}).krCard, 'diagnosis');
  wire('[data-pay="paypal"]', (S.pay || {}).paypal, 'diagnosis');
  wire('[data-book]', S.bookingUrl, 'call');
  var frame = $('#bookFrame');
  if (frame) {
    if (S.bookingUrl) { frame.src = S.bookingUrl; frame.hidden = false; $('#bookFallback').hidden = true; }
  }

  /* 의뢰서 */
  var form = $('#reqForm');
  if (!form) return;
  var q = new URLSearchParams(location.search);
  if (q.get('type')) { var r = form.querySelector('input[name="type"][value="' + q.get('type') + '"]'); if (r) r.checked = true; }
  if (q.get('pay')) { var p = form.querySelector('input[name="pay"][value="' + q.get('pay') + '"]'); if (p) p.checked = true; }

  var msg = $('#formMsg');
  function show(text, bad) { msg.textContent = text; msg.className = 'fmsg' + (bad ? ' bad' : ' ok'); msg.hidden = false; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.website && form.website.value) return; // 자동 등록 방지
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var fd = new FormData(form), data = {};
    fd.forEach(function (v, k) { if (k === 'website') return; data[k] = data[k] ? data[k] + ', ' + v : v; });
    data.lang = document.documentElement.lang; data.page = location.href; data.sentAt = new Date().toISOString();

    var btn = form.querySelector('button[type="submit"]'); btn.disabled = true;
    if (S.formEndpoint) {
      fetch(S.formEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
        .then(function () {
          try { sessionStorage.setItem('tdh-last', JSON.stringify(data)); } catch (e) {}
          location.href = 'thanks.html?type=' + encodeURIComponent(data.type || '');
        })
        .catch(function () {
          btn.disabled = false;
          show(ko() ? '보내지 못했어요. 인터넷 연결을 확인하고 잠시 뒤 다시 눌러 주세요.'
                    : 'Could not send. Check your connection and try again in a moment.', true);
        });
    } else {
      /* 저장 주소가 아직 없을 때: 보내지 않고 안내만 */
      btn.disabled = false;
      show(ko() ? '의뢰서 접수를 준비하고 있어요. 잠시 뒤 다시 시도해 주세요.'
                : 'Requests open shortly. Please try again a little later.', true);
    }
  });
})();
