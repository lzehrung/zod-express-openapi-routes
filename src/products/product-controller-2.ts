import { z } from "zod";
import { ZodiosEndpointDefinition } from "@zodios/core";
import { ZodiosRequestHandler } from "@zodios/express";
import e, { Request, Response } from "express";
import { Product } from "../db/models";
import { ProductRepository } from "./product-repository";
import {
  idParam,
  getListParam,
  product,
  updateProduct,
  productList,
} from "./api-schema";
import { getProductEndpoint, productsRouter } from "./products-routes";

productsRouter.get("/products/:productId", (req, res) => {
  const product = ProductRepository.getProduct(req.params.productId);
  if (!product) {
    res.status(404).send();
    return;
  }
  res.json(product);
});

productsRouter.get("/products", (req, res) => {
  const products = ProductRepository.getProducts(req.query);
  res.json(productList.parse(products));
});

productsRouter.post("/products", (req, res) => {
  const product = ProductRepository.create(req.body);
  res.json(product);
});

productsRouter.patch("/products/:productId", (req, res) => {
  const result = ProductRepository.update(req.params.productId, req.body);
  if (!result) {
    res.status(404).send();
    return;
  }
  res.status(204);
});

productsRouter.delete("/products/:productId", (req, res) => {
  const result = ProductRepository.delete(req.params.productId);
  if (!result) {
    res.status(404).send();
    return;
  }
  res.status(204);
});

export class ProductController2 {
  // static getProducts(
  //   req: TypedRequestQuery<typeof getListParam>,
  //   res: Response<Product[]>
  // ) {
  //   const products = ProductRepository.getProducts(req.params);
  //   res.status(200).json(products);
  // }
  //
  // static createProduct(req: TypedRequestBody<typeof product>, res: Response<z.infer<typeof product>>) {
  //   const product = ProductRepository.create(req.body);
  //   res.status(201).json(product);
  // }
  //
  // static updateProduct(
  //   req: TypedRequest<typeof idParam, never, typeof updateProduct>,
  //   res: Response
  // ) {
  //   const result = ProductRepository.update(req.params.productId, req.body);
  //   if (!result) {
  //     res.status(404).send();
  //     return;
  //   }
  //   res.status(204).send();
  // }
  //
  // static deleteProduct(req: TypedRequestParams<typeof idParam>, res: Response) {
  //   const result = ProductRepository.delete(req.params.productId);
  //   if (!result) {
  //     res.status(404).send();
  //     return;
  //   }
  //   res.status(204).send();
  // }
}
