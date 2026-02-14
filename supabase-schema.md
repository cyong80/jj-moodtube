# Supabase 데이터베이스 스키마

> Supabase PostgreSQL DB 조회 결과 (2025-02-14 기준)

## public 스키마

### youtube_search_cache

유튜브 API 호출을 최소화하기 위한 캐시 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 제약조건 |
|--------|------|------|--------|----------|
| id | bigint | NO | identity (BY DEFAULT) | PRIMARY KEY |
| search_query | text | NO | - | UNIQUE |
| youtube_id | text | YES | - | - |
| title | text | YES | - | - |
| channel | text | YES | - | - |
| thumbnail | text | YES | - | - |
| created_at | timestamptz | NO | now() | - |

**RLS**: 활성화됨
