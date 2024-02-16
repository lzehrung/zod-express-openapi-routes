import {ResponseObject} from "openapi3-ts/oas31";
import {RouteResponses} from "../zod-openapi-express-routes/zod-api.controller";

export const errorFormat: ResponseObject = {
  description: 'Error response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
          },
        },
      },
    },
  },
};

export const defaultResponses: RouteResponses = {
  404: errorFormat,
};
