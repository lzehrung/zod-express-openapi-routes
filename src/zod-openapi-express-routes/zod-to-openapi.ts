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
    title?: string;
    version?: string;
    docsTitle?: string;
    path?: string;
    swaggerPath?: string;
  };
}

/**
 * Registers routes defined using `ZodApiController` with an express app, adds OpenAPI docs and SwaggerUI.
 */
export function configureOpenApi({
  app,
  controllers,
  initialDoc,
  docInfo,
}: ZodOpenApiExpressConfig): express.Application {
  // configure common docs
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

  // merge all router paths for common docs
  for (const router of controllers) {
    for (const [path, schema] of Object.entries(router.openApiPathsObject)) {
      docs.paths[path] = {
        ...docs.paths[path],
        ...schema,
      };
    }
  }

  // add all routers
  for (const router of controllers) {
    app.use('/', router.expressRouter);
  }

  // add swagger.json and swagger ui
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
