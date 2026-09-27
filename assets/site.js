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

  var callForm = null;
  /* 가격 페이지: 화상 상담 날짜 · 시간 고르고 결제까지 */
  var slot = $('#callSlot');
  if (slot) {
    var C = S.callSlots || {}, KOR = ko();
    var dW = KOR ? ['일', '월', '화', '수', '목', '금', '토'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var daysEl = $('.sl-days', slot), timesEl = $('.sl-times', slot), smsg = $('.sl-msg', slot);
    var pick = { day: null, time: null };
    if (!KOR) { slot.name.placeholder = 'Name · company'; slot.contact.placeholder = 'Email'; slot.contact.type = 'email'; }
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    /* 예약 가능 시간은 한국 시간(KST)으로 적어 둠. 영문 페이지는 미국 태평양 시간(PT)으로 바꿔 보여 줌 */
    var TZ = KOR ? 'Asia/Seoul' : 'America/Los_Angeles';
    var fmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !KOR });
    var partsOf = function (ms) { var o = {}; fmt.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; }); return o; };
    var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var kstNow = new Date(Date.now() + 9 * 3600e3);
    var DAYS = [], byKey = {};
    for (var i = (C.leadDays == null ? 2 : C.leadDays); i < 60 && DAYS.length < (C.days || 14) + 2; i++) {
      var k = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate() + i));
      var kIso = k.getUTCFullYear() + '-' + pad(k.getUTCMonth() + 1) + '-' + pad(k.getUTCDate());
      if ((C.off || []).indexOf(kIso) > -1) continue;
      var list = (k.getUTCDay() === 0 || k.getUTCDay() === 6 ? C.weekend : C.weekday) || [];
      list.forEach(function (hm) {
        var h = +hm.split(':')[0], m = +hm.split(':')[1];
        var ms = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate(), h - 9, m);
        var p = partsOf(ms);
        if (!KOR) { var lh = (+p.hour % 12) + (p.dayPeriod === 'PM' ? 12 : 0); if (lh < 7 || lh > 21) return; }
        var key = p.year + '-' + pad(+p.month) + '-' + pad(+p.day);
        var day = byKey[key];
        if (!day) { day = byKey[key] = { key: key, md: (+p.month) + '/' + (+p.day), wd: dW[WD[p.weekday]], times: [] }; DAYS.push(day); }
        var label = KOR ? pad(+p.hour % 24) + ':' + p.minute : p.hour + ':' + p.minute + ' ' + p.dayPeriod;
        var value = KOR ? key + ' (' + day.wd + ') ' + label
          : day.wd + ' ' + day.md + ' ' + label + ' PT (KST ' + (k.getUTCMonth() + 1) + '/' + k.getUTCDate() + ' ' + hm + ')';
        day.times.push({ label: label, value: value, show: KOR ? value : day.wd + ' ' + day.md + ', ' + label + ' PT', ms: ms });
      });
    }
    DAYS.sort(function (x, y) { return x.key < y.key ? -1 : 1; });
    DAYS.forEach(function (d) { d.times.sort(function (x, y) { return x.ms - y.ms; }); });
    DAYS = DAYS.filter(function (d) { return d.times.length; }).slice(0, C.days || 14);
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
      if (pick.day === 'later') { timesEl.innerHTML = '<span class="sl-e">' + (KOR ? '결제 후 편한 시간을 함께 정해요' : 'We will agree a time with you after booking') + '</span>'; return; }
      pick.day.times.forEach(function (tm) { timesEl.appendChild(chip(tm.label, '', function () { pick.time = tm; smsg.hidden = true; })); });
    };
    DAYS.forEach(function (d) {
      daysEl.appendChild(chip(d.md, d.wd, function () { pick.day = d; pick.time = null; drawTimes(); smsg.hidden = true; }));
    });
    /* 날짜 · 시간은 나중에 정해도 됨 */
    var later = chip(KOR ? '나중에 정하기' : 'Decide later', '', function () { pick.day = 'later'; pick.time = null; drawTimes(); smsg.hidden = true; });
    later.classList.add('sl-later'); daysEl.insertBefore(later, daysEl.firstChild);
    drawTimes();

    var say = function (t, bad) { smsg.textContent = t; smsg.className = 'sl-msg' + (bad ? ' bad' : ' ok'); smsg.hidden = false; };
    /* 영문 PayPal 버튼에서 쓰는 예약 정보 (틀리면 안내하고 null) */
    callForm = function () {
      var name = slot.name.value.trim(), contact = slot.contact.value.trim();
      if (pick.day && pick.day !== 'later' && !pick.time) { say('Pick a time, or choose "Decide later".', true); return null; }
      if (!name || !contact || !slot.contact.checkValidity()) { (name ? slot.contact : slot.name).focus(); say('Please add your name and email first.', true); return null; }
      var fixed = pick.day && pick.day !== 'later';
      return { start: fixed ? pick.time.value : 'Decide later', show: fixed ? pick.time.show : '', name: name, email: contact, fixed: fixed, say: say };
    };
    $$('[data-slot]').forEach(function (b) {
      b.addEventListener('click', function () {
        var how = b.getAttribute('data-slot');
        var name = slot.name.value.trim(), contact = slot.contact.value.trim();
        if (pick.day && pick.day !== 'later' && !pick.time) return say(KOR ? '시간을 골라 주세요. 아직 모르면 "나중에 정하기"를 눌러 주세요.' : 'Pick a time, or choose "Decide later".', true);
        if (!name || !contact || (!KOR && !slot.contact.checkValidity())) { (name ? slot.contact : slot.name).focus(); return say(KOR ? '이름과 연락처를 적어 주세요.' : 'Please add your name and email.', true); }
        var fixed = pick.day && pick.day !== 'later';
        var when = fixed ? pick.time.value : (KOR ? '나중에 정하기' : 'Decide later');
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
          say(KOR ? (fixed ? when + ' 예약 요청을 받았어요. ' : '예약 요청을 받았어요. ') + '새 창에서 결제를 마치면 ' + (fixed ? '확정 안내를' : '시간을 정하는 연락을') + ' 문자로 드릴게요.' : (fixed ? 'Booking request received for ' + pick.time.show + '. ' : 'Booking request received. ') + 'Finish payment in the new tab and we will ' + (fixed ? 'confirm' : 'agree a time') + ' by email.');
        } else if (how === 'paypal') {
          say((fixed ? 'Booking request received for ' + pick.time.show + '. ' : 'Booking request received. ') + 'PayPal is coming soon, so we will email you a payment link' + (fixed ? '.' : ' and agree a time.'));
        } else {
          say(KOR ? (fixed ? when + ' 예약 요청을 받았어요. 계좌 안내와 확정 연락을' : '예약 요청을 받았어요. 계좌 안내와 시간 정하는 연락을') + ' 문자로 드릴게요.' : 'Booking request received.');
        }
      });
    });
  }

  /* 영문 가격 페이지: PayPal 결제 버튼 (Olive Skin 과 같은 PayPal 계정) */
  var ppBoxes = $$('.ppbox[data-pp]');
  if (ppBoxes.length && !ko() && S.paypalClientId) {
    var PP = {
      call: { usd: '150.00', label: 'Video call (30 min)' },
      diagnosis: { usd: '2200.00', label: 'Operations diagnosis' },
      team: { usd: '13000.00', label: 'Team lead package (build)' }
    };
    var record = function (o) {
      if (!S.formEndpoint) return;
      var body = JSON.stringify(o);
      var sent = navigator.sendBeacon && navigator.sendBeacon(S.formEndpoint, new Blob([body], { type: 'text/plain;charset=utf-8' }));
      if (!sent) fetch(S.formEndpoint, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body }).catch(function () {});
    };
    var boxMsg = function (box) {
      var m = box.nextElementSibling && box.nextElementSibling.classList.contains('sl-msg') ? box.nextElementSibling : null;
      return function (t, bad) { if (!m) return; m.textContent = t; m.className = 'sl-msg en' + (bad ? ' bad' : ' ok'); m.hidden = false; };
    };
    var mount = function () {
      ppBoxes.forEach(function (box) {
        var kind = box.getAttribute('data-pp'), item = PP[kind]; if (!item) return;
        var tell = kind === 'call' ? function (t, bad) { var f = $('#callSlot .sl-msg'); f.textContent = t; f.className = 'sl-msg' + (bad ? ' bad' : ' ok'); f.hidden = false; } : boxMsg(box);
        var info = null;
        window.paypal.Buttons({
          style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'pay', height: 48 },
          onClick: function (data, actions) {
            if (kind !== 'call') return actions.resolve();
            info = callForm ? callForm() : null;
            return info ? actions.resolve() : actions.reject();
          },
          createOrder: function (data, actions) {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [{ description: 'Work Genius · ' + item.label, amount: { currency_code: 'USD', value: item.usd },
                items: [{ name: item.label, unit_amount: { currency_code: 'USD', value: item.usd }, quantity: '1', category: 'DIGITAL_GOODS' }],
                custom_id: kind + (info ? ' · ' + info.start : '') }],
              application_context: { brand_name: 'Work Genius', shipping_preference: 'NO_SHIPPING' }
            });
          },
          onApprove: function (data, actions) {
            return actions.order.capture().then(function (d) {
              var payer = (d && d.payer) || {}, nm = payer.name ? [payer.name.given_name, payer.name.surname].join(' ') : '';
              record({ type: kind === 'team' ? 'team' : kind, pay: 'paypal', lang: 'en', page: location.href, sentAt: new Date().toISOString(),
                name: (info && info.name) || nm, email: (info && info.email) || payer.email_address || '', start: info ? info.start : '',
                note: 'PayPal paid $' + item.usd + ' · order ' + (d && d.id || data.orderID) + (payer.email_address ? ' · payer ' + payer.email_address : '') });
              tell(kind === 'call'
                ? 'Paid, thank you. ' + (info && info.fixed ? 'We will confirm ' + info.show + ' by email.' : 'We will email you to agree a time.')
                : 'Paid, thank you. We will email you within one business day to plan the next steps.');
            }).catch(function () { tell('Payment did not go through. Please try again.', true); });
          },
          onError: function () { tell('PayPal could not open. Please try again, or send us a request.', true); }
        }).render(box).catch(function () {});
      });
    };
    var sdk = document.createElement('script');
    sdk.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(S.paypalClientId) + '&currency=USD&intent=capture&components=buttons&locale=en_US';
    sdk.onload = function () { if (window.paypal && window.paypal.Buttons) mount(); };
    sdk.onerror = function () { ppBoxes.forEach(function (b) { b.innerHTML = '<a class="btn" href="request.html?pay=paypal">Send a request</a>'; }); };
    document.body.appendChild(sdk);
  }

  /* 히어로: 업종을 누르면 예시 화면이 바뀜 (가만히 두면 차례로 넘어감) */
  var fis = $$('button.fi[data-ind]'), dvs = $$('.device .dv'), dev = $('.device');
  if (fis.length && dvs.length) {
    var cur = 'fnb', timer = null, seen = false;
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

