import { Product } from '../db/models';
import { getListParam } from './api-schemas';
import { z } from 'zod';

const products = new Array<Product>();
for (let i = 1; i <= 10; i++) {
  products.push({
    id: i,
    name: `Product ${i}`,
    price: i * 10,
    categories: [`category-${i * 25}`],
  });
}

const productImages = new Map<number, Map<number, string>>();

export class ProductRepository {
  static getProduct(id: number): Product | null {
    return products.find((p) => p.id === id) || null;
  }

  static getProducts(params: z.infer<typeof getListParam>): Product[] {
    return products.filter((x) => {
      if (params.name) {
        return x.name.indexOf(params.name) > -1;
      }
      if (params.categories) {
        return params.categories.every((c) => x.categories.indexOf(c) > -1);
      }
      return true;
    });
  }

  static createProduct(product: Product): Product {
    products.push(product);
    return product;
  }

  static updateProduct(id: number, params: Partial<Product | null>) {
    const product = products.find((p) => p.id === id);
    if (!product) {
      return null;
    }
    Object.assign(product, params);
    return product;
  }

  static deleteProduct(id: number): boolean {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return false;
    }
    products.splice(index, 1);
    return true;
  }

  static getProductImages(productId: number): Map<number, string> | null {
    return productImages.get(productId) ?? null;
  }

  static createProductImage(productId: number, file: string): number {
    const productImageMap = productImages.get(productId) ?? new Map<number, string>();
    const imageId = productImageMap.size;
    productImageMap.set(imageId, file);
    productImages.set(productId, productImageMap);
    return imageId;
  }

  static getProductImage(productId: number, imageId: number): string | null {
    return productImages.get(productId)?.get(imageId) ?? null;
  }
}
