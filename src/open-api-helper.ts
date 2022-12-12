import { Router } from "express";
import { z, ZodSchema, ZodType, ZodTypeDef } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  RouteConfig,
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
import { NextFunction, Response } from "express";
import {
  TypedRequest,
  TypedRequestParams,
  TypedRequestQuery,
  validateRequest,
} from "zod-express-middleware";
import { routeParams } from "./product-api-schema";
import { ZodRequestBody } from "@asteasolutions/zod-to-openapi/dist/openapi-registry";

/** Reusable type for ensuring numeric string parameters in express routes */
export const numericString = z.preprocess(Number, z.number());

type ApiZodType = ZodType<any, ZodTypeDef, any>;

export type AllReqVal<
  TParams extends ApiZodType = ApiZodType,
  TBody extends ApiZodType = ApiZodType,
  TQuery extends ApiZodType = ApiZodType
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
  TParams extends ApiZodType = ApiZodType,
  TBody extends ApiZodType = ApiZodType,
  TQuery extends ApiZodType = ApiZodType,
  TResponse = undefined
> = RouteConfig & {
  request: {
    params?: TParams;
    body?: TBody;
    query?: TQuery;
    headers?: ApiZodType;
  };
  handler: TypedHandler<TypedRequest<TParams, TBody, TQuery>, TResponse>;
};

export type ApiRouteParams<TParams extends ApiZodType, TResponse> = ApiRoute<
  TParams,
  any,
  any,
  TResponse
>;
export type ApiRouteBody<TBody extends ApiZodType, TResponse> = ApiRoute<
  any,
  TBody,
  any,
  TResponse
>;
export type ApiRouteQuery<TQuery extends ApiZodType, TResponse> = ApiRoute<
  any,
  any,
  TQuery,
  TResponse
>;

export function registerRoute(
  routeConfig:
    | ApiRoute
    | ApiRouteParams<ApiZodType, any>
    | ApiRouteBody<ApiZodType, any>
    | ApiRouteQuery<ApiZodType, any>,
  registry: OpenAPIRegistry,
  router: Router
): void {
  if (routeConfig.request) {
    let expressPath = routeConfig.path;
    if (routeParams) {
      for (const prop of Object.getOwnPropertyNames(routeParams.shape)) {
        expressPath = expressPath.replace(`{${prop}}`, `:${prop}`);
      }
    }

    let expressRoute = router.route(expressPath);

    let bodySchema: ZodSchema | undefined = undefined;
    const bodyContent = Object.getOwnPropertyNames(
      routeConfig.request.body?.content || {}
    );
    if (bodyContent.length > 0) {
      const firstContentType = bodyContent[0];
      bodySchema = (routeConfig.request.body as ZodRequestBody).content[
        firstContentType
      ].schema as ZodSchema;
    }

    const validationMiddleware = validateRequest({
      params: routeConfig.request.params,
      body: bodySchema,
      query: routeConfig.request.query,
    });

    switch (routeConfig.method) {
      case "get":
        expressRoute.get(validationMiddleware, routeConfig.handler);
        break;
      case "patch":
        expressRoute.patch(validationMiddleware, routeConfig.handler);
        break;
      case "post":
        expressRoute.post(validationMiddleware, routeConfig.handler);
        break;
      case "put":
        expressRoute.put(validationMiddleware, routeConfig.handler);
        break;
      case "delete":
        expressRoute.delete(validationMiddleware, routeConfig.handler);
        break;
      default:
        throw new Error(
          `Unsupported method ${routeConfig.method} for '${routeConfig.method}: ${routeConfig.path}'`
        );
    }

    registry.registerPath(routeConfig);
    console.log(`registered ${routeConfig.method}: ${expressPath}`);
  }
}
