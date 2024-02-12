import z, { SomeZodObject, ZodSchema, ZodTypeAny } from 'zod';
import express, { Express, NextFunction, Request, Response, RequestHandler, IRouterMatcher, query } from 'express';
import { generateSchema } from '@anatine/zod-openapi';
import { validateRequest } from './request-validation.middleware';
import {
  ContentObject,
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

export interface RouteConfig<
  TParams extends ZodSchema = ZodSchema,
  TQuery extends ZodSchema = ZodSchema,
  TBody extends ZodSchema = ZodSchema
> {
  method: HttpMethods;
  path: string;
  params?: TParams;
  query?: TQuery;
  body?: TBody | RequestBodyObject;
  description?: string;
  responses: RouteResponses;
  middleware?: RequestHandler[];
  tags?: string[];
}

export interface RouteResponses {
  [statusCode: number]: ZodSchema | ResponseObject;
}

export class ZodApiController {
  private router = express.Router();
  private openApiPaths: PathsObject = {};

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

    this.router[method](path, ...middlewares, (req, res, next) => {
      try {
        handler(req, res, next);
      } catch (error) {
        next(error);
      }
    });

    this.addToOpenApiDefinition({ ...config, responses: { ...this.defaultResponses, ...responses } });

    return this;
  }

  private addToOpenApiDefinition(config: RouteConfig): ZodApiController {
    const {
      method,
      path,
      params,
      query,
      body,
      responses,
      description,
      tags
    } = config;

    const openApiPath = this.convertToOpenApiPath(path);
    const pathItem: PathItemObject = this.openApiPaths[openApiPath] || {};

    const parameters = new Array<ParameterObject>();
    if (params) {
      this.addParams('path', params, parameters);
    }
    if (query) {
      this.addParams('query', query, parameters);
    }

    pathItem[method] = {
      description,
      tags,
      parameters,
      requestBody: body
        ? body instanceof ZodSchema
          ? {
              content: {
                ['application/json']: {
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

    Object.entries(responses).forEach(([statusCode, response]) => {
      if (pathItem[method]?.responses) {
        pathItem[method]!.responses = {
          ...(pathItem[method]?.responses ?? {}),
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
        };
      }
    });

    this.openApiPaths[openApiPath] = pathItem;

    return this;
  }

    private addParams(
        inType: 'path' | 'query',
        schema: ZodSchema<any>,
        parameters: ParameterObject[]
    ): ParameterObject[] {
        const schemaObject = generateSchema(schema) as SchemaObject;
        for (const key in schemaObject.properties) {
        const property = schemaObject.properties[key];
        parameters.push({
            in: inType,
            name: key,
            schema: property,
            required: !schema.isOptional(),
        });
        }
        return parameters;
    }

  /** Converts `api/:someParam` to `api/{someParam}` */
  private convertToOpenApiPath(input: string) {
    const regex = /\/:([a-zA-Z0-9_]+)(\/|$)/g;
    return input.replace(regex, '/{$1}$2');
  }
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
