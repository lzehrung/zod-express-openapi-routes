import request from "supertest";
import assert from "assert";
import OpenAPISchemaValidator from "openapi-schema-validator";

import app from "./server";
import { productList } from "./products/api-schemas";

(async () => {
  console.log(`Starting tests\r\n\r\n`);

  console.log(`get swagger.json`);
  await request(app)
    .get("/swagger.json")
    .expect("Content-Type", /json/)
    .expect(200)
    .then((res) => {
      const swagger = JSON.parse(res.body);
      assert(!!swagger, `expected swagger.json`);

      const openapiValidator = new OpenAPISchemaValidator({
        version: 3,
      });
      const validationResults = openapiValidator.validate(swagger);
      assert(
        validationResults.errors.length === 0,
        `expected no swagger.json validation errors:\r\n${JSON.stringify(
          validationResults.errors,
          null,
          2
        )}`
      );
    });

  console.log(`get list`);
  request(app)
    .get("/products")
    .expect("Content-Type", /json/)
    .expect(200)
    .then((res) => {
      assert(
        productList.safeParse(res.body).success,
        `get list zod schema validation failed:\r\n${JSON.stringify(
          JSON.parse(res.body),
          null,
          2
        )}`
      );
    });
})();
