import { z } from 'zod';
import { getListParam, product, productIdParams, productImageParams, productList } from './api-schemas';
import { ProductsService } from './products.service';
import multer from 'multer';
import os from 'os';
import { ZodApiController } from '../zod-openapi-express-routes/zod-api.controller';
import { defaultResponses } from '../common/responses';

export const singleProductRoute = '/api/products/:productId';
export const allProductsRoute = '/api/products';
export const singleProductImageRoute = '/api/products/:productId/images/:imageId';
export const allProductImagesRoute = '/api/products/:productId/images';

const upload = multer({ dest: os.tmpdir() });

export const productController = new ZodApiController({ defaultResponses })
  .get(
    allProductsRoute,
    {
      description: 'Get Products',
      query: getListParam,
      responses: {
        200: productList,
      },
    },
    (req, res) => {
      const product = ProductsService.getProducts({ ...req.query });
      if (!product) {
        res.status(404).json({ message: 'Product not found', data: req.query }).send();
        return;
      }
      res.json(product);
    },
  )
  .post(
    allProductsRoute,
    {
      description: 'Create product',
      body: product,
      responses: {
        201: product,
      },
    },
    (req, res) => {
      const product = ProductsService.createProduct(req.body);
      res.json(product);
    },
  )
  .get(
    singleProductRoute,
    {
      description: 'Get Product',
      params: productIdParams,
      responses: {
        200: product,
      },
    },
    (req, res) => {
      const product = ProductsService.getProduct(req.params.productId);
      if (!product) {
        res.status(404).send();
        return;
      }
      res.json(product);
    },
  )
  .patch(
    singleProductRoute,
    {
      description: 'Update Product',
      params: productIdParams,
      body: product.partial(),
      responses: {
        200: product,
      },
    },
    (req, res) => {
      const result = ProductsService.updateProduct(req.params.productId, req.body);
      if (!result) {
        res.status(404).send();
        return;
      }
      res.json(result);
    },
  )
  .delete(
    singleProductRoute,
    {
      description: 'Delete Product',
      params: productIdParams,
      responses: {
        204: z.never(),
      },
    },
    (req, res) => {
      const result = ProductsService.deleteProduct(req.params.productId);
      if (!result) {
        res.status(404).send();
        return;
      }
      res.status(204).send();
    },
  )
  .get(
    singleProductImageRoute,
    {
      description: 'Get Product Image',
      params: productImageParams,
      responses: {
        200: z.unknown(),
      },
    },
    (req, res) => {
      const image = ProductsService.getProductImage(req.params.productId, req.params.imageId);
      if (!image) {
        res.status(404).send();
        return;
      }
      res.sendFile(image.path, {
        headers: {
          'Content-Type': image.mimetype,
          'Content-Length': image.size,
          'Content-Disposition': `inline; filename=${image.originalname}`,
          'File-Name': image.originalname,
        },
      });
    },
  )
  .get(
    allProductImagesRoute,
    {
      description: 'Get Product Images',
      params: productIdParams,
      responses: {
        200: z.array(z.string()),
      },
    },
    (req, res) => {
      const images = ProductsService.getProductImages(req.params.productId);
      if (!images || Object.keys(images).length === 0) {
        res.json([]);
        return;
      }
      const filePaths = Array.from(Object.entries(images)).map(
        ([id, image]) => `/api/products/${req.params.productId}/images/${id}`,
      );
      res.json(filePaths);
    },
  )
  .post(
    allProductImagesRoute,
    {
      description: 'Upload a product image',
      middleware: [upload.single('imageFile')],
      params: z.object({
        productId: z.coerce.number(),
      }),
      body: {
        description: 'The image file',
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                imageFile: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Product Image',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'number',
                  },
                  imageUrl: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    (req, res, next) => {
      console.log('file upload received', req.file);
      if (!req.file) {
        res.status(400).send();
        return;
      }
      const imageId = ProductsService.createProductImage(Number(req.params.productId), req.file);
      res.status(201).json({
        id: imageId,
        imageUrl: `/api/products/${req.params.productId}/images/${imageId}`,
      });
    },
  );
