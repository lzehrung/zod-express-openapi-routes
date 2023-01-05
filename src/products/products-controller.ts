import { ProductRepository } from "./product-repository";
import { productList } from "./api-schemas";
import { productsApi } from "./products-routes";
import { zodiosRouter, ZodiosController } from "../zodios-helpers";

const productsRouter = zodiosRouter(productsApi, { transform: true });

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

const controller = new ZodiosController(productsApi, productsRouter);
export default controller;
