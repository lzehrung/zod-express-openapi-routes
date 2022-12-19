import request from "supertest";
import assert from "assert";

import app from "./server";

request(app)
  .get("/products")
  .expect("Content-Type", /json/)
  .expect(200)
  .then((res) => {
    assert(Array.isArray(res.body), "response should be an array");
  });
