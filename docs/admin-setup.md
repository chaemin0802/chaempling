# `/admin` 세팅 가이드

이 사이트는 Payload CMS를 써서, `/admin` 에서 글/사진/영상 업로드·수정·삭제를 할 수 있습니다. 방문자는 여전히 기존 프론트(만두 스크롤, 포트폴리오)만 보고, 편집은 본인만 로그인해서 합니다.

## 처음 한 번만 할 것

```bash
# 1) 설치 (이미 되어 있으면 스킵)
npm install

# 2) 환경변수 확인 — .env.local에 이미 dev 기본값 있음
#    PAYLOAD_SECRET=<긴 랜덤 문자열>
#    DATABASE_URI=file:./payload.db

# 3) dev 서버
npm run dev
```

그 다음 브라우저에서:

- **http://localhost:3000/admin** — 첫 방문 시 자동으로 "Create first user" 화면이 뜸. 이메일·비밀번호 입력하면 곧바로 관리자 계정 생성.
- **http://localhost:3000** — 프론트(샘플 데이터로 보임, DB 비어 있을 때 폴백).

DB에 글을 하나라도 올리면 프론트는 DB 데이터로 바뀝니다 (60초 캐시 후).

## 일상 사용법

1. `/admin`에 접속해 로그인
2. **Work** 컬렉션에서 새 글 만들기:
   - title, titleKr (한국어 제목)
   - slug (URL 경로 — 예: `orbit-identity`)
   - category, year, tools
   - cover (이미지 드래그&드롭)
   - **본문(Body)** — 리치 에디터로 글·이미지·영상 섞어서 작성. 이미지/영상은 그대로 끌어다 놓으면 업로드됨.
   - published 체크하면 공개, 해제하면 비공개
3. **About / Contact**는 Globals 메뉴에서 한 번 쓰고 계속 수정.
4. 저장하면 프론트는 최대 60초 안에 반영 (페이지 `revalidate = 60`).

## 배포 (프로덕션)

로컬 SQLite 파일과 로컬 업로드는 Vercel 같은 서버리스 환경에선 유지 안 됩니다. 배포 시 두 가지를 교체:

### 1) 데이터베이스: Postgres
무료 옵션: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Vercel Postgres](https://vercel.com/storage/postgres)

```bash
npm install @payloadcms/db-postgres
```

`payload.config.ts`에서 adapter 교체:
```ts
import { postgresAdapter } from '@payloadcms/db-postgres';
// db: sqliteAdapter(...) 대신
db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } }),
```

Vercel 환경변수에 `DATABASE_URI=postgres://...` 넣기.

### 2) 미디어 스토리지: Vercel Blob (또는 S3)
```bash
npm install @payloadcms/storage-vercel-blob
```

`payload.config.ts`:
```ts
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';

plugins: [
  vercelBlobStorage({
    collections: { media: true },
    token: process.env.BLOB_READ_WRITE_TOKEN,
  }),
],
```

Vercel 대시보드 → Storage → Blob 생성 → `BLOB_READ_WRITE_TOKEN` 자동 주입됨.

### 3) PAYLOAD_SECRET
Vercel 환경변수에 긴 랜덤 문자열 (`openssl rand -hex 32`) 설정.

## 비밀번호 변경

1. `/admin` 로그인
2. 우상단 프로필 → Account
3. "Change Password"

## 비밀번호 잊었을 때

```bash
sqlite3 payload.db "DELETE FROM users;"  # SQLite 개발용
```

그 뒤 `/admin`에 다시 접속하면 첫 관리자 생성 화면이 다시 뜸.

Postgres라면 `DELETE FROM users` 를 DB 콘솔에서.
