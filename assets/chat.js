/* =====================================================================
   워크 지니어스 · 상담 챗봇
   정해진 답변만 보여 줘요 (AI 아님). 답변 내용은 아래 QA 에서 고치면 됩니다.
   "사람과 연결"은 config.js 의 kakaoChat 링크로 이어지고, 비어 있으면 사전 질문지로 안내해요.
   ===================================================================== */
(function () {
  var S = window.SITE || {};
  var KO = document.documentElement.lang === 'ko';
  function t(ko, en) { return KO ? ko : en; }

  var QA = [
    { id: 'price', q: t('가격이 얼마예요?', 'How much does it cost?'),
      k: ['가격', '비용', '얼마', '금액', '견적', '패키지', 'price', 'cost', 'how much', 'quote', 'package'],
      a: t('단계별 금액이에요 (부가세 별도).<br>· 화상 상담 (30분) <b>20만 원</b><br>· 운영 진단 <b>300만 원</b><br>· 팀장님 패키지 <b>1,800만 원~</b><br>· 확장 패키지 <b>3,000만 원~</b><br>· 월간 수정 구독 <b>월 50만 원</b> (10건까지, 선택)<br><br>상담 후 30일 안에 진단을 계약하면 상담비를, 진단 후 60일 안에 제작을 계약하면 진단비를 빼 드려요.',
           'Prices by stage (taxes excluded):<br>· Video call (30 min) <b>$150</b><br>· Operations diagnosis <b>$2,200</b><br>· Team lead package <b>from $13,000</b><br>· Expansion package <b>from $22,000</b><br>· Monthly edit subscription <b>$360/mo</b> (up to 10 edits, optional)<br><br>Book the diagnosis within 30 days of the call and the call fee is deducted; build within 60 days of the diagnosis and the diagnosis fee is deducted.') ,
      go: ['pricing.html', t('가격 페이지로 가기', 'Go to pricing')] },
    { id: 'process', q: t('어떻게 진행돼요? 기간은요?', 'How does it work, and how long?'),
      k: ['진행', '기간', '얼마나 걸', '일정', '방문', '몇 주', 'process', 'how long', 'timeline', 'weeks', 'visit'],
      a: t('진단부터 오너십 이전까지 <b>5주</b>예요. 모두 온라인으로 진행하고 회사로 방문하지 않아요.<br>· 1주차 운영 진단 · 팀 코칭 (워크 플레이북, 팀원별 강점 · 성향 분석, 개인 리포트)<br>· 2주차 일하는 방식 코칭 · 화면 설계<br>· 3~4주차 고객사 계정 안에서 제작<br>· 5주차 시험 운영 · 후속 코칭, 오너십 이전',
           '<b>5 weeks</b> from diagnosis to ownership, fully online, no office visits.<br>· Week 1 diagnosis and team coaching (work playbook, strengths, style, personal reports)<br>· Week 2 way-of-working coaching and screen design<br>· Weeks 3–4 build inside your accounts<br>· Week 5 pilot, follow-up coaching and ownership transfer') },
    { id: 'what', q: t('어떤 화면을 만들 수 있어요?', 'What can you build?'),
      k: ['화면', '기능', '대시보드', '무엇', '뭘', '만들', '업종', 'screen', 'feature', 'dashboard', 'build', 'industry'],
      a: t('<b>팀장님 패키지</b>: 팀 일정(주차 진행표), 심의 · 캠페인 D-day, 데일리 업무를 슬랙 · 팀즈로 공유.<br><b>확장 패키지</b>: 채널 · 시장 점유율, 제품 · 브랜드별 매출, 지역별 거래처, 캠페인 · 프로모션 관리.<br><br>건축 · 제조 · F&amp;B · 뷰티 · 제약 · 학교 등 업종에 맞춰 만들어요.',
           '<b>Team lead package</b>: team schedule, review and campaign D-day flags, daily logs shared to Slack or Teams.<br><b>Expansion package</b>: channel and market share, sales by product and brand, accounts by region, campaign and promotion tracking.<br><br>Built for your industry: architecture, manufacturing, F&amp;B, beauty, pharma, schools and more.') },
    { id: 'custom', q: t('우리 회사에 맞게 만들 수 있어요?', 'Can it fit how our company works?'),
      k: ['맞춤', '커스텀', '우리 회사', '결재', '용어', '양식', '직급', 'custom', 'our company', 'approval', 'terms', 'fit'],
      a: t('네, 그게 워크 지니어스의 방식이에요. 진단 때 지금 쓰는 엑셀 · 단톡방 · 메일과 결재선 · 직급 · 부르는 이름 · 양식을 확인하고, 그대로 화면에 반영해요. 쓰지 않는 기능은 넣지 않고, 회사 색과 로고로 디자인해요.',
           "Yes, that's how we work. In the diagnosis we look at the spreadsheets, chats and emails you use today, plus your approval line, grades, terms and forms, and build them into the screens. We leave out features you won't use and design it in your colours.") },
    { id: 'pay', q: t('결제는 어떻게 해요?', 'How do we pay?'),
      k: ['결제', '카드', '계좌', '이체', '세금계산서', '페이팔', 'pay', 'card', 'invoice', 'paypal'],
      a: t('상담 · 진단 · 제작 모두 선결제이고, 카드나 계좌이체로 결제할 수 있어요. 제작비는 세금계산서 발행 후 계좌이체를 권장해요.',
           'Clients outside Korea pay with PayPal. Everything is paid in advance.') },
    { id: 'tools', q: t('마이크로소프트를 써도 돼요?', 'We use Microsoft, not Google.'),
      k: ['마이크로소프트', '구글', '엑셀', '슬랙', '팀즈', '도구', 'microsoft', 'google', 'excel', 'slack', 'teams', 'tool'],
      a: t('네. 회사가 이미 쓰는 도구에 맞춰 만들어요. 데일리 업무는 슬랙이나 마이크로소프트 팀즈 채널로 공유할 수 있어요.',
           'Yes. We build around the tools your company already uses. Daily logs can go to Slack or Microsoft Teams.') },
    { id: 'security', q: t('우리 회사 자료는 안전해요?', 'Is our data safe?'),
      k: ['보안', '자료', '데이터', '소유', '권한', '비밀', 'security', 'data', 'own', 'access', 'nda', 'confidential'],
      a: t('사이트 · 시트 · 자료는 처음부터 <b>고객사 계정 안에</b> 만들고 고객사가 소유해요. 회사 계정 로그인으로만 열리고, 제작하는 동안 받은 편집 권한은 오너십 이전 때 모두 회수해요. 계약서에 비밀유지 조항도 들어가요.',
           'The site, sheets and data are built <b>inside your accounts</b> and owned by you. Access is through company sign-in only, and our editor access is removed at ownership transfer. Every contract includes confidentiality.') },
    { id: 'change', q: t('나중에 수정하거나 화면을 더할 수 있어요?', 'Can we change things later?'),
      k: ['수정', '추가', '구독', '나중', '변경', 'edit', 'change', 'add', 'subscription', 'later'],
      a: t('메뉴 · 칸은 시트에서 직접 추가할 수 있어요. 월간 수정 구독(월 50만 원)이면 매달 10건까지 고쳐 드리고, 언제든 해지할 수 있어요. 새 화면은 따로 견적을 드려요.',
           'Menus and fields can be added in the sheet. The monthly edit subscription ($360/mo) covers up to 10 edits a month and can be cancelled anytime. New screens are quoted separately.') }

  ];

  var kakao = KO && S.kakaoChat;
  var human = kakao
    ? { href: kakao, label: t('담당 매니저에게 문의하기', ''), ext: true }
    : { href: 'request.html', label: t('사전 질문지로 남기기', 'Leave a request'), ext: false };

  /* 화면 만들기 */
  var root = document.createElement('div');
  root.className = 'wgc';
  root.innerHTML =
    '<button class="wgc-fab" type="button" aria-expanded="false" aria-controls="wgcPanel">' +
      '<svg class="i-open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/></svg>' +
      '<svg class="i-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      '<span class="wgc-fl">' + t('담당 매니저와 이야기하기', 'Talk to your manager') + '</span>' +
    '</button>' +
    '<div class="wgc-panel" id="wgcPanel" role="dialog" aria-label="' + t('워크 지니어스 상담', 'Work Genius chat') + '" hidden>' +
      '<div class="wgc-hd"><i>W</i><div><b>' + t('워크 지니어스', 'Work Genius') + '</b><small>' + t('자주 묻는 질문에 바로 답해 드려요', 'Quick answers to common questions') + '</small></div>' +
        '<button type="button" class="wgc-x" aria-label="' + t('닫기', 'Close') + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
      '<div class="wgc-log" aria-live="polite"></div>' +
      '<form class="wgc-in"><input type="text" name="q" autocomplete="off" maxlength="200" placeholder="' + t('궁금한 걸 적어 주세요', 'Type a question') + '" aria-label="' + t('질문', 'Question') + '"><button type="submit" aria-label="' + t('보내기', 'Send') + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
    '</div>';
  document.body.appendChild(root);

  var fab = root.querySelector('.wgc-fab'), panel = root.querySelector('.wgc-panel'), log = root.querySelector('.wgc-log');
  var form = root.querySelector('.wgc-in'), input = form.q, started = false;

  function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function add(cls, html) {
    var d = document.createElement('div'); d.className = 'wgc-m ' + cls; d.innerHTML = html;
    log.appendChild(d); return d;
  }
  function humanLink() {
    return '<a class="wgc-human' + (kakao ? ' kk' : '') + '" href="' + human.href + '"' + (human.ext ? ' target="_blank" rel="noopener"' : '') + '>' +
      (kakao ? '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.3.3.6.6.4l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3Z"/></svg>' : '') +
      human.label + '</a>';
  }
  var BOOK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  var WON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>';
  function bookLink() {
    return '<a class="wgc-human wgc-book" href="pricing.html#call">' + BOOK + t('상담 예약하러 가기', 'Book a call') + '</a>' +
      '<a class="wgc-human wgc-book" href="pricing.html">' + WON + t('가격 확인하러 가기', 'See pricing') + '</a>';
  }
  function chips() {
    var w = add('wgc-chips', '');
    QA.forEach(function (x) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = x.q;
      b.onclick = function () { ask(x.q, x); }; w.appendChild(b);
    });
    var h = document.createElement('div'); h.innerHTML = bookLink() + humanLink();
    while (h.firstChild) w.appendChild(h.firstChild);
  }
  function answer(x) {
    var more = x.go ? '<br><a class="wgc-human wgc-go" href="' + x.go[0] + '">' + x.go[1] + ' →</a>' : '';
    add('bot', x.a + more);
    add('bot wgc-next', t('다른 것도 궁금하면 아래에서 골라 주세요.', 'Pick another question below.'));
    chips();
  }
  function match(q) {
    var s = q.toLowerCase(), best = null, n = 0;
    QA.forEach(function (x) {
      var c = x.k.filter(function (k) { return s.indexOf(k) > -1; }).length;
      if (c > n) { n = c; best = x; }
    });
    return best;
  }
  function ask(q, x) {
    log.querySelectorAll('.wgc-chips, .wgc-next').forEach(function (c) { c.remove(); });
    var me = add('me', esc(q));
    log.scrollTop = log.scrollHeight;
    x = x || match(q);
    setTimeout(function () {
      if (x) answer(x);
      else {
        add('bot', t('그 질문은 담당 매니저에게 바로 전달했어요. 답을 받을 연락처(휴대폰 또는 이메일)를 남겨 주시면 직접 연락드릴게요.', 'We have passed your question to our team. Leave a phone number or email and we will get back to you.') + '<br>' + humanLink());
        chips();
      }
      /* 질문이 위에 오게 스크롤해서 답변을 처음부터 읽게 */
      log.scrollTop = me.offsetTop - log.offsetTop - 12;
    }, 280);
  }
  function open(v) {
    panel.hidden = !v; fab.setAttribute('aria-expanded', v); root.classList.toggle('on', v);
    if (v && !started) {
      started = true;
      add('bot', t('안녕하세요! 팀 매니징 코칭과 전용 플랫폼 구축을 함께 하는,<br><span style="white-space:nowrap">워크 지니어스예요.</span><br>가격, 진행 방식, 보안 등 궁금한 걸 골라 주세요.', 'Hi! This is Work Genius. We coach how your team works and build its own platform.<br>Pick a question about pricing, process, security and more.'));
      chips();
    }
    if (v && window.matchMedia('(min-width:681px)').matches) input.focus();
  }
  fab.onclick = function () { open(panel.hidden); };
  root.querySelector('.wgc-x').onclick = function () { open(false); fab.focus(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { open(false); fab.focus(); } });
  /* 입력창에 직접 쓴 질문은 사전 질문지와 같은 곳(구글 시트 + 알림 메일)으로 보냄 */
  var sentN = 0;
  function report(q, x) {
    if (!S.formEndpoint || sentN >= 20) return;
    sentN++;
    var body = JSON.stringify({ type: 'chat', name: t('챗봇 방문자', 'Chatbot visitor'), note: q, message: q,
      matched: x ? x.id : '', lang: document.documentElement.lang, page: location.href, sentAt: new Date().toISOString() });
    var ok = navigator.sendBeacon && navigator.sendBeacon(S.formEndpoint, new Blob([body], { type: 'text/plain;charset=utf-8' }));
    if (!ok) fetch(S.formEndpoint, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body }).catch(function () {});
  }
  form.onsubmit = function (e) {
    e.preventDefault();
    var q = input.value.trim(); if (!q) return;
    input.value = ''; report(q, match(q)); ask(q);
  };
})();
