// import {z as zod, ZodLiteral, ZodRawShape} from "zod";
// import z from "zod-endpoints";
// import express, { Response } from "express";
// import { toZod } from "tozod";
// import { TypedRequestParams, validateRequest } from "zod-express-middleware";
// import { Product } from "./db-models";
// import { ServiceRepository } from "./service-repository";
// import { number, ZodNumberDef, ZodType } from "zod/lib/types";
// import { Path } from "zod-endpoints/lib/model";
//
// const router = express.Router();
//
// // product zod schema that is checked against the db model using toZod
// const productSchema: toZod<Product> = zod.object(
//   {
//     id: zod.number(),
//     name: zod.string(),
//     price: zod.number(),
//     categories: zod.array(zod.string()),
//   },
//   { description: "products" }
// );
//
// // single product response
// const singleProductResponse = z.response({
//   description: "Get a single product",
//   status: 200,
//   type: "application/json",
//   content: productSchema,
// });
//
// // generic 404 response
// const notFoundResponse = z.response({
//   description: "Resource Not Found",
//   status: 404,
// });
//
// // const getProductPath = z.path(
// //   z.literal("products"),
// //   productSchema.shape.id._def.typeName
// // );
// //
// // const path = z.array(
// //   z.object({ 0: z.literal("products"), 1: z.object({ id: z.number() }) })
// // );
// //
// // const test3 = propName("id", productSchema.shape);
//
// type OpenApiParamTypes = z.ZodNumber | z.ZodString;
// type OpenApiParams = { [key: string]: OpenApiParamTypes };
// const routess: (string | OpenApiParams)[] = [
//   "products",
//   { id: z.number() },
// ];
//
// const expressSegments: string[] = [];
// const openApiSegments: (z.ZodLiteral<string> | z.ZodNumber | z.ZodString)[] =
//   [];
// for (const r of routess) {
//   if (typeof r === "string") {
//     expressSegments.push(r);
//     openApiSegments.push(z.literal(r));
//   } else {
//     const [key, type] = Object.entries(r)[0];
//     expressSegments.push(`:${key}`);
//     openApiSegments.push(type);
//   }
// }
//
// // const parts = new Array<Path>();
// // for (const [key, value] of Object.entries(productSchema.shape)) {
// //   if (value instanceof ZodLiteral) {
// //     parts.push(value.value);
// //   } else {
// //     parts.push(z.literal(`:${key}`));
// //   }
// // }
//
// // 'get single product' request
// z.endpoint({
//   name: "getProduct",
//   method: "GET",
//   path: [openApiSegments[0], ...openApiSegments.slice(1)],
//   responses: [singleProductResponse, notFoundResponse],
// });
//
// // route parameters based on the property name of db-model-derived schema
// //const getPathSchema = z.object({ id: z.number() });
// // const pathSchema = z.object({
// //     ...openApiSegments.map({})
// // });
// let pathSchemaObj: Record<string, OpenApiParamTypes> = {};
// routess.filter(x => typeof x !== 'string').map(x => Object.entries(x as OpenApiParams)).forEach((x) => {
//     const firstProperty = x[0];
//     pathSchemaObj[firstProperty[0]] = firstProperty[1] as OpenApiParamTypes;
// });
// const parameterParts = z.object({ ...pathSchemaObj })
//
// const expressRoute = router.route(expressSegments)
//   .get(
//     validateRequest({ params: parameterParts }),
//     (req: TypedRequestParams<typeof parameterParts>, res: Response<Product>) => {
//       const product = ServiceRepository.getProduct(req.params.id);
//       if (!product) {
//         res.status(404).send();
//         return;
//       }
//       res.status(200).json(product);
//     }
//   );
//
// function propName<T>(name: keyof T, instance?: T): string {
//   return name.toString();
// }
