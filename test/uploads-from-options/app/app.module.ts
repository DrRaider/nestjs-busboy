import { join } from "node:path";
import { Module } from "@nestjs/common";
import { BusboyModule } from "../../../src";
import { AppController } from "./app.controller";

@Module({
  imports: [
    BusboyModule.register({
      dest: join(process.cwd(), "uploads"),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
