import type { Express } from "express";
import { AnyZodObject, z } from "zod";
import { ZodiosEndpointDefinitions, ZodiosEndpointError } from "@zodios/core";
import { zodiosApp, ZodiosApp, ZodiosRouter } from "@zodios/express";
import { openApiBuilder } from "@zodios/openapi";
import { serve, setup } from "swagger-ui-express";
import { OpenAPIV3 } from "openapi-types";

export { ZodiosEndpointDefinitions, ZodiosEndpointError } from "@zodios/core";
export { ZodiosApp, ZodiosRouter } from "@zodios/express";
export { OpenAPIV3 } from "openapi-types";
export { apiBuilder } from "@zodios/core";
export { zodiosRouter } from "@zodios/express";

export class TypedApiController<TApi extends ZodiosEndpointDefinitions> {
  constructor(
    public endpoints: ZodiosEndpointDefinitions,
    public router: ZodiosRouter<TApi, AnyZodObject>,
    public additionalOpenApiPaths?: Partial<OpenAPIV3.PathsObject<Record<any, any>>>
  ) {}
}

export type ApiInfo = OpenAPIV3.InfoObject & {
  /** initial express instance to extend. */
  expressInstance?: Express;
  /** Title of the API docs page. */
  docsTitle?: string;
  /** Path to the API docs page. */
  docsPath?: string;
  /** Path to the API swagger.json file. */
  swaggerPath?: string;
};

export function zodiosApiApp<TApi extends ZodiosEndpointDefinitions>(
  info: ApiInfo,
  controllers: TypedApiController<TApi>[],
  manualDefinitions?: Partial<OpenAPIV3.PathsObject<any>>
): ZodiosApp<TApi, AnyZodObject> {
  // delete convenience properties so openapi schema is valid
  const {
    expressInstance,
    docsPath: customDocsPath,
    swaggerPath: customSchemaPath,
  } = info;
  delete info.expressInstance;
  delete info.docsPath;
  delete info.swaggerPath;

  let app = zodiosApp(undefined, { express: expressInstance });

  let apiBuilder = openApiBuilder(info);

  for (const controller of controllers) {
    apiBuilder = apiBuilder.addPublicApi(controller.endpoints);
    app = app.use(controller.router);
  }

  let openApiDocs = apiBuilder.build();
  const mergedPaths: OpenAPIV3.PathsObject = {
    ...openApiDocs.paths
  };
  for (const controller of controllers.filter(x => x.additionalOpenApiPaths != undefined)) {
    for (const [path, schema] of Object.entries(controller.additionalOpenApiPaths!)) {
        mergedPaths[path] = {
          ...mergedPaths[path],
          ...schema
        };
    }
  }

  openApiDocs = {
    ...openApiDocs,
    paths: mergedPaths
  };

  const docsPath = customDocsPath ?? "/api-docs";
  const swaggerPath = customSchemaPath ?? "/swagger.json";
  const docsTitle = info.docsTitle ?? `${info.title} v${info.version}`;

  app.use(swaggerPath, (_, res) => res.json(openApiDocs));
  app.use(docsPath, serve);
  app.use(
    docsPath,
    setup(undefined, {
      swaggerUrl: swaggerPath,
      customSiteTitle: docsTitle,
      swaggerOptions: { layout: "BaseLayout" },
    })
  );

  return app as ZodiosApp<TApi, AnyZodObject>;
}

const baseErrorSchema = z.object({
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export const errorResponse: ZodiosEndpointError = {
  status: "default", // default status code will be used if error is not 404
  schema: baseErrorSchema,
};

export const notFoundResponse: ZodiosEndpointError = {
  status: 404,
  schema: baseErrorSchema,
};
