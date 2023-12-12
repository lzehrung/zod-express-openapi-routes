import { ProductRepository } from './product-repository';
import { productList } from './api-schemas';
import {
  // productsApi,
  singleProductRoute,
  allProductsRoute,
  allProductImagesRoute,
  singleProductImageRoute,
} from './products-routes';
// import { zodiosRouter, TypedApiController } from '../zodios-helpers';
import express from 'express';
import multer from 'multer';
import os from 'os';

// const productsRouter = zodiosRouter(productsApi, { transform: true });

// export class ProductsController {
//     static getProducts(req: express.Request, res: express.Response) {
//       const product = ProductRepository.getProduct(req.params.productId);
//       if (!product) {
//         res.status(404).send();
//         return;
//       }
//       res.json(product);
//     }
// }

// productsRouter.get(singleProductRoute, (req, res) => {
//   const product = ProductRepository.getProduct(req.params.productId);
//   if (!product) {
//     res.status(404).send();
//     return;
//   }
//   res.json(product);
// });
//
// productsRouter.get(allProductsRoute, (req, res) => {
//   const products = ProductRepository.getProducts(req.query);
//   res.json(productList.parse(products));
// });
//
// productsRouter.post(allProductsRoute, (req, res) => {
//   const product = ProductRepository.createProduct(req.body);
//   res.json(product);
// });
//
// productsRouter.patch(singleProductRoute, (req, res) => {
//   const result = ProductRepository.updateProduct(req.params.productId, req.body);
//   if (!result) {
//     res.status(404).send();
//     return;
//   }
//   res.status(204);
// });
//
// productsRouter.delete(singleProductRoute, (req, res) => {
//   const result = ProductRepository.deleteProduct(req.params.productId);
//   if (!result) {
//     res.status(404).send();
//     return;
//   }
//   res.status(204);
// });
//
// productsRouter.get(allProductImagesRoute, (req, res) => {
//   const images = ProductRepository.getProductImages(req.params.productId);
//   if (!images || images.size === 0) {
//     res.json([]);
//     return;
//   }
//   const filePaths = Array.from(images).map(([id, image]) => `/api/products/${req.params.productId}/images/${id}`);
//   res.json(filePaths);
// });
//
// productsRouter.get(singleProductImageRoute, async (req, res) => {
//   const image = ProductRepository.getProductImage(req.params.productId, req.params.imageId);
//   if (!image) {
//     res.status(404).send();
//     return;
//   }
//   res.type('image/png').sendFile(image);
// });
//
// const additionalRoutes = express.Router();
//
// const upload = multer({ dest: os.tmpdir() });
// additionalRoutes.post('/api/products/:productId/images', upload.single('imageFile'), (req, res, next) => {
//   console.log('file upload received', req.file);
//   if (!req.file) {
//     res.status(400).send();
//     return;
//   }
//   const imageId = ProductRepository.createProductImage(Number(req.params.productId), req.file.path);
//   res.status(201).json({
//     id: imageId,
//     imageUrl: `/api/products/${req.params.productId}/images/${imageId}`,
//   });
// });
//
// productsRouter.use('/', additionalRoutes);
//
// const controller = new TypedApiController(productsApi, productsRouter, {
//   '/api/products/{productId}/images': {
//     post: {
//       summary: 'Upload a product image',
//       description: 'Upload a product image',
//       operationId: 'uploadProductImage',
//       tags: ['images'],
//       parameters: [
//         {
//           name: 'productId',
//           in: 'path',
//           description: 'Product ID',
//           required: true,
//           schema: {
//             type: 'number',
//           },
//         },
//       ],
//       requestBody: {
//         content: {
//           'multipart/form-data': {
//             schema: {
//               type: 'object',
//               properties: {
//                 imageFile: {
//                   type: 'string',
//                   format: 'binary',
//                 },
//               },
//             },
//           },
//         },
//       },
//       responses: {
//         '201': {
//           description: 'Product Image',
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   id: {
//                     type: 'number',
//                   },
//                   imageUrl: {
//                     type: 'string',
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   },
// });
// export default controller;
