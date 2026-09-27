/* =====================================================================
   워크 지니어스 · 사이트 설정
   이 파일만 고치면 결제 · 예약 · 의뢰서 · 사업자 정보가 모든 페이지에 반영됩니다.
   비어 있는 칸('')은 "준비 중"으로 표시되고, 대신 의뢰서로 안내합니다.
   ===================================================================== */
window.SITE = {
  /* 사이트에 보이는 연락 이메일: 비워 두면 어디에도 표시되지 않음
     (알림 메일은 apps-script.txt 의 NOTIFY 로만 감) */
  email: '',

  /* 챗봇 "사람과 연결" 버튼: 카카오톡 채널 1:1 채팅 링크 (예: https://pf.kakao.com/_xxxxx/chat)
     비워 두면 챗봇이 의뢰서로 안내함. 한국어 페이지에서만 보임 */
  kakaoChat: 'https://pf.kakao.com/_zzhxiX/chat',

  /* 가격 페이지 · 화상 상담 예약 시간 (한국 시간)
     weekday: 평일에 고를 수 있는 시간 · weekend: 토 · 일 (비워 두면 그날은 예약 안 받음)
     leadDays: 오늘부터 며칠 뒤부터 예약 가능 · days: 며칠치를 보여 줄지 · off: 쉬는 날 ['2026-10-03', …] */
  callSlots: {
    weekday: ['19:30', '20:30'],
    weekend: ['10:00', '11:00', '14:00', '15:00'],
    leadDays: 2,
    days: 14,
    off: []
  },

  /* 30분 화상 상담 예약 페이지 주소 (상담비 결제 후 고르는 곳)
     구글 캘린더 "예약 일정(Appointment schedule)" 공개 링크, 또는 Calendly · Cal.com 링크 */
  bookingUrl: '',

  /* 의뢰서가 저장될 주소: apps-script.txt 를 구글 Apps Script 로 배포한 웹앱 주소 (…/exec) */
  formEndpoint: 'https://script.google.com/macros/s/AKfycbwFhU6zQ5BcdXBtYmLWH-W5DcEU0z18djLZMmPzmI7WBJIYUW9l-H8sY_TEDrL0cT0N/exec',

  /* 결제 링크: 비워 두면 "준비 중"으로 표시되고 의뢰서로 안내 */
  pay: {
    callCard: 'https://www.payapp.kr/L/z4lfH4',    // 30분 화상 상담 20만 원 · 국내 카드 결제 링크 (페이앱 · 토스페이먼츠 링크페이 등)
    callPaypal: '',  // 30분 화상 상담 20만 원 · 해외 PayPal 결제 링크
    krCard: 'https://www.payapp.kr/L/z4lfL9',      // 운영 진단 300만 원 · 국내 카드 결제 링크
    buildCard: 'https://www.payapp.kr/L/z4lfM4',   // 제작 · 팀장님 패키지 1,800만 원 · 국내 카드 결제 링크 (계좌이체 권장)
    paypal: '',      // 운영 진단 300만 원 · 해외 PayPal 결제 링크 (paypal.com/ncp/payment/… 또는 paypal.me/…)
    subCard: '',     // 월 구독 50만 원 · 국내 카드 정기결제 링크 (페이앱 정기결제 등)
    subPaypal: ''    // 월 구독 50만 원 · PayPal 구독(Subscriptions) 결제 링크
  },

  /* 사업자 정보 (카드 결제 심사와 전자상거래법상 사이트 아래에 표시해야 함) */
  business: {
    name: '',          // 상호
    owner: '',         // 대표자
    regNo: '',         // 사업자등록번호
    mailOrderNo: '',   // 통신판매업 신고번호
    address: '',       // 사업장 주소
    phone: ''          // 연락처 (선택)
  }
};
