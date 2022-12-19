import {TypedRequestBody, TypedRequestParams, TypedRequestQuery} from "zod-express-middleware";
import { Request, Response } from "express";
import { Product } from "../db/models";
import { ProductRepository } from "./product-repository";
import {idParam, getListParam, product} from "./api-schema";

export class ProductController {
  static getProduct(
    req: TypedRequestParams<typeof idParam>,
    res: Response<Product>
  ) {
    const product = ProductRepository.getProduct(req.params.id);
    if (!product) {
      res.status(404).send();
      return;
    }
    res.status(200).json(product);
  }

  static getProducts(req: TypedRequestQuery<typeof getListParam>, res: Response<Product[]>) {
    const products = ProductRepository.getProducts(req.params);
    res.status(200).json(products);
  }

  static createProduct(
    req: TypedRequestBody<typeof product>,
    res: Response
  ) {
    ProductRepository.create(req.body);
    res.status(204).send();
  }
}
