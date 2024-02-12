## Overview

- Find an ergonomic way (minimize boilerplate and code duplication) to get typed express route handlers and an OpenAPI
  schema at the same time
- Validate and parse HTTP request inputs according to Zod schemas (`@zodios/express`)
- Minimize code duplication and brittleness between express routes, request validation, and OpenAPI definitions (`@zodios/openapi`)

## Highlights

- Helpers to adapt existing team code style: [src/zodios-helpers.ts](src/zodios-helpers.ts)
- zod schemas that define API parameters: [src/products/api-schemas.ts](src/products/api-schemas.ts)
- OpenAPI Path + express route definition
  via `@zodios/openapi`: [src/products/products.controller.ts](src/products/products.controller.ts)
- Sample typed, type-hinted, and input validated route handlers
  via `@zodios/express`: [src/products/products.controller.ts](src/products/products.controller.ts)

## Run the example

- clone the repository
- `npm install`
- `npm run start`
- open the generated OpenAPI docs http://localhost:3250/api/reference
- open the generated `swagger.json` http://localhost:3250/api/swagger.json
- get a single resource http://localhost:3250/api/products/1
- an invalid path parameter results in validation errors http://localhost:3250/api/products/abc

## Limitations

- file upload routes must be documented manually due to @zodios limitation
  - endpoint using [multer](https://github.com/expressjs/multer) for uploads: [src/products/products.controller.ts#L83](src/products/products.controller.ts#L83)
  - manually defined openapi documentation for this endpoint: [src/products/products.controller.ts#L107](src/products/products.controller.ts#L107)
  - helper to merge manually defined openapi paths: [src/zodios-helpers.ts#L59](src/zodios-helpers.ts#L59)
- path must be a constant at compile time for zodios path parameter type inference to work; unable to use template literals or concatenation for path parameters 
- haven't thought about nested express routes yet

## Dependencies

- [@zodios/core](http://www.npmjs.com/package/@zodios/core) - define express routes using zod schemas and generate an api client usable in the browser
- [@zodios/express](http://www.npmjs.com/package/@zodios/express) - validate input and fully type and type-hint express request handlers from zod schemas
- [@zodios/openapi](http://www.npmjs.com/package/@zodios/openapi) - generate OpenAPI definitions from zodios configurations
- [openapi-types](https://www.npmjs.com/package/openapi-types) - define OpenAPI 3.0.0 schemas in TypeScript
