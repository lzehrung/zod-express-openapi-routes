import { z, ZodObject } from "zod";
import { ZodiosEndpointDefinitions, ZodiosEndpointError } from "@zodios/core";
import {
  zodiosApp,
  zodiosRouter,
  ZodiosApp,
  ZodiosRouter,
} from "@zodios/express";
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
    public router: ZodiosRouter<TApi, any>
  ) {}
}

export type ApiInfo = OpenAPIV3.InfoObject & {
  docsTitle?: string;
  docsPath?: string;
  schemaPath?: string;
};

export function zodiosApiApp<TApi extends ZodiosEndpointDefinitions>(
  info: ApiInfo,
  controllers: TypedApiController<TApi>[]
): ZodiosApp<TApi, ZodObject<any>> {
  let app = zodiosApp();
  let apiBuilder = openApiBuilder(info);

  for (const controller of controllers) {
    apiBuilder = apiBuilder.addPublicApi(controller.endpoints);
    app = app.use(controller.router);
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

  return app as ZodiosApp<TApi, ZodObject<any>>;
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
