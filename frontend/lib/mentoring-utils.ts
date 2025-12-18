// 요일 관련 유틸리티

export const DAY_NAMES_KR = ["일", "월", "화", "수", "목", "금", "토"];
export const DAY_NAMES_FULL_KR = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

/**
 * 요일 숫자를 한글로 변환
 * @param dayOfWeek 0(일요일) ~ 6(토요일)
 * @returns 한글 요일 (예: "월", "화")
 */
export function formatDayOfWeek(dayOfWeek: number): string {
  return DAY_NAMES_KR[dayOfWeek] || "?";
}

/**
 * 요일 숫자를 한글 전체 이름으로 변환
 * @param dayOfWeek 0(일요일) ~ 6(토요일)
 * @returns 한글 요일 전체 (예: "월요일", "화요일")
 */
export function formatDayOfWeekFull(dayOfWeek: number): string {
  return DAY_NAMES_FULL_KR[dayOfWeek] || "알 수 없음";
}

/**
 * 요일 범위를 한글로 변환
 * @param days 요일 배열
 * @returns 한글 요일 범위 (예: "월~금")
 */
export function formatDayRange(days: number[]): string {
  if (days.length === 0) return "";
  if (days.length === 1) return formatDayOfWeek(days[0]);

  const sorted = [...days].sort((a, b) => a - b);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // 연속된 요일인지 확인
  const isConsecutive = sorted.every((day, index) => {
    if (index === 0) return true;
    return day === sorted[index - 1] + 1;
  });

  if (isConsecutive) {
    return `${formatDayOfWeek(first)}~${formatDayOfWeek(last)}`;
  }

  return sorted.map(formatDayOfWeek).join(", ");
}

/**
 * 시간 포맷팅
 * @param time "21:00" 형식
 * @returns "오후 9시" 형식
 */
export function formatTime(time: string): string {
  if (!time) return "";

  const [hour, minute] = time.split(":").map(Number);
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

  if (minute === 0) {
    return `${period} ${displayHour}시`;
  }
  return `${period} ${displayHour}시 ${minute}분`;
}

/**
 * 시간 범위 포맷팅
 * @param startTime "21:00" 형식
 * @param endTime "22:00" 형식
 * @returns "오후 9시~10시" 형식
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";

  const start = formatTime(startTime);
  const end = formatTime(endTime);

  // 같은 오전/오후면 뒷부분만
  const startPeriod = start.split(" ")[0];
  const endPeriod = end.split(" ")[0];

  if (startPeriod === endPeriod) {
    return `${start}~${end.split(" ")[1]}`;
  }

  return `${start}~${end}`;
}

/**
 * 가격 포맷팅
 * @param price 가격
 * @returns "10,000원" 형식
 */
export function formatPrice(price: number): string {
  if (price == null || isNaN(price)) {
    return "0원";
  }
  return `${price.toLocaleString("ko-KR")}원`;
}

/**
 * 세션 시간 포맷팅
 * @param duration 시간(분)
 * @returns "1시간" 또는 "1시간 30분" 형식
 */
export function formatDuration(duration: number): string {
  if (duration == null || isNaN(duration)) {
    return "0분";
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (hours === 0) {
    return `${minutes}분`;
  }
  if (minutes === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${minutes}분`;
}

/**
 * 요일 검증
 * @param day 요일 숫자
 * @returns 유효 여부
 */
export function isValidDayOfWeek(day: number): boolean {
  return day >= 0 && day <= 6;
}
