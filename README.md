## Overview

- Find an ergonomic way (minimize boilerplate and code duplication) to get typed, zod-validated express routes and an OpenAPI
  schema at the same time
- Minimize code duplication and boilerplate between express routes, request parameter validation, and OpenAPI definitions

## Highlights

- base `Controller` class that consolidates creation of express route, zod-validated request parameters, OpenAPI definition, and getting a typed `express.RouteHandler`: [src/zod-openapi-express-routes/zod-api.controller.ts](src/zod-openapi-express-routes/zod-api.controller.ts)
- example controller instance: [src/products/products.controller.ts](src/products/products.controller.ts)
- example request parameter zod schemas: [src/products/api-schemas.ts](src/products/api-schemas.ts)
- example manually-defined file upload route using [multer](https://github.com/expressjs/multer) for uploads: [src/products/products.controller.ts#L148](src/products/products.controller.ts#L148)

## Run the example

- clone the repository
- `npm install`
- `npm run start`
- open the generated OpenAPI docs http://localhost:3250/api/reference
- open the generated `swagger.json` http://localhost:3250/api/swagger.json
- get a single resource http://localhost:3250/api/products/1
- an invalid path parameter results in validation errors http://localhost:3250/api/products/abc

## Dependencies

- `@anatine/zod-openapi`: generates request parameter OpenAPI definitions from zod schemas

## Limitations

- file upload routes must be documented manually
- haven't tested nested routers / routes
- not extensively tested
