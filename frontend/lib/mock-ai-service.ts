// lib/mock-ai-service.ts

interface MockResponse {
  content: string;
  suggestedActions?: string[];
}

// 카테고리별 자동 응답
const categoryResponses: Record<string, MockResponse> = {
  service: {
    content:
      "서비스 이용과 관련하여 문의주셔서 감사합니다! 😊\n\n인프런은 다양한 온라인 강의를 제공하는 플랫폼입니다. 수강신청, 결제, 환불 등 서비스 이용에 대해 궁금하신 점이 있으시면 자세히 말씀해주세요.",
  },
  mobile: {
    content:
      "모바일 앱 이용 관련 문의주셔서 감사합니다! 📱\n\n인프런 앱은 iOS와 Android 모두 지원하며, 앱스토어와 구글 플레이스토어에서 다운로드 가능합니다. 앱에서는 강의 시청, 학습 기록 관리 등을 편리하게 이용하실 수 있습니다.",
  },
  region: {
    content:
      "국가 및 지역번호 관련 문의주셔서 감사합니다! 🌏\n\n해외에서도 인프런 서비스를 이용하실 수 있습니다. 다만, 일부 강의는 저작권 문제로 특정 국가에서 시청이 제한될 수 있습니다.",
  },
  video: {
    content:
      "영상 재생 오류로 불편을 드려 죄송합니다. 🎥\n\n다음 사항을 확인해주세요:\n1. 인터넷 연결 상태\n2. 브라우저 최신 버전 업데이트\n3. 캐시 및 쿠키 삭제\n4. 다른 브라우저에서 시도\n\n문제가 지속되면 구체적인 오류 내용을 알려주세요.",
  },
  bug: {
    content:
      "서비스 오류를 발견해주셔서 감사합니다! 🔧\n\n더 나은 서비스 제공을 위해 오류 내용을 상세히 기록하겠습니다. 다음 정보를 함께 알려주시면 빠른 해결에 도움이 됩니다:\n- 발생 시간\n- 사용 중인 기기/브라우저\n- 오류 메시지 스크린샷",
  },
  challenge: {
    content:
      "챌린지 라이브 참여에 관심 가져주셔서 감사합니다! 🎯\n\n챌린지는 정해진 기간 동안 다른 수강생들과 함께 학습하는 프로그램입니다. 참여 방법:\n1. 챌린지 페이지에서 신청\n2. 시작일에 라이브 세션 참여\n3. 과제 제출 및 피드백 받기",
  },
};

// 키워드 기반 응답
const keywordResponses: Record<string, string> = {
  결제: "결제 관련 문의주셔서 감사합니다! 💳\n\n인프런은 신용카드, 체크카드, 가상계좌, 무통장입금 등 다양한 결제 수단을 지원합니다. 결제 과정에서 문제가 발생하셨나요?",
  환불: "환불 정책 관련 문의주셔서 감사합니다! 💰\n\n수강 신청 후 7일 이내, 진도율 5% 미만인 경우 전액 환불이 가능합니다. 자세한 환불 정책은 이용약관을 참고해주세요.",
  강의: "강의 관련 문의주셔서 감사합니다! 📚\n\n인프런은 프로그래밍, 데이터 사이언스, 디자인 등 다양한 분야의 강의를 제공합니다. 어떤 강의를 찾고 계신가요?",
  수강신청:
    "수강신청 방법을 안내해드리겠습니다! ✅\n\n1. 원하는 강의 페이지 접속\n2. '수강신청' 버튼 클릭\n3. 결제 진행\n4. 내 강의실에서 바로 학습 시작!",
  쿠폰: "쿠폰 사용 관련 문의주셔서 감사합니다! 🎟️\n\n쿠폰은 결제 시 할인 코드 입력란에 등록할 수 있습니다. 쿠폰마다 사용 조건과 유효기간이 다를 수 있으니 확인해주세요.",
  로그인:
    "로그인 관련 문제가 있으신가요? 🔐\n\n- 비밀번호를 잊으셨다면 '비밀번호 찾기'를 이용해주세요.\n- 이메일 인증이 필요한 경우 가입 시 사용한 이메일을 확인해주세요.\n- 소셜 로그인(구글, 카카오 등)도 지원합니다.",
  수료증:
    "수료증 발급 관련 문의주셔서 감사합니다! 📜\n\n강의를 100% 완료하시면 수료증이 자동으로 발급됩니다. 내 강의실에서 다운로드 가능합니다.",
  강사: "강사 신청에 관심 가져주셔서 감사합니다! 👨‍🏫\n\n인프런 강사로 활동하시려면 강사 신청 페이지에서 지원하실 수 있습니다. 검토 후 연락드리겠습니다.",
};

// Mock AI 응답 생성
export function generateMockAIResponse(
  message: string,
  category?: string
): string {
  // 1. 카테고리가 있으면 카테고리별 응답
  if (category && categoryResponses[category]) {
    return categoryResponses[category].content;
  }

  // 2. 키워드 매칭
  for (const [keyword, response] of Object.entries(keywordResponses)) {
    if (message.includes(keyword)) {
      return response;
    }
  }

  // 3. 기본 응답
  return `문의 주셔서 감사합니다! 😊\n\n"${message}"\n\n고객님의 문의를 확인했습니다. 담당자가 검토 후 더 자세한 답변을 드리겠습니다. 평균 응답 시간은 2-3시간 정도 소요됩니다.\n\n추가로 궁금하신 점이 있으시면 언제든 말씀해주세요!`;
}

// 응답 지연 시뮬레이션 (실제 AI처럼 보이게)
export async function getMockAIResponse(
  message: string,
  category?: string
): Promise<string> {
  // 1-2초 지연
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );
  return generateMockAIResponse(message, category);
}
