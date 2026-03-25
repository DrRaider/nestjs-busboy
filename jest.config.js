/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["ts", "js", "json"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
  setupFiles: ["reflect-metadata"],
  testEnvironment: "node",
  rootDir: ".",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
