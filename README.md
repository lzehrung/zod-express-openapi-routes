## Overview

- Very WIP 🚧👷‍♂️
- Anchor API Zod schemas to app interface(s) (using `tozod`)
- Validate and parse REST request inputs according to Zod schemas (`zod-express-middleware`)
- Minimize code duplication between express routes, request validation, and OpenAPI definitions (on top of `@asteasolutions/zod-to-openapi`)

## Highlights
- Experiments: [src/open-api-helpers.ts](src/open-api-helpers.ts) - facilitate reuse of types and route configuration (including validation) between `zod`, `@asteasolutions/zod-to-openapi`, `zod-express-middleware`, and `express`
- Sample Zod API Schemas: [src/products/api-schema.ts](src/products/api-schema.ts)
- Sample (typed) API route definitions: [src/products/product-routes.ts](src/products/product-routes.ts)
- Sample controller/express route handlers: [src/products/product-routes.ts](src/products/product-routes.ts)

## Run the example

- clone the repository
- `npm install`
- `npm run dev`
- open the generated OpenAPI docs http://localhost:3000/api-docs
- get a resource http://localhost:3000/api/products/1
- use an invalid url segment http://localhost:3000/api/products/abc

Libraries

- [zod-express-middleware](https://www.npmjs.com/package/zod-express-middleware) - use Zod schemas to validate request inputs (route params, body, query string)
- [@asteasolutions/zod-to-openapi](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi) - use Zod schemas to define OpenAPI schemas
- [openapi3-ts](https://www.npmjs.com/package/openapi3-ts) - define OpenAPI 3.0.0 schemas in TypeScript (used by `@asteasolutions/zod-to-openapi`)
- [tozod](https://www.npmjs.com/package/tozod) - validate that a zod schema conforms to a TypeScript interface/type
