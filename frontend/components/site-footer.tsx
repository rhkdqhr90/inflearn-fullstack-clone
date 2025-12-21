import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="bg-gray-800 text-gray-300 w-full">
      <div className="max-w-[1460px] mx-auto px-6 py-6">
        {/* 메인 푸터 콘텐츠 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-2">
          {/* 인프런 */}
          <div>
            <h3 className="text-white font-semibold mb-2">인프런</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  인프런 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/feed"
                  className="hover:text-white transition-colors"
                >
                  인프런 피드
                </Link>
              </li>
              <li>
                <Link
                  href="/roadmap"
                  className="hover:text-white transition-colors"
                >
                  수강전 모여보기
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors"
                >
                  블로그
                </Link>
              </li>
            </ul>
          </div>

          {/* 신청하기 */}
          <div>
            <h3 className="text-white font-semibold mb-4">신청하기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/instructor/apply"
                  className="hover:text-white transition-colors"
                >
                  지식공유참여
                </Link>
              </li>
              <li>
                <Link
                  href="/mentoring/apply"
                  className="hover:text-white transition-colors"
                >
                  멘토링 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/service"
                  className="hover:text-white transition-colors"
                >
                  인프런 비즈니스
                </Link>
              </li>
              <li>
                <Link
                  href="/recruit"
                  className="hover:text-white transition-colors"
                >
                  인프런 채용
                </Link>
              </li>
              <li>
                <Link
                  href="/partnership"
                  className="hover:text-white transition-colors"
                >
                  인프런 파트너십 파트너스
                </Link>
              </li>
            </ul>
          </div>

          {/* 코드 등록 */}
          <div>
            <h3 className="text-white font-semibold mb-4">코드 등록</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/code/student"
                  className="hover:text-white transition-colors"
                >
                  수강코드 등록
                </Link>
              </li>
              <li>
                <Link
                  href="/code/frontend"
                  className="hover:text-white transition-colors"
                >
                  프런트코드 등록
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객센터 */}
          <div>
            <h3 className="text-white font-semibold mb-4">고객센터</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/support"
                  className="hover:text-white transition-colors"
                >
                  공지사항
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition-colors"
                >
                  자주묻는 질문
                </Link>
              </li>
              <li>
                <Link
                  href="/center"
                  className="hover:text-white transition-colors"
                >
                  지원센터 신고센터
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="hover:text-white transition-colors"
                >
                  수료증 확인
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  강의 · 기능요청
                </Link>
              </li>
            </ul>
          </div>

          {/* 인프런 */}
          <div>
            <h3 className="text-white font-semibold mb-4">인프런</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors"
                >
                  인프런 시Log
                </Link>
              </li>
              <li>
                <Link
                  href="/use"
                  className="hover:text-white transition-colors"
                >
                  인프런 채용중
                </Link>
              </li>
              <li>
                <Link
                  href="/store"
                  className="hover:text-white transition-colors"
                >
                  인프런 스토리
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="hover:text-white transition-colors"
                >
                  인프런 팀노트
                </Link>
              </li>
              <li>
                <Link
                  href="/service"
                  className="hover:text-white transition-colors"
                >
                  IT 인재 채용 서비스
                </Link>
              </li>
            </ul>
          </div>
          {/* 인프런 비즈니스 버튼 & 앱 다운로드 */}
          <div className="flex flex-col justify-between items-center mb-2 pb-3 ">
            <div className="text-center">
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-3 rounded-lg font-semibold transition-colors">
                인프런 비즈니스 →
              </button>
            </div>
            <div className="text-center mt-3 item-center justify-center">
              <div className="w-15 h-15 bg-white rounded-lg p-2 mb-2">
                {/* QR 코드 플레이스홀더 */}
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  QR
                </div>
              </div>
            </div>
            <p className="text-xs">Download App</p>
          </div>
        </div>

        {/* 회사 정보 */}
        <div className="flex justify-between border-t-2 border-t-gray-700 mb-10">
          <div className="mb-2 mt-2">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/images/inflearn_public_logo.svg"
                alt="인프런"
                width={100}
                height={30}
                className="brightness-200"
              />
              <div className="flex gap-4 text-xs">
                <Link href="/privacy" className="hover:text-white">
                  개인정보처리방침
                </Link>
                <span>|</span>
                <Link href="/terms" className="hover:text-white">
                  이용약관
                </Link>
                <span>|</span>
                <Link href="/hiring" className="hover:text-white">
                  We Are Hiring
                </Link>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>(주)인프랩 | 대표자: 이형주 | 사업자번호: 499-81-00362</p>
              <p>
                통신판매: 2018-경기성남-0652 | 개인정보보호책임자: 이종욱 |
                이메일:{" "}
                <a href="mailto:info@inflearn.com" className="hover:text-white">
                  info@inflearn.com
                </a>
              </p>
              <p>
                전화번호: 070-4948-1181 | 주소:경기도 성남시 분당구 판교28번길
                20 3층 5호
              </p>
              <p className="text-gray-500 mt-4">©INFLAB. ALL RIGHTS RESERVED</p>
            </div>
          </div>
          {/* 소셜 미디어 아이콘 */}
          <div className="flex gap-4 mt-2 h-10">
            <a
              href="https://blog.inflearn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              aria-label="블로그"
            >
              B
            </a>
            <a
              href="https://instagram.com/inflearn__"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              aria-label="인스타그램"
            >
              📷
            </a>
            <a
              href="https://www.youtube.com/@inflearn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              aria-label="유튜브"
            >
              ▶
            </a>
            <a
              href="https://facebook.com/inflearn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              aria-label="페이스북"
            >
              f
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
