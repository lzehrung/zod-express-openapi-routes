import { toZod } from "tozod";
import { Product } from "../db/models";
import { z } from "zod";
import { numericPathParam } from "../open-api-helpers";

// single product zod schema (checked against the db model interface using toZod)
export const productSchema: toZod<Product> = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  categories: z.array(z.string()),
});

// list of products schema
export const productsSchema: toZod<Product[]> = z.array(productSchema);

// route parameters for 'Get single product' request
export const getProductParams = z.object({
  id: numericPathParam,
});
