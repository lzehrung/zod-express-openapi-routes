import { toZod } from "tozod";
import { Product } from "../db/models";
import { z } from "zod";

// single product zod schema (checked against the db model interface using toZod)
export const product: toZod<Product> = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  price: z.number().min(0.01).max(1000000),
  categories: z.array(z.string()).min(1).max(10),
});

// list of products schema
export const productList: toZod<Product[]> = z.array(product);

export const getListParam = z.object({
  name: product.shape.name.optional(),
  categories: product.shape.categories.optional(),
});
