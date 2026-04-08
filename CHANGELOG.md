# nestjs-busboy

## 1.0.1

### Patch Changes

- 2d0be4e: Fix raw multipart stream stored on `req.rawMultipartStream` instead of `req.body` to prevent circular reference errors in global interceptors (#12). Populate `req.body` incrementally during parsing so `DiskStorage` `destination`/`filename` callbacks can access form fields parsed before the file part (#13).
