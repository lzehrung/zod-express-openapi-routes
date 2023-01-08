import { ProductRepository } from "./product-repository";
import { productList } from "./api-schemas";
import {
  productsApi,
  singleProductRoute,
  allProductsRoute,
  allProductImagesRoute,
  singleProductImageRoute,
} from "./products-routes";
import { zodiosRouter, TypedApiController } from "../zodios-helpers";
import { UploadedFile } from "express-fileupload";

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
  const product = ProductRepository.createProduct(req.body);
  res.json(product);
});

productsRouter.patch(singleProductRoute, (req, res) => {
  const result = ProductRepository.updateProduct(
    req.params.productId,
    req.body
  );
  if (!result) {
    res.status(404).send();
    return;
  }
  res.status(204);
});

productsRouter.delete(singleProductRoute, (req, res) => {
  const result = ProductRepository.deleteProduct(req.params.productId);
  if (!result) {
    res.status(404).send();
    return;
  }
  res.status(204);
});

productsRouter.get(allProductImagesRoute, (req, res) => {
  const images = ProductRepository.getProductImages(req.params.productId);
  if (!images || images.size === 0) {
    res.json([]);
    return;
  }
  const filePaths = Array.from(images).map(
    ([id, image]) => `/api/products/${req.params.productId}/images/${id}`
  );
  res.json(filePaths);
});

productsRouter.post(allProductImagesRoute, (req, res) => {
  if (
    !req.files ||
    Array.isArray(req.files) ||
    !req.files.image ||
    (req.files.image as UploadedFile).mimetype !== "image/jpeg"
  ) {
    res.status(400).send();
    return;
  }
  const upload = req.files.image as UploadedFile;
  const imageId = ProductRepository.createProductImage(
    req.params.productId,
    upload.data
  );
  return res.status(201).json({
    id: imageId,
    imageUrl: `/api/products/${req.params.productId}/images/${imageId}`,
  });
});

productsRouter.get(singleProductImageRoute, async (req, res) => {
  const image = ProductRepository.getProductImage(
    req.params.productId,
    req.params.imageId
  );
  if (!image) {
    res.status(404).send();
    return;
  }
  res.type("image/jpeg").send(image);
});

const controller = new TypedApiController(productsApi, productsRouter);
export default controller;
