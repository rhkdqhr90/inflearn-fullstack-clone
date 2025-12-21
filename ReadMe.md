# 6주차 미션 - 나만의 인프런 확장하기

---

## 📋새롭게 추가한 기능

- [슬라이드 배너] (#슬라이드배너)
- [문의하기] (#문의하기)
- [챌린지] (#챌린지)
- [멘토링] (#멘토링)
- [학습이어보기] (#학습이어보기)
- [수정사항] (#수정사항)

## 슬라이드배너

- embla-carousel-react 사용
- components/home-banner-side.tsx 추가

## 문의하기

- app/chnneltalk, components/inquiry, lib/mock-ai-service추가
- /channeltalk
- getMockAIResponse 통해 Mock-ai로 정해진 답변만 출력 하는 간단한 질문과 답변 프로세스
- 추후 실제 LLM 연동 혹은 RAG 프로젝트로 인프런의 내용을 학습 계획

## 챌린지

### 기획

- 챌린지는 지식공유 탭 강의 관리에서 생성
- 하나의 강의에 하나의 챌린지만 가능 하도록 기획
- 최대 참가자 수, 모집 시작,종료, 챌린지 시작,종료, 챌린지 소개 작성
- 강의가 있거나 가격이 0원이면 학습 페이지, 강의가 없다면 장바구니(/carts)이동

#### 백엔드

- Challenge, ChallengeParticipant 스키마 추가
- Challenge : relation Course, ChallengeParticipant[]
- ChallengeParticipant: ralation Challenge, User, @unique([challengeId, userId])
- backend/src/challenges 추가
- CRUD, findAll,findOneBySlug,join,getParticipants 추가

1. 챌린지 목록 페이지 (/challenges)

- app/challenges 폴더 추가
- 전체, 모집중, 진행중, 종료

2. 챌린지 상세 페이지 (/challenges/[slug])

- app/challenges/[slug]폴더 추가
- 강의소개 커리큘럼 수강평 (새소식 제외)

3. 챌린지 관리

- frontend/app/course/[id]/challenge 추가
- 강의 관리 페이지 에서 챌린지 생성 및 수정 삭제

## 멘토링

### 기획

- 멘토(지식공유자) 와 멘티(학습자)를 1:1 연결하는 기능이다.
- 지식공유자의 페이지에 는 기간내에 하나의 멘토링 만 만들 수 있다.
- 멘토는 멘토링 관리 페이지에서 수락 , 거절을 한다.
- 멘티는 멘토링 신청 후 멘토의 수락, 거절을 기다린다.
- 이후 새소식 알림을 만들어 수락, 거절 을 알린다.

### 백엔드

- Mentoring,MentoringSchedule,MentoringApplication 작성
- 멘토링 생성/수정/삭제 , 멘토링 조회, 멘토링 신청,멘토링 수락/거절
- 지식공유자는 기간내 1개의 멘토링만 생성 가능
- 스케쥴 기반 예약

### 프론트 엔드

- frontend/app/mentoring,frontend/app/mentoring/[id]/apply 추가
- frontend/app/instructor/mentoring/ 추가

## 학습이어보기

### 기획

- 기존 findAllMyCourses의 기능확장
- 사용자가 수강신청한 모든 강의를 가져옴
- 각 lecture별 시청했는지를 가져와 전체 lecture 나눔

### 백엔드

- findAllMyCourses 수정

### 프론트

-frontend/components/continue-learning-section.tsx 생성

- 1분,60분,24시간,30일 일기준 학습 시간 추가

## 수정사항

- course-card.tsx 리뷰 가져오기(rating, totalReview)
- 강의 만들기 시 카테고리 포함 frontend/app/course/[id]/edit/course_info
- site-footer(텍스트만) 생성
- 각종 버그 수정 (로그인 위치)
