## Overview

- Very WIP 🚧👷‍♂️
- Anchor API Zod schemas to DB model interface (using tozod)
- Validate and parse API request inputs according to Zod schemas (zod-express-middleware)
- Define API in one place for both express routing, OpenAPI documentation, and request validation (extensions to @asteasolutions/zod-to-openapi)
- Minimize code duplication (express, openapi, request validation)

## Key Files
- API Zod Schemas: [src/products/api-schema.ts](src/products/api-schema.ts)
- Typed API route definitions: [src/products/product-routes.ts](src/products/product-routes.ts)
- Helpers that extend @asteasolutions/zod-to-openapi: [src/open-api-helpers.ts](src/open-api-helpers.ts) (these allow reuse of types and route configuration)


Libraries

- [zod-express-middleware](https://www.npmjs.com/package/zod-express-middleware) - use Zod schemas to validate request inputs (route params, body, query string)
- [@asteasolutions/zod-to-openapi](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi) - use Zod schemas to define OpenAPI schemas
- [openapi3-ts](https://www.npmjs.com/package/openapi3-ts) - define OpenAPI 3.0.0 schemas in TypeScript (used by `@asteasolutions/zod-to-openapi`)
- [tozod](https://github.com/colinhacks/tozod) - validate that a zod schema conforms to a TypeScript interface/type