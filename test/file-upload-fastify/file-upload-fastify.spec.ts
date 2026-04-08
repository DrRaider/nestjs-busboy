import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { INestApplication } from "@nestjs/common";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { request, spec } from "pactum";
import { AppModule } from "./app/app.module";

describe("Busboy File Upload - Fastify", () => {
  let app: INestApplication;

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
    await app.close();
  });

  it("Single File Upload", async () => {
    await spec()
      .post("/single")
      .withFile("file", join(process.cwd(), "package.json"))
      .expectStatus(201)
      .expectBody({ success: true })
      .toss();
  });

  it("Multiple File Uploads", async () => {
    await spec()
      .post("/multiple")
      .withFile("file", join(process.cwd(), "package.json"))
      .withFile("file", join(process.cwd(), "biome.json"))
      .withMultiPartFormData("nonFile", "Hello World!")
      .expectStatus(201)
      .expectBody({ success: true, fileCount: 2 })
      .toss();
  });

  it("Any File Upload", async () => {
    await spec()
      .post("/any")
      .withFile("fil", join(process.cwd(), "package.json"))
      .withMultiPartFormData("field", "value")
      .expectStatus(201)
      .expectBody({ success: true, fileCount: 1 })
      .toss();
  });

  it("File Fields Upload - profile field", async () => {
    await spec()
      .post("/fields")
      .withFile("profile", join(process.cwd(), "package.json"))
      .expectStatus(201)
      .expectBody({ success: true, fileCount: 1 })
      .toss();
  });

  it("File Fields Upload - avatar field", async () => {
    await spec()
      .post("/fields")
      .withFile("avatar", join(process.cwd(), "package.json"))
      .expectStatus(201)
      .expectBody({ success: true, fileCount: 1 })
      .toss();
  });

  it("File Fields Upload - profile and avatar fields", async () => {
    await spec()
      .post("/fields")
      .withFile("profile", join(process.cwd(), "package.json"))
      .withFile("avatar", join(process.cwd(), "package.json"))
      .expectStatus(201)
      .expectBody({ success: true, fileCount: 2 })
      .toss();
  });

  it("DiskStorage destination callback can read form fields from req.body", async () => {
    const folder = "test-dest-from-field";
    await spec()
      .post("/dest-from-field")
      .withMultiPartFormData("folder", folder)
      .withFile("file", join(process.cwd(), "package.json"))
      .expectStatus(201)
      .expectJsonMatch({ destination: join(tmpdir(), folder) })
      .toss();
    await rm(join(tmpdir(), folder), { recursive: true, force: true });
  });

  it("Global interceptor can serialize req.body without circular reference error", async () => {
    await spec()
      .post("/intercept")
      .withFile("file", join(process.cwd(), "package.json"))
      .expectStatus(201)
      .expectBody({ success: true })
      .toss();
  });

  it("No File Upload - 201, no file", async () => {
    await spec()
      .post("/none")
      .withMultiPartFormData("no", "files")
      .expectStatus(201)
      .expectBody({ success: true })
      .toss();
  });

  it("No File Upload - 400, with file", async () => {
    await spec()
      .post("/none")
      .withFile("file", join(process.cwd(), "package.json"))
      .expectStatus(400)
      .toss();
  });
});
