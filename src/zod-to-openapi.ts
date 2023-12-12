import z, { SomeZodObject, ZodSchema, ZodTypeAny } from 'zod';
import express, { Express, NextFunction, Request, Response, RequestHandler, IRouterMatcher, query } from 'express';
import { generateSchema } from '@anatine/zod-openapi';
import { validateRequest } from "./request-validation.middleware";
import {
  OpenAPIObject,
  ParameterObject,
  PathItemObject,
  PathsObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { serve, setup } from 'swagger-ui-express';
import { TypedRequest } from './request-validation.middleware';

type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';
type Document = any;

export interface RouteConfig<
  TParams extends ZodSchema = ZodSchema,
  TQuery extends ZodSchema = ZodSchema,
  TBody extends ZodSchema = ZodSchema
> {
  method: HttpMethods;
  path: string;
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  description?: string;
  responses: RouteResponses;
}

export interface RouteResponses {
  [statusCode: number]: ZodSchema | ResponseObject;
}

export class ZodApiController {
  private router = express.Router();
  private openApiPaths: PathsObject = {};
  // private openApiDoc: any;

  routes: RouteConfig[] = [];

  constructor(private defaultResponses: RouteResponses = {}) {}

  get expressRouter(): express.Router {
    return this.router;
  }

  get openApiPathsObject(): PathsObject {
    return this.openApiPaths;
  }

  route<
    TParams extends ZodSchema = ZodSchema,
    TQuery extends ZodSchema = ZodSchema,
    TBody extends ZodSchema = ZodSchema
  >(
    config: RouteConfig<TParams, TQuery, TBody>,
    handler: (req: TypedRequest<TParams, TQuery, TBody>, res: Response, next: NextFunction) => void
  ): ZodApiController {
    const { method, path, params, query, body, responses } = config;

    const validate = params != null || query != null || body != null;

    const middleware = validate
      ? [
          validateRequest({
            params,
            query,
            body,
          }),
        ]
      : [];

    this.router[method](path, ...middleware, (req, res, next) => {
      try {
        handler(req, res, next);
      } catch (error) {
        next(error);
      }
    });

    this.updateOpenApiDoc(path, method, { ...this.defaultResponses, ...responses });

    return this;
  }

  private updateOpenApiDoc(path: string, method: HttpMethods, responses: RouteResponses): ZodApiController {
    const pathItem: PathItemObject = this.openApiPaths[path] || {};

    Object.entries(responses).forEach(([statusCode, response]) => {
      pathItem[method] = {
        responses: {
          ...pathItem[method]?.responses,
          [statusCode]:
            response instanceof ZodSchema
              ? {
                  description: '',
                  content: {
                    'application/json': {
                      schema: generateSchema(response as SomeZodObject),
                    },
                  },
                }
              : response,
        },
      };
    });

    this.openApiPaths[path] = pathItem;
    // this.openApiDoc.paths = this.openApiPaths;

    return this;
  }

  // getOpenApiDocument(): Document {
  //   return this.openApiDoc;
  // }
}

export function configureOpenApi({
  app,
  routers,
  initialDoc,
  docInfo,
}: {
  app: express.Application;
  routers: ZodApiController[];
  initialDoc?: OpenAPIObject;
  docInfo?: {
    title?: string;
    version?: string;
    docsTitle?: string;
    path?: string;
    swaggerPath?: string;
  };
}): express.Application {
  // configure docs
  const docsPath = docInfo?.path ?? '/api-docs';
  const swaggerPath = docInfo?.swaggerPath ?? '/swagger.json';

  const title =
    docInfo?.docsTitle ?? `${docInfo?.title ?? 'API Documentation'} ${docInfo?.version ? `v${docInfo?.version}` : ''}`;
  const version = docInfo?.version ?? 'N/A';

  const docs = {
    openapi: '3.0.0',
    info: {
      title,
      version,
    },
    paths: {},
    ...initialDoc,
  };

  // merge all router paths
  for (const router of routers) {
    for (const [path, schema] of Object.entries(router.openApiPathsObject)) {
      docs.paths[path] = {
        ...docs.paths[path],
        ...schema,
      };
    }
  }

  for (const router of routers) {
    app.use('/', router.expressRouter);
  }

  app.use(swaggerPath, (_, res) => res.json(docs));
  app.use(docsPath, serve);
  app.use(
    docsPath,
    setup(undefined, {
      swaggerUrl: swaggerPath,
      customSiteTitle: title,
      swaggerOptions: { layout: 'BaseLayout' },
    })
  );

  return app;
}

// // Function to convert Zod schema for URL/Route params to OpenAPI schema
// function zodRouteParamsToOpenApi(zodSchema: ZodSchema<any>): ParameterObject[] {
//   const schema = generateSchema(zodSchema) as SchemaObject;
//   return Object.keys(schema.properties || {}).map((key) => ({
//     name: key,
//     in: 'path',
//     required: true,
//     schema: schema.properties![key],
//   }));
// }
//
// // Function to convert Zod schema for Query params to OpenAPI schema
// function zodQueryParamsToOpenApi(zodSchema: ZodSchema<any>): ParameterObject[] {
//   const schema = generateSchema(zodSchema) as SchemaObject;
//   return Object.keys(schema.properties || {}).map((key) => ({
//     name: key,
//     in: 'query',
//     required: false, // Change as needed
//     schema: schema.properties![key],
//   }));
// }
//
// // Function to convert Zod schema for Body params to OpenAPI schema
// function zodBodyToOpenApi(zodSchema: ZodSchema<any>): RequestBodyObject {
//   const schema = generateSchema(zodSchema);
//   return {
//     content: {
//       'application/json': {
//         schema,
//       },
//     },
//   };
// }
//
// // Function to convert Zod schema for Response content to OpenAPI schema
// function zodResponseToOpenApi(zodSchema: ZodSchema<any>): ResponseObject {
//   const schema = generateSchema(zodSchema);
//   return {
//     description: 'Successful response', // Customize as needed
//     content: {
//       'application/json': {
//         schema,
//       },
//     },
//   };
// }
