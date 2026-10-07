# nestjs-busboy

## 2.0.0

### Major Changes

- 42ec176: Support NestJS 12: `@nestjs/common`, `@nestjs/platform-express` and `@nestjs/platform-fastify` peer ranges now include `^12.0.0` (9, 10 and 11 stay supported). On NestJS 12, which ships ESM-only, the CommonJS build loads it through Node's `require(esm)` (Node >= 20.19 or >= 22.12, as NestJS 12 itself requires).

## 1.0.2

### Patch Changes

- 63a268c: Update dependency dependabot/fetch-metadata to 3

## 1.0.1

### Patch Changes

- 2d0be4e: Fix raw multipart stream stored on `req.rawMultipartStream` instead of `req.body` to prevent circular reference errors in global interceptors (#12). Populate `req.body` incrementally during parsing so `DiskStorage` `destination`/`filename` callbacks can access form fields parsed before the file part (#13).
