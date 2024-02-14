import { z } from 'zod';
import { jsonString } from '../helpers';

export const product = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  price: z.number().min(0.01).max(1000000),
  categories: z.array(z.string()).min(1).max(10),
});

// list of products schema
export const productList = z.array(product);

export const productIdParams = z.object({
  productId: z.coerce.number(),
});

export const productImageParams = productIdParams.extend({
  imageId: z.coerce.number(),
});

export const getListParam = z.object({
  name: product.shape.name.optional(),
  categories: jsonString(product.shape.categories).optional(),
});
