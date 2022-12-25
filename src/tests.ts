import request from "supertest";
import assert from "assert";
import jsonschema from "jsonschema";

import app from "./server";
import { productList } from "./products/api-schemas";

(async () => {
  console.log(`Starting tests\r\n\r\n`);

  let swagger: JSON | undefined = undefined;
  console.log(`Test Get swagger.json`);
  await request(app)
    .get("/swagger.json")
    .expect("Content-Type", /json/)
    .expect(200)
    .then((res) => {
      swagger = res.body;
      assert(swagger, "Expected swagger.json");
    });

  request(app)
    .get("/products")
    .expect("Content-Type", /json/)
    .expect(200)
    .then((res) => {
      assert(
        productList.safeParse(res.body).success,
        "Product List zod schema validation failed0"
      );
    });
})();
