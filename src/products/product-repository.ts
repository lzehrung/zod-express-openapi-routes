import { Product } from "../db/models";
import { getListParam } from "./api-schema";
import { z } from "zod";

const products = new Array<Product>();
for (let i = 1; i <= 10; i++) {
  products.push({
    id: i,
    name: `Product ${i}`,
    price: i * 10,
    categories: [`category-${i * 25}`],
  });
}

export class ProductRepository {
  static getProduct(id: number): Product | null {
    return products.find((p) => p.id === id) || null;
  }

  static getProducts(params: z.infer<typeof getListParam>): Product[] {
    console.log(params);
    return products.filter((x) => {
      if (params.name) {
        return x.name.indexOf(params.name) > -1;
      }
      return true;
    });
  }

  static create(product: Product) {
    products.push(product);
  }

  static update(id: number, params: Partial<Product | null>) {
    const product = products.find((p) => p.id === id);
    if (!product) {
      return null;
    }
    Object.assign(product, params);
  }

  static delete(id: number): boolean {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return false;
    }
    products.splice(index, 1);
    return true;
  }
}
