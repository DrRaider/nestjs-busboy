---
"nestjs-busboy": minor
---

Support NestJS 12: `@nestjs/common`, `@nestjs/platform-express` and `@nestjs/platform-fastify` peer ranges now include `^12.0.0` (9, 10 and 11 stay supported). On NestJS 12, which ships ESM-only, the CommonJS build loads it through Node's `require(esm)` (Node >= 20.19 or >= 22.12, as NestJS 12 itself requires).
