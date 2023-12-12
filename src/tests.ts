import request from 'supertest';
import assert from 'assert';
import OpenAPISchemaValidator from 'openapi-schema-validator';

import app from './server';
import { productList } from './products/api-schemas';

(async () => {
  console.log(`Starting tests\r\n\r\n`);

  console.log(`get swagger.json`);
  await request(app)
    .get('/api/swagger.json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      assert(!!res.body, `expected swagger.json`);

      const openapiValidator = new OpenAPISchemaValidator({
        version: 3,
      });
      const validationResults = openapiValidator.validate(res.body);
      assert(
        validationResults.errors.length === 0,
        failMsg(`expected no swagger.json validation errors`, validationResults.errors)
      );
      console.log(`pass!\r\n`);
    })
    .catch((err) => {
      console.error(err);
    });

  console.log(`get list`);
  request(app)
    .get('/api/products')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      assert(
        productList.safeParse(res.body).success,
        failMsg(`get list zod schema validation failed`, res.body)
      );
      console.log(`pass!\r\n`);
    })
    .catch((err) => {
      console.error(err);
    });
})();

function failMsg(msg: string, data: unknown) {
  return `${msg}\r\n${JSON.stringify(data, null, 2)}`;
}
