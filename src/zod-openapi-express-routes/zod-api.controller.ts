import express, { NextFunction, RequestHandler, Response } from 'express';
import {
  ParameterObject,
  PathItemObject,
  PathsObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import z, { SomeZodObject, ZodSchema } from 'zod';
import { TypedRequest, validateRequest } from './request-validation.middleware';
import { generateSchema } from '@anatine/zod-openapi';
import { OperationObject } from 'openapi3-ts/src/model/openapi31';

type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head' | 'trace';

// type OpenApiOptions = Partial<{
//   path: Omit<PathItemObject, 'parameters' | HttpMethods | 'description'>
//   operation: Omit<OperationObject, 'parameters' | 'requestBody' | 'responses' | 'description'>
// }>;

/** OpenAPI schema that excludes fields inferred from a route config. */
type OpenApiOperationOptions = Omit<OperationObject, 'parameters' | 'requestBody' | 'responses' | 'description'>;

/**
 * Define an express route with Zod-validated request parameters, query, and body.
 */
export type RouteConfig<
  TParams extends ZodSchema = ZodSchema,
  TQuery extends ZodSchema = ZodSchema,
  TBody extends ZodSchema = ZodSchema,
  THeaders extends ZodSchema = ZodSchema,
> = {
  /** The HTTP method for the route. */
  method: HttpMethods;

  /** A Zod schema for the request parameters. Used to generate OpenAPI parameter definition. */
  params?: TParams;

  /** A Zod schema for the request query. Used to generate OpenAPI parameter definition. */
  query?: TQuery;

  /** A Zod schema for the request body. Used to generate OpenAPI parameter definition. */
  body?: TBody | RequestBodyObject;

  /** A Zod schema for the request headers. Used to generate OpenAPI parameter definition. */
  headers?: THeaders;

  /** OpenAPI description of the route. */
  description?: string;

  /** Define the responses for the route. */
  responses: RouteResponses;

  /** Middleware to run before the route handler. */
  middleware?: RequestHandler[];
} & OpenApiOperationOptions;

type ShortRouteConfig<TParams extends ZodSchema = ZodSchema, TQuery extends ZodSchema = ZodSchema, TBody extends ZodSchema = ZodSchema> = Omit<RouteConfig<TParams, TQuery, TBody>, 'method'>;

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

const constants = {
  noContent: 'No content',
  emptyResponses: [z.never()._type, z.void()._type, z.undefined()._type],
  jsonContent: 'application/json',
};

type RouteConfigOmitMethod<
  TParams extends ZodSchema = ZodSchema,
  TQuery extends ZodSchema = ZodSchema,
  TBody extends ZodSchema = ZodSchema,
> = Omit<RouteConfig<TParams, TQuery, TBody>, 'method'>;

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
   *
   * @param path The express route path in the format `/segment/:param`. Must be from the root, not relative.
   * @param config The route configuration.
   * @param handler The route handler.
   */
  route<
    TParams extends ZodSchema = ZodSchema,
    TQuery extends ZodSchema = ZodSchema,
    TBody extends ZodSchema = ZodSchema,
  >(
    path: string,
    config: RouteConfig<TParams, TQuery, TBody>,
    handler: (req: TypedRequest<TParams, TQuery, TBody>, res: Response, next: NextFunction) => void,
  ): ZodApiController {
    const { method, params, query, body, responses, middleware = [], operationId: initialOperationId } = config;
    const operationId = initialOperationId ?? `${method}_${path}`;
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

    return this.addRouteToOpenApi(path, { ...config, responses: { ...this.defaultResponses, ...responses }, operationId });
  }

  // Shortcut for `route` with `method: 'get'`
  get<TParams extends ZodSchema = ZodSchema, TQuery extends ZodSchema = ZodSchema, TBody extends ZodSchema = ZodSchema>(
    path: string,
    config: ShortRouteConfig<TParams, TQuery, TBody>,
    handler: (req: TypedRequest<TParams, TQuery, TBody>, res: Response, next: NextFunction) => void,
  ): ZodApiController {
    return this.route(path, { ...config, method: 'get' }, handler);
  }

  // Shortcut for `route` with `method: 'post'`
  post<
    TParams extends ZodSchema = ZodSchema,
    TQuery extends ZodSchema = ZodSchema,
    TBody extends ZodSchema = ZodSchema,
  >(
    path: string,
    config: Omit<RouteConfig<TParams, TQuery, TBody>, 'method'>,
    handler: (req: TypedRequest<TParams, TQuery, TBody>, res: Response, next: NextFunction) => void,
  ): ZodApiController {
    return this.route(path, { ...config, method: 'post' }, handler);
  }

  // Shortcut for `route` with `method: 'put'`
  put<TParams extends ZodSchema = ZodSchema, TQuery extends ZodSchema = ZodSchema, TBody extends ZodSchema = ZodSchema>(
    path: string,
    config: ShortRouteConfig<TParams, TQuery, TBody>,
    handler: (req: TypedRequest<TParams, TQuery, TBody>, res: Response, next: NextFunction) => void,
  ): ZodApiController {
    return this.route(path, { ...config, method: 'put' }, handler);
  }

  // Shortcut for `route` with `method: 'patch'`
  patch<
    TParams extends ZodSchema = ZodSchema,
    TQuery extends ZodSchema = ZodSchema,
    TBody extends ZodSchema = ZodSchema,
  >(
    path: string,
    config: Omit<RouteConfig<TParams, TQuery, TBody>, 'method'>,
    handler: (req: TypedRequest<TParams, TQuery, TBody>, res: Response, next: NextFunction) => void,
  ): ZodApiController {
    return this.route(path, { ...config, method: 'patch' }, handler);
  }

  // An alias for the `route` function with `method: 'delete'`
  delete<
    TParams extends ZodSchema = ZodSchema,
    TQuery extends ZodSchema = ZodSchema,
    TBody extends ZodSchema = ZodSchema,
  >(
    path: string,
    config: ShortRouteConfig<TParams, TQuery, TBody>,
    handler: (req: TypedRequest<TParams, TQuery, TBody>, res: Response, next: NextFunction) => void,
  ): ZodApiController {
    return this.route(path, { ...config, method: 'delete' }, handler);
  }

  private addRouteToOpenApi(path: string, config: RouteConfig): ZodApiController {
    const {
      method,
      params,
      query,
      body,
      responses,
      description,
      summary,
      security,
      servers,
      deprecated,
      externalDocs,
      operationId,
      callbacks,
      tags,
    } = config;

    const openApiPath = convertExpressPathToOpenApiPath(path);
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
      security,
      servers,
      summary,
      deprecated,
      externalDocs,
      operationId,
      callbacks,
      tags,
      parameters,
      requestBody: body
        ? body instanceof ZodSchema
          ? {
              content: {
                [constants.jsonContent]: {
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
          if (constants.emptyResponses.includes(typeName)) {
            responseDef = { description: constants.noContent };
          } else {
            responseDef = {
              description: response.description ?? '',
              content: {
                [constants.jsonContent]: {
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
}

/** Converts `api/:someParam` to `api/{someParam}` */
function convertExpressPathToOpenApiPath(input: string): string {
  // https://regex101.com/r/6uTvFu/1
  const regex = /:([A-Za-z0-9\-_.~]+)/g;
  return input.replace(regex, '{$1}');
}

type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
interface JsonArray extends Array<JsonValue> {}
interface JsonObject {
  [key: string | number | symbol]: JsonValue;
}

function isObject(item: JsonValue): item is JsonObject {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deeply merges two JSON values (objects, arrays, or primitives).
 * - Objects are merged by combining properties, with source properties overriding target properties.
 * - Arrays are concatenated.
 * - Primitive values from the source override those from the target.
 *
 * @param target The target value to merge into. Can be an object, array, or primitive.
 * @param source The source value to merge from. Can be an object, array, or primitive.
 * @returns The result of merging `source` into `target`.
 */
export function mergeDeep<T extends JsonValue, U extends JsonValue>(target: T, source: U): T & U {
  if (isObject(target) && isObject(source)) {
    const mergedOutput: JsonObject = { ...target };
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (key in target && isObject(target[key])) {
          mergedOutput[key] = mergeDeep(target[key] as JsonObject, source[key] as JsonObject);
        } else {
          mergedOutput[key] = source[key];
        }
      } else if (Array.isArray(source[key])) {
        mergedOutput[key] = Array.isArray(target[key])
          ? [...(target[key] as JsonArray), ...(source[key] as JsonArray)]
          : source[key];
      } else {
        mergedOutput[key] = source[key];
      }
    });
    return mergedOutput as T & U;
  } else if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source] as T & U;
  }
  return source as T & U;
}
