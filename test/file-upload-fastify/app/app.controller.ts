import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Body,
  type CallHandler,
  Controller,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import {
  AnyFilesInterceptor,
  diskStorage,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
  memoryStorage,
  NoFilesInterceptor,
} from "../../../src";

@Injectable()
class SerializingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    // Simulate a global interceptor that serializes req.body (e.g. for audit logging).
    // This must not throw due to circular references in a raw stream.
    JSON.stringify(req.body);
    return next.handle();
  }
}

@Controller()
export class AppController {
  @Post("single")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  uploadSingleFile(@UploadedFile() file: unknown) {
    return { success: !!file };
  }

  @Post("multiple")
  @UseInterceptors(FilesInterceptor("file", 10, { storage: memoryStorage() }))
  uploadMultipleFiles(@UploadedFiles() files: unknown[]) {
    return { success: !!files.length, fileCount: files.length };
  }

  @Post("any")
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  uploadAnyFiles(@UploadedFiles() files: unknown[]) {
    return { success: !!files.length, fileCount: files.length };
  }

  @Post("fields")
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "profile" }, { name: "avatar" }], {
      storage: memoryStorage(),
    }),
  )
  uploadFileFieldsFiles(@UploadedFiles() files: { profile?: unknown[]; avatar?: unknown[] }) {
    return {
      success: !!((files.profile?.length ?? 0) + (files.avatar?.length ?? 0)),
      fileCount: (files.profile?.length ?? 0) + (files.avatar?.length ?? 0),
    };
  }

  @Post("dest-from-field")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          // req.body is populated incrementally; fields that appeared before
          // the file part in the multipart stream are available here.
          const folder = (req.body as Record<string, string>)?.folder ?? "default";
          cb(null, join(tmpdir(), folder));
        },
      }),
    }),
  )
  uploadToFieldDest(@UploadedFile() file: { destination: string; filename: string }) {
    return { destination: file.destination };
  }

  @Post("intercept")
  @UseInterceptors(SerializingInterceptor, FileInterceptor("file", { storage: memoryStorage() }))
  uploadWithGlobalInterceptor(@UploadedFile() file: unknown) {
    return { success: !!file };
  }

  @Post("none")
  @UseInterceptors(NoFilesInterceptor())
  noFilesAllowed(
    @Body() body: Record<string, string>,
    @UploadedFiles() files: unknown[],
    @UploadedFile() file: unknown,
  ) {
    return { success: !files && !file && !!body };
  }
}
