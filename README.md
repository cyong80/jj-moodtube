# MoodTube 🎵😊

표정 인식 기반 음악 추천 웹 애플리케이션

## 주요 기능

- 웹캠을 통한 실시간 표정 인식
- AI 기반 감정 분석 (Google Gemini)
- 감정에 맞는 YouTube 음악 플레이리스트 자동 생성
- 모던한 UI/UX

## 기술 스택

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **AI**: Google Gemini API
- **API**: YouTube Data API v3
- **UI Components**: Radix UI, Lucide Icons, Sonner
- **Animation**: Framer Motion

## 로컬 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/cyong80/jj-moodtube.git
cd jj-moodtube
```

### 2. 의존성 설치

```bash
yarn install
```

### 3. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```bash
cp env.sample .env.local
```

필수 환경변수:
- `GOOGLE_GEMINI_API_KEY`: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급
- `YOUTUBE_API_KEY`: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 발급

### 4. HTTPS 인증서 생성 (로컬 개발용)

```bash
mkdir certificates
cd certificates
# mkcert 사용 (권장)
mkcert localhost
mv localhost.pem localhost-cert.pem
mv localhost-key.pem localhost-key.pem
```

### 5. 개발 서버 실행

```bash
yarn dev
```

브라우저에서 [https://localhost:3000](https://localhost:3000) 접속

## Vercel 배포

상세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

### 간단 요약

1. [Vercel](https://vercel.com)에서 GitHub 저장소 연결
2. 환경변수 설정:
   - `GOOGLE_GEMINI_API_KEY`
   - `YOUTUBE_API_KEY`
3. 배포 버튼 클릭

## 프로젝트 구조

```
jj-moodtube/
├── app/
│   ├── actions.ts          # 서버 액션 (AI 감정 분석)
│   ├── page.tsx            # 메인 페이지
│   └── layout.tsx          # 레이아웃
├── components/
│   ├── MusicPlayer.tsx     # 음악 플레이어 컴포넌트
│   └── ui/                 # UI 컴포넌트들
├── server.js               # 로컬 HTTPS 서버
├── vercel.json             # Vercel 배포 설정
└── env.sample              # 환경변수 예시
```

## 라이선스

MIT

## 문의

문제가 있거나 제안사항이 있으시면 이슈를 등록해주세요.
