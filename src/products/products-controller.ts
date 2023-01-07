import { ProductRepository } from "./product-repository";
import { productList } from "./api-schemas";
import {
  productsApi,
  singleProductRoute,
  allProductsRoute,
} from "./products-routes";
import { zodiosRouter, TypedApiController } from "../zodios-helpers";

const productsRouter = zodiosRouter(productsApi, { transform: true });

productsRouter.get(singleProductRoute, (req, res) => {
  const product = ProductRepository.getProduct(req.params.productId);
  if (!product) {
    res.status(404).send();
    return;
  }
  res.json(product);
});

productsRouter.get(allProductsRoute, (req, res) => {
  const products = ProductRepository.getProducts(req.query);
  res.json(productList.parse(products));
});

productsRouter.post(allProductsRoute, (req, res) => {
  const product = ProductRepository.create(req.body);
  res.json(product);
});

productsRouter.patch(singleProductRoute, (req, res) => {
  const result = ProductRepository.update(req.params.productId, req.body);
  if (!result) {
    res.status(404).send();
    return;
  }
  res.status(204);
});

productsRouter.delete(singleProductRoute, (req, res) => {
  const result = ProductRepository.delete(req.params.productId);
  if (!result) {
    res.status(404).send();
    return;
  }
  res.status(204);
});

const controller = new TypedApiController(productsApi, productsRouter);
export default controller;
