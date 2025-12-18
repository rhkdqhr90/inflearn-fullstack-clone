# 6주차 미션 - 나만의 인프런 확장하기 

---
## 📋새롭게 추가한 기능
- [슬라이드 배너] (#슬라이드배너)
- [문의하기] (#문의하기)
- [챌린지] (챌린지)


## 슬라이드 배너 

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
- 강의가 있거나 가격이 0원이면  학습 페이지, 강의가 없다면 장바구니(/carts)이동

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




