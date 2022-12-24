import { z } from "zod";
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

export class ProductController2 {
  static getProduct(
    req: TypedRequestParams<typeof idParam>,
    res: Response<z.infer<typeof product> | { code: string; message: string }>
  ) {
    try {
      const id = req.params.productId;
      const product = ProductRepository.getProduct(id);
      if (!product) {
        // match error 404 schema with auto-completion
        res.status(404).json({
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found",
          id, // compile time error if you forget to add id
        });
      } else {
        // match response schema with auto-completion
        res.json(product);
      }
    } catch (err) {
      // match default error schema with auto-completion
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Internal error",
      });
    }
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
