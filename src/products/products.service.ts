type File = Express.Multer.File;
import { Product } from '../db/models';
import { getListParam } from './api-schemas';
import { z } from 'zod';
import db from '../db/connection';

export class ProductsService {
  static getProduct(id: number): Product | null {
    return db.products.find((p) => p.id === id) || null;
  }

  static getProducts(params: z.infer<typeof getListParam>): Product[] {
    return db.products.filter((x) => {
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
    db.products.push(product);
    return product;
  }

  static updateProduct(id: number, params: Partial<Product | null>) {
    const product = db.products.find((p) => p.id === id);
    if (!product) {
      return null;
    }
    return db.products[db.products.indexOf(product)] = Object.assign(product, params);
  }

  static deleteProduct(id: number): boolean {
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return false;
    }
    db.products.splice(index, 1);
    return true;
  }

  static getProductImages(productId: number): Record<number, File> | null {
    return db.productImages.get(productId) ?? null;
  }

  static createProductImage(productId: number, file: File): number {
    const productImageMap = db.productImages.get(productId) ?? {};
    const imageId = Object.keys(productImageMap).length;
    productImageMap[imageId] = file;
    db.productImages.set(productId, productImageMap);
    return imageId;
  }

  static getProductImage(productId: number, imageId: number): File | null {
    const map = db.productImages.get(productId) ?? null;
    if (!map) {
      return null;
    }
    return map[imageId] ?? null;
  }
}
