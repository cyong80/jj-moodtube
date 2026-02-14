// Supabase DB 연결을 위한 Prisma 설정
// .env.local 또는 .env에 DATABASE_URL을 설정하세요
import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js 프로젝트: .env 먼저 로드 후 .env.local로 덮어쓰기
dotenv.config();
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "",
  },
});
