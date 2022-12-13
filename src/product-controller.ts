import {
  TypedRequest,
  TypedRequestParams,
  TypedRequestQuery,
} from "zod-express-middleware";
import { Request, Response } from "express";
import { Product } from "./db-models";
import { ServiceRepository } from "./service-repository";
import { getProductParams } from "./product-api-schema";

export class ProductController {
  static getProduct(
    req: TypedRequestParams<typeof getProductParams>,
    res: Response<Product>
  ) {
    const product = ServiceRepository.getProduct(req.params.id);
    if (!product) {
      res.status(404).send();
      return;
    }
    res.status(200).json(product);
  }

  static getProducts(
    req: Request,
    res: Response<Product[]>
  ) {
    const products = ServiceRepository.getProducts();
    res.status(200).json(products);
  }
}
