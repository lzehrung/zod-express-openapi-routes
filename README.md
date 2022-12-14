## Overview

- WIP 🚧👷‍♂️
- Find an ergonomic way (minimize boilerplate and code duplication) to get typed express route handlers and an OpenAPI
  schema at the same time
- Anchor API Zod schemas to app interface(s) (using `tozod`)
- Validate and parse REST request inputs according to Zod schemas (`@zodios/express`)
- Minimize code duplication and brittleness between express routes, request validation, and OpenAPI definitions (`@zodios/openapi`)

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
- `npm run start`
- open the generated OpenAPI docs http://localhost:3250/api/reference
- open the generated `swagger.json` http://localhost:3250/api/swagger.json
- get a single resource http://localhost:3250/api/products/1
- an invalid path parameter results in validation errors http://localhost:3250/api/products/abc

## Limitations

- path must be a constant at compile time for zodios path parameter type inference to work; unable to use template literals or concatenation for path parameters 
- haven't thought about nested express routes yet

## Dependencies

- [@zodios/core](http://www.npmjs.com/package/@zodios/core), [@zodios/express](http://www.npmjs.com/package/@zodios/express), [@zodios/openapi](http://www.npmjs.com/package/@zodios/openapi) -
  define express routes, validate input, fully type and type-hint request handlers, generate OpenAPI definition of
  resources
- [tozod](https://www.npmjs.com/package/tozod) - validate that a zod schema conforms to a TypeScript interface/type;
  anchor API schemas to business domain types
- [openapi3-ts](https://www.npmjs.com/package/openapi3-ts) - define OpenAPI 3.0.0 schemas in TypeScript
