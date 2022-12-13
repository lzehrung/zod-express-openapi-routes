import { Router, RequestHandler } from "express";
import {
  z,
  ZodSchema,
  ZodType,
  ZodTypeDef,
  AnyZodObject,
} from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  RouteConfig,
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
import { NextFunction, Response } from "express";
import {
  processRequest,
  TypedRequest,
  TypedRequestParams,
  TypedRequestQuery
} from "zod-express-middleware";
import { ZodRequestBody } from "@asteasolutions/zod-to-openapi/dist/openapi-registry";

/** Ensure string value is numeric. */
export const numericString = z.coerce.number();

/** Ensure url/path segment/param is numeric */
export const numericPathParam = numericString.openapi({
  param: {
    in: "path",
    required: true,
  },
});

export type AllReqVal<
  TParams extends AnyZodObject = AnyZodObject,
  TBody extends ZodType<any, ZodTypeDef, any> = ZodType<any, ZodTypeDef, any>,
  TQuery extends AnyZodObject = AnyZodObject
> =
  | TypedRequest<TParams, TBody, TQuery>
  | TypedRequestParams<TParams>
  | TypedRequestQuery<TQuery>;

export type TypedHandler<TReqVal extends AllReqVal, TResp> = (
  req: TReqVal,
  res: Response<TResp>,
  next?: NextFunction
) => void;

export type ApiRoute<
  TParams extends AnyZodObject | never = AnyZodObject,
  TBody extends ZodType<any, ZodRequestBody, any> | never = ZodType<
    any,
    ZodRequestBody,
    any
  >,
  TQuery extends AnyZodObject | never = AnyZodObject,
  TResponse = undefined
> = RouteConfig & {
  request?: {
    params?: TParams;
    body?: TBody;
    query?: TQuery;
    headers?: ZodType<unknown>[];
  };
  middleware?: RequestHandler[];
  handler: TypedHandler<TypedRequest<TParams, TBody, TQuery>, TResponse>;
};

export type ApiRouteParams<TParams extends AnyZodObject, TResponse> = ApiRoute<
  TParams,
  any,
  any,
  TResponse
>;
export type ApiRouteBody<
  TBody extends ZodType<any, ZodRequestBody, any>,
  TResponse
> = ApiRoute<any, TBody, any, TResponse>;
export type ApiRouteQuery<TQuery extends AnyZodObject, TResponse> = ApiRoute<
  any,
  any,
  TQuery,
  TResponse
>;

export type ApiRouteNoInput<TResponse> = ApiRoute<
  never,
  never,
  never,
  TResponse
>;

type TypedRouteConfig =
  | ApiRoute
  | ApiRouteParams<AnyZodObject, any>
  | ApiRouteBody<ZodType<any, ZodRequestBody, any>, any>
  | ApiRouteQuery<AnyZodObject, any>
  | ApiRoute<never, never, never, any>
  | ApiRouteNoInput<any>;

export function registerRoute(
  routeConfig: TypedRouteConfig,
  registry: OpenAPIRegistry,
  router: Router
): void {
  let expressPath = routeConfig.path;
  const paramsShape = routeConfig.request?.params?.shape;
  if (paramsShape) {
    for (const prop of Object.getOwnPropertyNames(paramsShape)) {
      console.log(`converting {${prop}} in ${routeConfig.path} to :${prop}`);
      expressPath = expressPath.replace(`{${prop}}`, `:${prop}`);
    }
  }

  const expressRoute = router.route(expressPath);

  let bodySchema: ZodSchema | undefined = undefined;
  const bodyContent = Object.getOwnPropertyNames(
    routeConfig.request?.body?.content ?? {}
  );
  if (bodyContent.length > 0) {
    const firstContentType = bodyContent[0];
    bodySchema = (routeConfig.request?.body as ZodRequestBody).content[
      firstContentType
    ].schema as ZodSchema;
  }
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
