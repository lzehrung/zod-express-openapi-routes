import express from 'express';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import { serve, setup } from 'swagger-ui-express';
import { ZodApiController } from './zod-api.controller';

export interface ZodOpenApiExpressConfig {
  /** The express app to register the routes with. */
  app: express.Application;

  /** An array of `ZodApiController` instances. */
  controllers: ZodApiController[];

  /** An optional initial OpenAPI document to merge with the generated document. */
  initialDoc?: OpenAPIObject;

  /** An optional object to configure the OpenAPI documentation. */
  docInfo?: {
    apiVersion?: string;
    docsTitle?: string;
    docsPath?: string;
    swaggerPath?: string;
  };
}

const defaults = {
  apiVersion: '',
  docsTitle: 'API Reference',
  docsPath: '/swagger-ui',
  swaggerPath: '/swagger.json',
};

/**
 * Registers routes defined using `ZodApiController` with an express app, adds OpenAPI docs (`swagger.json`) and SwaggerUI.
 */
export function configureOpenApi({
  app,
  controllers,
  initialDoc,
  docInfo,
}: ZodOpenApiExpressConfig): express.Application {
  // configure common docs
  const docsPath = docInfo?.docsPath ?? defaults.docsPath;
  const swaggerPath = docInfo?.swaggerPath ?? defaults.swaggerPath;
  const version = docInfo?.apiVersion ?? defaults.apiVersion;
  const docsTitle = docInfo?.docsTitle ?? defaults.docsTitle;

  const docs = {
    openapi: '3.0.0',
    info: {
      title: docsTitle,
      version,
    },
    paths: {},
    ...initialDoc,
  };

  // merge all router paths for openapi docs and register express routers
  for (const controller of controllers) {
    for (const [path, schema] of Object.entries(controller.openApiPaths)) {
      docs.paths[path] = {
        ...docs.paths[path],
        ...schema,
      };
    }

    app.use('/', controller.router);
  }

  // add swagger.json and swagger ui
  app.use(swaggerPath, (_, res) => res.json(docs));
  app.use(docsPath, serve);
  app.use(
    docsPath,
    setup(undefined, {
      swaggerUrl: swaggerPath,
      customSiteTitle: docsTitle,
      swaggerOptions: { layout: 'BaseLayout' },
    }),
  );

  return app;
}
