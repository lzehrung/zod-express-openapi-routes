import { AnyZodObject, z, ZodSchema, ZodType, ZodTypeDef } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIGenerator,
  OpenAPIRegistry,
  RouteConfig,
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
import express, { NextFunction, RequestHandler, Response } from "express";
import {
  TypedRequest,
  TypedRequestParams,
  TypedRequestQuery,
  validateRequest,
} from "zod-express-middleware";
import { productSchema, routeParams } from "./product-api-schema";
import { ProductController } from "./product-controller";
import { Product } from "./db-models";

// type TReq = TypedRequest;
// type TRes = Response;
//
// type TypedRequestHandler<TRequest<TP, TB, TQ> extends TypedRequest<TP, TB, TQ>, TResponse extends TRes = TRes> = (req: TRequest, res: TResponse, next: NextFunction) => void;

type ZodSchemer = ZodType<any, ZodTypeDef, any>;

type AllReqVal<
  TParams extends ZodSchemer = ZodSchemer,
  TBody extends ZodSchemer = ZodSchemer,
  TQuery extends ZodSchemer = ZodSchemer
> =
  | TypedRequest<TParams, TBody, TQuery>
  | TypedRequestParams<TParams>
  | TypedRequestQuery<TQuery>;

type TypedHandler<TReqVal extends AllReqVal, TResp> = (
  req: TReqVal,
  res: Response<TResp>,
  next: NextFunction
) => void;

type ExtendedRouteConfig<
  TParams extends ZodSchemer = ZodSchemer,
  TBody extends ZodSchemer = ZodSchemer,
  TQuery extends ZodSchemer = ZodSchemer,
  TResponse = undefined
> = RouteConfig & {
  request: {
    params?: TParams;
    body?: TBody;
    query?: TQuery;
  };
  handler: TypedHandler<AllReqVal<TParams, TBody, TQuery>, TResponse>;
};

const registry = new OpenAPIRegistry();
const productRoutes = express.Router();

const routeConfig: ExtendedRouteConfig<
  typeof routeParams,
  any,
  any,
  Product
> = {
  path: "/products/{id}",
  method: "get",
  description: "Get a single product",
  request: {
    params: routeParams,
  },
  handler: ProductController.getProduct,
  responses: {
    200: {
      description: "Get a single product",
      content: {
        "application/json": {
          schema: productSchema,
        },
      },
    },
  },
};

if (routeConfig.request) {
  let expressPath = routeConfig.path;
  if (routeParams) {
    for (const prop of Object.getOwnPropertyNames(routeParams.shape)) {
      console.log({
        prop,
      });
      expressPath = expressPath.replace(`{${prop}}`, `:${prop}`);
    }
  }

  let expressRoute = productRoutes.route(expressPath);

  const validationMiddleware = validateRequest({
    params: routeConfig.request.params,
    body: routeConfig.request.body?.content["application/json"]
      .schema as ZodSchema,
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

const docGen = new OpenAPIGenerator(registry.definitions, "3.0.0");

const docs = docGen.generateDocument({
  info: {
    title: "Product API",
    version: "1.0.0",
  },
});

export { productRoutes, docs };
