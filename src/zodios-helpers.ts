// import type { Express } from 'express';
// import { AnyZodObject, z } from 'zod';
// import { serve, setup } from 'swagger-ui-express';
// import { OpenAPIV3 } from 'openapi-types';
//
// export { OpenAPIV3 } from 'openapi-types';
//
// export class TypedApiController<TApi extends ZodiosEndpointDefinitions> {
//   constructor(
//     public endpoints: ZodiosEndpointDefinitions,
//     public router: ZodiosRouter<TApi, AnyZodObject>,
//     public additionalOpenApiPaths?: Partial<OpenAPIV3.PathsObject<Record<any, any>>>
//   ) {}
// }
//
// export type ApiInfo = OpenAPIV3.InfoObject & {
//   /** initial express instance to extend. */
//   expressInstance?: Express;
//   /** Title of the API docs page. */
//   docsTitle?: string;
//   /** Path to the API docs page. */
//   docsPath?: string;
//   /** Path to the API swagger.json file. */
//   swaggerPath?: string;
// };
//
// export function zodiosApiApp<TApi extends ZodiosEndpointDefinitions>(
//   info: ApiInfo,
//   controllers: TypedApiController<TApi>[],
//   additionalPaths?: Partial<OpenAPIV3.PathsObject<any>>
// ): ZodiosApp<TApi, AnyZodObject> {
//   // delete convenience properties so openapi schema is valid
//   const { expressInstance, docsPath: customDocsPath, swaggerPath: customSchemaPath } = info;
//   delete info.expressInstance;
//   delete info.docsPath;
//   delete info.swaggerPath;
//
//   let app = zodiosApp(undefined, { express: expressInstance });
//
//   let apiBuilder = openApiBuilder(info);
//
//   for (const controller of controllers) {
//     apiBuilder = apiBuilder.addPublicApi(controller.endpoints);
//     app = app.use(controller.router);
//   }
//
//   let openApiDocs = apiBuilder.build();
//
//   // merge zodios and additional (manually defined) openapi paths
//   const mergedPaths: OpenAPIV3.PathsObject = {
//     ...openApiDocs.paths,
//   };
//   let additionalOpenApiPaths = controllers
//     .filter((x) => !!x.additionalOpenApiPaths)
//     .map((x) => x.additionalOpenApiPaths);
//   if (additionalPaths) {
//     additionalOpenApiPaths = [...additionalOpenApiPaths, additionalPaths];
//   }
//   for (const paths of additionalOpenApiPaths) {
//     for (const [path, schema] of Object.entries(paths!)) {
//       mergedPaths[path] = {
//         ...mergedPaths[path],
//         ...schema,
//       };
//     }
//   }
//   openApiDocs.paths = mergedPaths;
//
//   const docsPath = customDocsPath ?? '/api-docs';
//   const swaggerPath = customSchemaPath ?? '/swagger.json';
//   const docsTitle = info.docsTitle ?? `${info.title} v${info.version}`;
//
//   app.use(swaggerPath, (_, res) => res.json(openApiDocs));
//   app.use(docsPath, serve);
//   app.use(
//     docsPath,
//     setup(undefined, {
//       swaggerUrl: swaggerPath,
//       customSiteTitle: docsTitle,
//       swaggerOptions: { layout: 'BaseLayout' },
//     })
//   );
//
//   return app as ZodiosApp<TApi, AnyZodObject>;
// }
//
// const baseErrorSchema = z.object({
//   message: z.string().optional(),
//   data: z.unknown().optional(),
// });
//
// export const errorResponse: ZodiosEndpointError = {
//   status: 'default', // default status code will be used if error is not 404
//   schema: baseErrorSchema,
// };
//
// export const notFoundResponse: ZodiosEndpointError = {
//   status: 404,
//   schema: baseErrorSchema,
// };
