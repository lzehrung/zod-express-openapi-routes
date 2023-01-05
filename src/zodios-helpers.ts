import { z } from "zod";
import { ZodiosEndpointDefinitions, ZodiosEndpointError } from "@zodios/core";
import { zodiosApp, ZodiosRouter } from "@zodios/express";
import { openApiBuilder } from "@zodios/openapi";
import { serve, setup } from "swagger-ui-express";
import { OpenAPIV3 } from "openapi-types";

export class ZodiosController<TApi extends ZodiosEndpointDefinitions> {
  constructor(
    public endpoints: ZodiosEndpointDefinitions,
    public router: ZodiosRouter<TApi, any>
  ) {}
}

export function zodiosApiApp(
  info: OpenAPIV3.InfoObject & {
    docsTitle?: string;
    docsPath?: string;
    schemaPath?: string;
  },
  controllers: ZodiosController<any>[]
) {
  let app = zodiosApp();
  let apiBuilder = openApiBuilder(info);

  for (const def of controllers) {
    apiBuilder = apiBuilder.addPublicApi(def.endpoints);
    app = app.use(def.router);
  }

  const openApiDocs = apiBuilder.build();

  const docsPath = info.schemaPath ?? "/api-docs";
  const schemaPath = info.docsPath ?? "/swagger.json";
  const docsTitle = info.docsTitle ?? `${info.title} v${info.version}`;

  app.use(schemaPath, (_, res) => res.json(openApiDocs));
  app.use(docsPath, serve);
  app.use(
    docsPath,
    setup(undefined, {
      swaggerUrl: schemaPath,
      customSiteTitle: docsTitle,
      swaggerOptions: { layout: "BaseLayout" },
    })
  );

  return app;
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
