(function () {
  var S = window.SITE || {};
  var $ = function (q, r) { return (r || document).querySelector(q); };
  var $$ = function (q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); };
  var ko = function () { return document.documentElement.lang === 'ko'; };

  /* 언어: 영문은 /, 국문은 /kr/ 주소로 나뉨 */
  var l0 = ko() ? 'ko' : 'en';
  $$('option[data-en]').forEach(function (o) { o.innerHTML = o.dataset[l0]; });

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
  wire('[data-pay="subCard"]', (S.pay || {}).subCard, 'subscription');
  wire('[data-pay="subPaypal"]', (S.pay || {}).subPaypal, 'subscription');
  wire('[data-pay="krCard"]', (S.pay || {}).krCard, 'diagnosis');
  wire('[data-pay="buildCard"]', (S.pay || {}).buildCard, 'team');
  wire('[data-pay="paypal"]', (S.pay || {}).paypal, 'diagnosis');
  wire('[data-book]', S.bookingUrl, 'call');
  var frame = $('#bookFrame');
  if (frame) {
    if (S.bookingUrl) { frame.src = S.bookingUrl; frame.hidden = false; $('#bookFallback').hidden = true; }
  }

  /* 가격 페이지: 화상 상담 날짜 · 시간 고르고 결제까지 */
  var slot = $('#callSlot');
  if (slot) {
    var C = S.callSlots || {}, KOR = ko();
    var dW = KOR ? ['일', '월', '화', '수', '목', '금', '토'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var daysEl = $('.sl-days', slot), timesEl = $('.sl-times', slot), smsg = $('.sl-msg', slot);
    var pick = { day: null, time: null };
    if (!KOR) { slot.name.placeholder = 'Name · company'; slot.contact.placeholder = 'Email'; slot.contact.type = 'email'; }
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var timesFor = function (d) {
      if ((C.off || []).indexOf(iso(d)) > -1) return [];
      return (d.getDay() === 0 || d.getDay() === 6 ? C.weekend : C.weekday) || [];
    };
    var chip = function (label, sub, on) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'sl-c';
      b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false');
      b.innerHTML = sub ? '<small>' + sub + '</small>' + label : label;
      b.addEventListener('click', function () {
        $$('.sl-c', b.parentNode).forEach(function (x) { x.setAttribute('aria-checked', 'false'); });
        b.setAttribute('aria-checked', 'true'); on();
      });
      return b;
    };
    var drawTimes = function () {
      timesEl.innerHTML = '';
      if (!pick.day) { timesEl.innerHTML = '<span class="sl-e">' + (KOR ? '날짜를 먼저 골라 주세요' : 'Pick a date first') + '</span>'; return; }
      timesFor(pick.day).forEach(function (h) { timesEl.appendChild(chip(h, '', function () { pick.time = h; smsg.hidden = true; })); });
    };
    var d0 = new Date(); d0.setHours(0, 0, 0, 0); d0.setDate(d0.getDate() + (C.leadDays == null ? 2 : C.leadDays));
    for (var i = 0, n = 0; n < (C.days || 14) && i < 60; i++) {
      var d = new Date(d0); d.setDate(d0.getDate() + i);
      if (!timesFor(d).length) continue;
      n++;
      (function (d) {
        daysEl.appendChild(chip((d.getMonth() + 1) + '/' + d.getDate(), dW[d.getDay()], function () { pick.day = d; pick.time = null; drawTimes(); smsg.hidden = true; }));
      })(d);
    }
    drawTimes();

    var say = function (t, bad) { smsg.textContent = t; smsg.className = 'sl-msg' + (bad ? ' bad' : ' ok'); smsg.hidden = false; };
    $$('[data-slot]').forEach(function (b) {
      b.addEventListener('click', function () {
        var how = b.getAttribute('data-slot');
        var name = slot.name.value.trim(), contact = slot.contact.value.trim();
        if (!pick.day || !pick.time) return say(KOR ? '날짜와 시간을 골라 주세요.' : 'Please pick a date and time.', true);
        if (!name || !contact || (!KOR && !slot.contact.checkValidity())) { (name ? slot.contact : slot.name).focus(); return say(KOR ? '이름과 연락처를 적어 주세요.' : 'Please add your name and email.', true); }
        var when = iso(pick.day) + ' (' + dW[pick.day.getDay()] + ') ' + pick.time;
        var payUrl = how === 'card' ? (S.pay || {}).callCard : how === 'paypal' ? (S.pay || {}).callPaypal : '';
        /* 결제창은 클릭 순간 열어야 팝업 차단을 안 받음 */
        var win = payUrl ? window.open(payUrl, '_blank') : null;
        if (payUrl && !win) location.href = payUrl;
        var data = { type: 'call', start: when, name: name, pay: how, lang: document.documentElement.lang, page: location.href, sentAt: new Date().toISOString(),
                     note: KOR ? '화상 상담 예약 · 결제 방법: ' + (how === 'card' ? '카드' : '계좌이체') : 'Video call booking · ' + how };
        data[KOR ? 'phone' : 'email'] = contact;
        if (S.formEndpoint) {
          var body = JSON.stringify(data);
          var sent = navigator.sendBeacon && navigator.sendBeacon(S.formEndpoint, new Blob([body], { type: 'text/plain;charset=utf-8' }));
          if (!sent) fetch(S.formEndpoint, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body }).catch(function () {});
        }
        if (how === 'card' || (how === 'paypal' && payUrl)) {
          say(KOR ? when + ' 예약 요청을 받았어요. 새 창에서 결제를 마치면 확정 안내를 문자로 드릴게요.' : 'Booking request received for ' + when + ' (Korea time). Finish payment in the new tab and we will confirm by email.');
        } else if (how === 'paypal') {
          say('Booking request received for ' + when + ' (Korea time). PayPal is coming soon, so we will email you a payment link.');
        } else {
          say(KOR ? when + ' 예약 요청을 받았어요. 계좌 안내와 확정 연락을 문자로 드릴게요.' : 'Booking request received.');
        }
      });
    });
  }

  /* 히어로: 업종을 누르면 예시 화면이 바뀜 (가만히 두면 차례로 넘어감) */
  var fis = $$('button.fi[data-ind]'), dvs = $$('.device .dv'), dev = $('.device');
  if (fis.length && dvs.length) {
    var cur = 'beauty', timer = null, seen = false;
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var show = function (ind) {
      cur = ind;
      fis.forEach(function (b) { var on = b.getAttribute('data-ind') === ind; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      dvs.forEach(function (d) { d.hidden = d.getAttribute('data-ind') !== ind; });
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    fis.forEach(function (b) {
      b.addEventListener('click', function () {
        stop(); show(b.getAttribute('data-ind'));
        var r = dev.getBoundingClientRect();
        if (r.top > window.innerHeight - 120) dev.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
      });
    });
    if (!still && 'IntersectionObserver' in window) {
      var order = fis.map(function (b) { return b.getAttribute('data-ind'); });
      var hio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !timer && !seen) {
            dvs.forEach(function (d) { $$('img', d).forEach(function (i) { i.loading = 'eager'; }); });
            timer = setInterval(function () { show(order[(order.indexOf(cur) + 1) % order.length]); }, 3500);
          } else if (!e.isIntersecting && timer) { stop(); seen = true; }
        });
      }, { threshold: 0.25 });
      hio.observe(dev);
    }
  }

  /* 확장 다이어그램: 화면에 들어오면 안쪽부터 한 겹씩 */
  document.documentElement.classList.add('js');
  var ex = document.querySelector('.expand');
  if (ex) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { ex.classList.add('in'); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe(ex);
    } else ex.classList.add('in');
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
