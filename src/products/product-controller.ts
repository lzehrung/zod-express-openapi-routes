import {
  TypedRequestParams
} from "zod-express-middleware";
import { Request, Response } from "express";
import { Product } from "../db-models";
import { ProductRepository } from "./product-repository";
import { getProductParams } from "./api-schema";

export class ProductController {
  static getProduct(
    req: TypedRequestParams<typeof getProductParams>,
    res: Response<Product>
  ) {
    const product = ProductRepository.getProduct(req.params.id);
    if (!product) {
      res.status(404).send();
      return;
    }
    res.status(200).json(product);
  }

  static getProducts(req: Request, res: Response<Product[]>) {
    const products = ProductRepository.getProducts();
    res.status(200).json(products);
  }
}
