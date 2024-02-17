import express, { NextFunction, RequestHandler, Response } from 'express';
import {
  ParameterObject,
  PathItemObject,
  PathsObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import z, { SomeZodObject, ZodNever, ZodNull, ZodSchema, ZodUndefined } from 'zod';
import { TypedRequest, validateRequest } from './request-validation.middleware';
import { generateSchema } from '@anatine/zod-openapi';

type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Define an express route with Zod-validated request parameters, query, and body.
 */
export interface RouteConfig<
  TParams extends ZodSchema = ZodSchema,
  TQuery extends ZodSchema = ZodSchema,
  TBody extends ZodSchema = ZodSchema,
> {
  /** The HTTP method for the route. */
  method: HttpMethods;

  /** The express route path in the format `/segment/:param`. Used to generate OpenAPI path definition. */
  path: string;

  /** A Zod schema for the request parameters. Used to generate OpenAPI parameter definition. */
  params?: TParams;

  /** A Zod schema for the request query. Used to generate OpenAPI parameter definition. */
  query?: TQuery;

  /** A Zod schema for the request body. Used to generate OpenAPI parameter definition. */
  body?: TBody | RequestBodyObject;

  /** OpenAPI description of the route. */
  description?: string;

  /** Define the responses for the route. */
  responses: RouteResponses;

  /** Middleware to run before the route handler. */
  middleware?: RequestHandler[];

  /** OpenAPI tags for the route. */
  tags?: string[];
}

export type RouteResponse = ZodSchema | ResponseObject;

/**
 * Define the responses for a route.
 */
export interface RouteResponses {
  [statusCode: number]: RouteResponse;
}

export interface ZodApiControllerConfig {
  /** Default OpenAPI responses for all routes. */
  defaultResponses?: RouteResponses;

  /** Express router to use for the controller. */
  router?: express.Router;
}

const defaults = {
  noContent: 'No content',
  emptyResponses: [z.never()._type, z.void()._type, z.undefined()._type],
};

const jsonContent = 'application/json';

/**
 * A controller that manages express routes and generates OpenAPI paths.
 */
export class ZodApiController {
  router: express.Router;
  openApiPaths: PathsObject = {};
  readonly defaultResponses: RouteResponses;

  constructor({ router, defaultResponses }: ZodApiControllerConfig = {}) {
    this.router = router ?? express.Router();
    this.defaultResponses = defaultResponses ?? {};
  }

  /**
   * Define an express route with Zod-validated request parameters, query,
   * and body and create OpenAPI definitions for it.
   */
  route<
    TParams extends ZodSchema = ZodSchema,
    TQuery extends ZodSchema = ZodSchema,
    TBody extends ZodSchema = ZodSchema,
  >(
    config: RouteConfig<TParams, TQuery, TBody>,
    handler: (req: TypedRequest<TParams, TQuery, TBody>, res: Response, next: NextFunction) => void,
  ): ZodApiController {
    const { method, path, params, query, body, responses, middleware = [] } = config;

    const validate = params != null || query != null || (body != null && body instanceof ZodSchema);

    const middlewares = validate
      ? [
          ...middleware,
          validateRequest({
            params,
            query,
            body: body instanceof ZodSchema ? body : undefined,
          }),
        ]
      : middleware;

    // register express route
    this.router = this.router[method](path, ...middlewares, handler);

    return this.addRouteToOpenApi({ ...config, responses: { ...this.defaultResponses, ...responses } });
  }

  private addRouteToOpenApi(config: RouteConfig): ZodApiController {
    const { method, path, params, query, body, responses, description, tags } = config;

    const openApiPath = this.convertToOpenApiPath(path);
    const pathItem: PathItemObject = this.openApiPaths[openApiPath] || {};

    const parameters = new Array<ParameterObject>();
    if (params) {
      this.addOpenApiParams('path', params, parameters);
    }
    if (query) {
      this.addOpenApiParams('query', query, parameters);
    }

    pathItem[method] = {
      description,
      tags,
      parameters,
      requestBody: body
        ? body instanceof ZodSchema
          ? {
              content: {
                [jsonContent]: {
                  schema: generateSchema(body),
                },
              },
              required: !body.isOptional(),
              description: body.description,
            }
          : body
        : undefined,
      responses: {},
    };

    Object.entries(responses).forEach(([statusCode, response]: [string, RouteResponse]) => {
      if (pathItem[method]?.responses) {
        let responseDef = response;
        if (response instanceof ZodSchema) {
          const typeName = response._type;
          if (defaults.emptyResponses.includes(typeName)) {
            responseDef = { description: defaults.noContent };
          } else {
            responseDef = {
              description: '',
              content: {
                [jsonContent]: {
                  schema: generateSchema(response as SomeZodObject),
                },
              },
            };
          }
        }

        pathItem[method]!.responses = {
          [+statusCode]: responseDef,
          ...(pathItem[method]?.responses ?? {}),
        };
      }
    });

    this.openApiPaths[openApiPath] = pathItem;

    return this;
  }

  private addOpenApiParams(
    inType: 'path' | 'query',
    schema: ZodSchema<any>,
    parameters: ParameterObject[],
  ): ParameterObject[] {
    const schemaObject = generateSchema(schema) as SchemaObject;
    for (const key in schemaObject.properties) {
      const property = schemaObject.properties[key];
      const required = schemaObject.required?.includes(key) ?? false;
      parameters.push({
        in: inType,
        name: key,
        schema: property,
        required,
      });
    }
    return parameters;
  }

  /** Converts `api/:someParam` to `api/{someParam}` */
  private convertToOpenApiPath(input: string) {
    // https://regex101.com/r/6uTvFu/1
    const regex = /:([A-Za-z0-9\-_.~]+)/g;
    return input.replace(regex, '{$1}');
  }
}
