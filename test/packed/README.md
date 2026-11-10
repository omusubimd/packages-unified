# Packed consumer check

Run `npm run test:packed` after `npm ci`. The check runs the real `prepack` hooks,
installs all five local tarballs in an isolated temporary consumer, and checks
ESM exports, micromark HTML, mdast → hast, remark → rehype, and TypeScript NodeNext
with declaration checking enabled. It requires registry access for the packages'
external dependencies; it never publishes packages.

The consumer rejects workspace symlinks. Controlled removal of a JavaScript
entry and a declaration entry must fail the runtime and type checks, respectively.
All temporary artifacts and the isolated installation are removed on completion
or failure. Normal prepack build outputs are regenerated in the repository; the
missing-export controls modify only the isolated installed copies, never source files.
