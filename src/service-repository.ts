import { Product } from "./db-models";

export class ServiceRepository {
  static getProduct(id: number): Product | null {
    return {
      id: id,
      name: `Product ${id}`,
      price: id * 10,
      categories: [`Category ${id * 3}`],
    };
  }
}
