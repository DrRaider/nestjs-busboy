import { Module, type OnApplicationBootstrap } from "@nestjs/common";
// biome-ignore lint/style/useImportType: needed at runtime for NestJS DI
import { HttpAdapterHost } from "@nestjs/core";

@Module({})
export class BusboyCoreModule implements OnApplicationBootstrap {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  onApplicationBootstrap() {
    const adapter = this.httpAdapterHost.httpAdapter;
    const instance = adapter.getInstance();

    // Detect Fastify by the presence of addContentTypeParser
    if (typeof instance?.addContentTypeParser === "function") {
      // Register a regex-based content-type parser to handle multipart/form-data
      // including the boundary parameter (e.g. "multipart/form-data; boundary=xxxx").
      // This prevents Fastify v5's FST_ERR_CTP_INVALID_MEDIA_TYPE error.
      // The raw payload stream is stored on req.rawMultipartStream so that
      // global interceptors reading req.body are not affected by circular references.
      if (!instance.hasContentTypeParser("multipart/form-data")) {
        instance.addContentTypeParser(
          /^multipart\/form-data/,
          (req: any, payload: unknown, done: (err: Error | null, body?: unknown) => void) => {
            req.rawMultipartStream = payload;
            done(null, undefined);
          },
        );
      }
    }
    // Express: body-parser does not handle multipart/form-data, so no registration needed.
    // The raw req stream remains available for interceptors to pipe through busboy.
  }
}
