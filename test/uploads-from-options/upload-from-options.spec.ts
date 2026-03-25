import { unlink } from "node:fs/promises";
import { join } from "node:path";
import type { INestApplication } from "@nestjs/common";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { request, spec } from "pactum";
import { AppModule } from "./app/app.module";

describe("Busboy File Upload with Module Options", () => {
  let app: INestApplication;
  let filePath = "";

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modRef.createNestApplication(new FastifyAdapter());
    await app.listen(0);
    const url = await app.getUrl();
    request.setBaseUrl(url.replace("[::1]", "localhost"));
  });

  afterAll(async () => {
    await unlink(join(process.cwd(), "uploads", filePath));
    await app.close();
  });

  it("should upload the file to the disk", async () => {
    await spec()
      .post("/")
      .withFile("file", join(process.cwd(), "package.json"))
      .expectStatus(201)
      .returns(({ res }) => {
        filePath = (res.json as any).filename;
      })
      .toss();
  });
});
