// Uploads one file through the BUILT package (dist/, CommonJS), the way a
// CommonJS consumer loads it. With NestJS 12 (ESM-only) this goes through
// Node's require(esm), which the Vitest suite (TypeScript source) never does.
// Run after `pnpm build`: node test/smoke/dist.cjs
require("reflect-metadata");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { dirname, join } = require("node:path");
const { Controller, Module, Post, UploadedFile, UseInterceptors } = require("@nestjs/common");
const { NestFactory } = require("@nestjs/core");
const { FastifyAdapter } = require("@nestjs/platform-fastify");
const { BusboyModule, FileInterceptor, memoryStorage } = require("../../dist");

class UploadController {
  upload(file) {
    return { name: file.originalname, size: file.size };
  }
}
const descriptor = Object.getOwnPropertyDescriptor(UploadController.prototype, "upload");
UploadedFile()(UploadController.prototype, "upload", 0);
UseInterceptors(FileInterceptor("file"))(UploadController.prototype, "upload", descriptor);
Post("upload")(UploadController.prototype, "upload", descriptor);
Controller()(UploadController);

class AppModule {}
Module({
  controllers: [UploadController],
  imports: [BusboyModule.register({ storage: memoryStorage() })],
})(AppModule);

(async () => {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), { logger: false });
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const boundary = "smoke";
  const payload = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="hello.txt"',
    "Content-Type: text/plain",
    "",
    "hello",
    `--${boundary}--`,
    "",
  ].join("\r\n");
  const res = await app
    .getHttpAdapter()
    .getInstance()
    .inject({
      headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
      method: "POST",
      payload,
      url: "/upload",
    });
  await app.close();

  assert.equal(res.statusCode, 201, res.body);
  assert.deepEqual(JSON.parse(res.body), { name: "hello.txt", size: 5 });
  // Not require("@nestjs/common/package.json"): v12's `exports` map hides it.
  const pkg = join(dirname(require.resolve("@nestjs/common")), "package.json");
  const { version } = JSON.parse(readFileSync(pkg, "utf8"));
  console.log(`dist smoke test passed on @nestjs/common ${version}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
