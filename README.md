## Overview

- WIP 🚧👷‍♂️
- Find an ergonomic way (minimize boilerplate and code duplication) to get typed express route handlers and an OpenAPI
  schema at the same time
- Anchor API Zod schemas to app interface(s) (using `tozod`)
- Validate and parse REST request inputs according to Zod schemas (`@zodios/express`)
- Minimize code duplication and brittleness between express routes, request validation, and OpenAPI definitions

## Highlights

- Helpers to adapt existing team code style: [src/open-api-helpers.ts](src/zodios-helpers.ts)
- Sample zod schemas for business domain objects: [src/products/api-schemas.ts](src/products/api-schemas.ts)
- Sample API endpoint + express route definitions
  via `@zodios/openapi`: [src/products/products-routes.ts](src/products/products-routes.ts)
- Sample typed, type-hinted, and input validated route handlers
  via `@zodios/express`: [src/products/products-controller.ts](src/products/products-controller.ts)

## Run the example

- clone the repository
- `npm install`
- `npm run dev`
- open the generated OpenAPI docs http://localhost:3250/api-docs
- get a resource http://localhost:3250/products/1
- use an invalid url segment http://localhost:3250/products/abc

Key Dependencies

- [@zodios/core](http://www.npmjs.com/package/@zodios/core), [@zodios/express](http://www.npmjs.com/package/@zodios/express), [@zodios/openapi](http://www.npmjs.com/package/@zodios/openapi) -
  define express routes, validate input, fully type and type-hint request handlers, generate OpenAPI definition of
  resources
- [tozod](https://www.npmjs.com/package/tozod) - validate that a zod schema conforms to a TypeScript interface/type;
  anchor API schemas to business domain types
- [openapi3-ts](https://www.npmjs.com/package/openapi3-ts) - define OpenAPI 3.0.0 schemas in TypeScript
