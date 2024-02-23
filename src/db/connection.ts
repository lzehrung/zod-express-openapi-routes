type File = Express.Multer.File;
import {Product} from "./models";

const products = new Array<Product>();
for (let i = 1; i <= 10; i++) {
  products.push({
    id: i,
    name: `Product ${i}`,
    price: i * 10,
    categories: [`category-${i * 25}`],
  });
}

const users = new Map<number, { id: number; email: string; password: string; }>().set(1, { id: 1, email: 'test@test.com', password: 'test' });

const connection = {
  products,
  productImages: new Map<number, Record<number, File>>(),
  users
};

export default connection;
