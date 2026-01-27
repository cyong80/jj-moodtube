# Vercel 배포 가이드

## 1. Vercel 프로젝트 설정

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 연결 (cyong80/jj-moodtube)
4. 프로젝트 설정 확인
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `yarn install`

## 2. 환경변수 설정

Vercel 프로젝트 설정에서 다음 환경변수를 추가해야 합니다:

### 필수 환경변수

```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### 선택 환경변수 (추후 인증 기능용)

```
AUTH_SECRET=your_nextauth_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

## 3. API 키 발급 방법

### Google Gemini API Key
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. 생성된 키를 Vercel 환경변수에 추가

### YouTube Data API Key
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. "APIs & Services" > "Credentials" 이동
4. "Create Credentials" > "API Key" 선택
5. YouTube Data API v3 활성화
6. 생성된 키를 Vercel 환경변수에 추가

## 4. 배포

환경변수 설정 후 "Deploy" 버튼을 클릭하면 자동으로 배포됩니다.

이후 GitHub에 푸시할 때마다 자동으로 재배포됩니다.

## 5. 로컬 개발

로컬 개발 시에는 HTTPS 서버를 사용합니다:

```bash
# .env.local 파일 생성 및 환경변수 설정
cp .env.example .env.local

# 의존성 설치
yarn install

# 개발 서버 실행 (https://localhost:3000)
yarn dev
```

**참고**: 로컬 개발 시 커스텀 HTTPS 서버를 사용하지만, Vercel 배포 시에는 표준 Next.js 서버가 사용됩니다.
