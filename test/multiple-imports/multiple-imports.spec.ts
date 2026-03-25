import { FastifyAdapter } from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { AppModule } from "./app/app.module";

describe("Multiple Import Tests", () => {
  it("Should boot without conflict", async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = modRef.createNestApplication(new FastifyAdapter());
    await app.listen(0);
    expect(app).toBeDefined();
    await app.close();
  });
});
