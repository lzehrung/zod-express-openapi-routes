import { ZodiosEndpointDefinitions } from "@zodios/core";
import { zodiosApp, ZodiosRouter } from "@zodios/express";
import { openApiBuilder } from "@zodios/openapi";
import { serve, setup } from "swagger-ui-express";
import { InfoObject } from "openapi3-ts";

export class ZodiosController<TApi extends ZodiosEndpointDefinitions> {
  constructor(
    public endpoints: ZodiosEndpointDefinitions,
    public router: ZodiosRouter<TApi, any>
  ) {}
}

export function zodiosApiApp(
  info: InfoObject,
  controllers: ZodiosController<any>[]
) {
  let app = zodiosApp();
  let apiBuilder = openApiBuilder(info);

  for (const def of controllers) {
    apiBuilder = apiBuilder.addPublicApi(def.endpoints);
    app = app.use(def.router);
  }

  const openApiDocs = apiBuilder.build();

  app.use(`/swagger.json`, (_, res) => res.json(openApiDocs));
  app.use("/api-docs", serve);
  app.use("/api-docs", setup(undefined, { swaggerUrl: "/swagger.json" }));

  return app;
}
