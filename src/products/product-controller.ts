import {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams,
  TypedRequestQuery,
} from "zod-express-middleware";
import { Response } from "express";
import { Product } from "../db/models";
import { ProductRepository } from "./product-repository";
import { idParam, getListParam, product, updateProduct } from "./api-schema";

export class ProductController {
  static getProduct(
    req: TypedRequestParams<typeof idParam>,
    res: Response<Product>
  ) {
    const product = ProductRepository.getProduct(req.params.productId);
    if (!product) {
      res.status(404).send();
      return;
    }
    res.status(200).json(product);
  }

  static getProducts(
    req: TypedRequestQuery<typeof getListParam>,
    res: Response<Product[]>
  ) {
    const products = ProductRepository.getProducts(req.params);
    res.status(200).json(products);
  }

  static createProduct(req: TypedRequestBody<typeof product>, res: Response) {
    ProductRepository.create(req.body);
    res.status(201).send();
  }

  static updateProduct(
    req: TypedRequest<typeof idParam, never, typeof updateProduct>,
    res: Response
  ) {
    const result = ProductRepository.update(req.params.productId, req.body);
    if (!result) {
      res.status(404).send();
      return;
    }
    res.status(204).send();
  }

  static deleteProduct(req: TypedRequestParams<typeof idParam>, res: Response) {
    const result = ProductRepository.delete(req.params.productId);
    if (!result) {
      res.status(404).send();
      return;
    }
    res.status(204).send();
  }
}
