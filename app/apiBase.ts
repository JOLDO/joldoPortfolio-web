// Base URL for the Spring Boot backend.
//
// - Development: `.env.development` sets NEXT_PUBLIC_API_BASE=http://localhost:8080
//   so the frontend on :3000 can reach the backend on :8080.
// - Production (single EC2, Nginx in front): this stays "" (same-origin). Requests
//   go to /api and /uploads on the current host and Nginx proxies them to the
//   backend, so no CORS is involved.
//
// NEXT_PUBLIC_* values are inlined at build time.
export const API = process.env.NEXT_PUBLIC_API_BASE ?? "";