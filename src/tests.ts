import request from 'supertest';
import assert from 'assert';
import OpenAPISchemaValidator from 'openapi-schema-validator';

import server from './server';
import { productList } from './products/api-schemas';
import { SafeParseError } from 'zod';

(async () => {
  console.log(`Starting tests\r\n\r\n`);

  console.log(`get and validate swagger.json`);
  await request(server)
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

  console.log(`get product list`);
  request(server)
    .get('/api/products')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      const result = productList.safeParse(res.body);
      assert(
        result.success,
        failMsg(`get list zod schema validation failed`, (result as SafeParseError<unknown>).error)
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
