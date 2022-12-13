// product zod schema that is checked against the db model using toZod
import { toZod } from "tozod";
import { Product } from "./db-models";
import { z } from "zod";

export const productSchema: toZod<Product> = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  categories: z.array(z.string()),
});

export const productsSchema: toZod<Product[]> = z.array(productSchema);

export const getProductParams = z.object({
  id: z.coerce.number().openapi({
    param: {
      in: "path",
      required: true
    }
  })
});
