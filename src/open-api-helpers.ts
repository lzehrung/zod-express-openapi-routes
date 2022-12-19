import assert = require('assert');
import e, { Router, RequestHandler } from "express";
import { z, ZodType, ZodTypeDef, AnyZodObject, TypeOf, ZodObject } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  ResponseConfig,
  RouteConfig,
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
import { NextFunction, Response } from "express";
import {
  processRequest,
  TypedRequest,
  TypedRequestParams,
  TypedRequestQuery,
} from "zod-express-middleware";
import {
  ZodContentObject,
  ZodMediaTypeObject,
  ZodRequestBody,
} from "@asteasolutions/zod-to-openapi/dist/openapi-registry";

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

/** Ensure string value is numeric. */
export const numericString = z.coerce.number();

/** Ensure url/path segment/param is numeric */
export const numericPathParam = numericString.openapi({
  param: {
    in: "path",
    required: true,
  },
});

// ZodObject<any, any, any, { [x: string]: any; }, { [x: string]: any; }>

export function jsonContent<T extends ZodType<unknown>>(
  schema: T
): TypedZodContent<T> {
  return {
    "application/json": {
      schema,
    },
  };
}

export type AllReqVal<
  TParams extends AnyZodObject = AnyZodObject,
  TBody extends AnyZodObject = AnyZodObject,
  TQuery extends AnyZodObject = AnyZodObject
> =
  | TypedRequest<TParams, TQuery, TBody>
  | TypedRequestParams<TParams>
  | TypedRequestQuery<TQuery>;

export type TypedHandler<TReqVal extends AllReqVal, TResp> = (
  req: TReqVal,
  res: Response<TResp>,
  next?: NextFunction
) => void;

export interface TypedMediaObject<TBody extends ZodType<unknown>>
  extends ZodMediaTypeObject {
  schema: TBody;
}

export interface TypedZodContent<TBody extends ZodType<unknown>>
  extends ZodContentObject {
  [mediaType: string]: TypedMediaObject<TBody>;
}

export interface TypedZodRequestBody<TBody extends ZodType<unknown>>
  extends ZodRequestBody {
  content: TypedZodContent<TBody>;
}

export interface TypedRouteConfig<
  TParams extends AnyZodObject | never = AnyZodObject,
  TBody extends AnyZodObject | never = AnyZodObject,
  TQuery extends AnyZodObject | never = AnyZodObject,
  TResponse = undefined
> extends RouteConfig {
  description: string;
  request?: {
    params?: TParams;
    body?: TypedZodRequestBody<TBody>;
    query?: TQuery;
    headers?: ZodType<unknown>[];
  };
  middleware?: RequestHandler[];
  handler: TypedHandler<TypedRequest<TParams, TQuery, TBody>, TResponse>;
}

export interface ApiRouteParams<TParams extends AnyZodObject, TResponse>
  extends TypedRouteConfig<TParams, never, never, TResponse> {}
export interface ApiRouteBody<TBody extends AnyZodObject, TResponse>
  extends TypedRouteConfig<never, TBody, never, TResponse> {}
export interface ApiRouteQuery<TQuery extends AnyZodObject, TResponse>
  extends TypedRouteConfig<never, never, TQuery, TResponse> {}

export interface ApiRouteResponseOnly<TResponse>
  extends TypedRouteConfig<never, never, never, TResponse> {}

type RouteTypes =
  | TypedRouteConfig<any, any, any, any>
  | ApiRouteParams<any, any>
  | ApiRouteBody<any, any>
  | ApiRouteQuery<any, any>
  | ApiRouteResponseOnly<any>;

export function registerRoute(
  routeConfig: RouteTypes,
  registry: OpenAPIRegistry,
  router: Router
): void {
  let expressPath = routeConfig.path;
  const paramsShape = routeConfig.request?.params?.shape;
  if (paramsShape) {
    for (const prop of Object.getOwnPropertyNames(paramsShape)) {
      console.debug(`converting {${prop}} in ${routeConfig.path} to :${prop}`);
      expressPath = expressPath.replace(`{${prop}}`, `:${prop}`);
    }
  }

  const expressRoute = router.route(expressPath);

  const bodyContent =
    Object.getOwnPropertyNames(routeConfig.request?.body?.content ?? {})[0] ??
    "application/json";
  const bodySchema = routeConfig.request?.body?.content[bodyContent]?.schema;
  const validationMiddleware = processRequest({
    params: routeConfig.request?.params,
    body: bodySchema,
    query: routeConfig.request?.query,
  });
  const middleware = (routeConfig.middleware ?? []).concat([
    validationMiddleware,
  ]);
  switch (routeConfig.method) {
    case "get":
      expressRoute.get(...middleware, routeConfig.handler);
      break;
    case "patch":
      expressRoute.patch(...middleware, routeConfig.handler);
      break;
    case "post":
      expressRoute.post(...middleware, routeConfig.handler);
      break;
    case "put":
      expressRoute.put(...middleware, routeConfig.handler);
      break;
    case "delete":
      expressRoute.delete(...middleware, routeConfig.handler);
      break;
    default:
      throw new Error(
        `Unsupported HTTP method ${routeConfig.method} for '${routeConfig.method}: ${routeConfig.path}'`
      );
  }

  registry.registerPath(routeConfig);
  console.log(`registered ${routeConfig.method}: ${expressPath}`);
}
