import express from 'express';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import { serve, setup } from 'swagger-ui-express';
import { ZodApiController, mergeDeep } from './zod-api.controller';
import { PathObject } from 'openapi3-ts/oas30';

export interface ZodOpenApiExpressConfig {
  /** The express app to register the routes with. */
  app: express.Application;

  /** An array of `ZodApiController` instances. */
  controllers: ZodApiController[];

  /** Express app route to the Swagger UI documentation page. */
  docsRoute?: string;

  /** Server host path to swagger.json. */
  swaggerRoute?: string;

  /** An optional initial OpenAPI document to merge with the generated document. */
  schema?: Partial<OpenAPIObject>;
}

const defaults = {
  apiVersion: '1.0.0',
  docsTitle: 'API Reference',
  swaggerUiRoute: '/swagger-ui',
  swaggerRoute: '/swagger.json',
  openApiVersion: '3.0.0',
};

/**
 * Registers routes defined using `ZodApiController` with an express app, adds OpenAPI docs (`swagger.json`) and SwaggerUI.
 */
export function configureOpenApi({
  app,
  controllers,
  schema,
  docsRoute,
  swaggerRoute,
}: ZodOpenApiExpressConfig): express.Application {
  const version = schema?.info?.version ?? defaults.apiVersion;
  const title = schema?.info?.title ?? defaults.docsTitle;

  const apiSchema = mergeDeep(
    {
      openapi: defaults.openApiVersion,
      info: {
        title,
        version,
      },
      paths: {},
    } as {},
    schema ?? ({} as {}),
  ) as OpenAPIObject;

  // merge all router paths for openapi docs and register express routers
  for (const controller of controllers) {
    for (const [path, schema] of Object.entries(controller.openApiPaths)) {
      apiSchema.paths![path] = mergeDeep(apiSchema.paths![path] as {}, schema as {}) as PathObject;
    }

    app.use('/', controller.router);
  }

  // add swagger.json and swagger ui
  const swaggerUiRoute = docsRoute ?? defaults.swaggerUiRoute;
  const swaggerJsonRoute = swaggerRoute ?? defaults.swaggerRoute;
  app.use(swaggerJsonRoute, (_, res) => res.json(apiSchema));
  app.use(swaggerUiRoute, serve);
  app.use(
    swaggerUiRoute,
    setup(undefined, {
      swaggerUrl: swaggerJsonRoute,
      customSiteTitle: title,
      swaggerOptions: { layout: 'BaseLayout' },
    }),
  );

  return app;
}
