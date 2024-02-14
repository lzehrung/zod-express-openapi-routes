import { z } from 'zod';
import { getListParam, product, productIdParams, productImageParams, productList } from './api-schemas';
import { RouteResponses, ZodApiController } from '../zod-to-openapi';
import { ResponseObject } from 'openapi3-ts/oas31';
import { ProductsRepository } from './products.repository';
import multer from 'multer';
import os from 'os';

export const singleProductRoute = '/api/products/:productId';
export const allProductsRoute = '/api/products';
export const singleProductImageRoute = '/api/products/:productId/images/:imageId';
export const allProductImagesRoute = '/api/products/:productId/images';

const errorFormat: ResponseObject = {
  description: 'Error response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
          },
        },
      },
    },
  },
};

const defaultResponses: RouteResponses = {
  404: errorFormat,
};

const upload = multer({ dest: os.tmpdir() });

export const productController = new ZodApiController(defaultResponses)
  .route(
    {
      method: 'get',
      path: allProductsRoute,
      description: 'Get Products',
      query: getListParam,
      responses: {
        200: productList,
      },
    },
    (req, res) => {
      const product = ProductsRepository.getProducts({ ...req.query });
      if (!product) {
        res.status(404).json({ message: 'Product not found', data: req.query }).send();
        return;
      }
      res.json(product);
    }
  )
  .route(
    {
      method: 'post',
      path: allProductsRoute,
      description: 'Create product',
      body: product,
      responses: {
        201: product,
      },
    },
    (req, res) => {
      const product = ProductsRepository.createProduct(req.body);
      res.json(product);
    }
  )
  .route(
    {
      method: 'get',
      path: singleProductRoute,
      description: 'Get Product',
      params: productIdParams,
      responses: {
        200: product,
      },
    },
    (req, res) => {
      const product = ProductsRepository.getProduct(req.params.productId);
      if (!product) {
        res.status(404).send();
        return;
      }
      res.json(product);
    }
  )
  .route(
    {
      method: 'patch',
      path: singleProductRoute,
      description: 'Update Product',
      params: productIdParams,
      body: product.partial(),
      responses: {
        204: z.object({}),
      },
    },
    (req, res) => {
      const result = ProductsRepository.updateProduct(req.params.productId, req.body);
      if (!result) {
        res.status(404).send();
        return;
      }
      res.status(204);
    }
  )
  .route(
    {
      method: 'delete',
      path: singleProductRoute,
      description: 'Delete Product',
      params: productIdParams,
      responses: {
        204: z.object({}),
      },
    },
    (req, res) => {
      const result = ProductsRepository.deleteProduct(req.params.productId);
      if (!result) {
        res.status(404).send();
        return;
      }
      res.status(204);
    }
  )
  .route(
    {
      method: 'get',
      path: singleProductImageRoute,
      description: 'Get Product Image',
      params: productImageParams,
      responses: {
        200: z.any(),
      },
    },
    (req, res) => {
      const image = ProductsRepository.getProductImage(req.params.productId, req.params.imageId);
      if (!image) {
        res.status(404).send();
        return;
      }
      res.sendFile(image);
    }
  )
  .route(
    {
      method: 'get',
      path: allProductImagesRoute,
      description: 'Get Product Images',
      params: productIdParams,
      responses: {
        200: z.array(z.string()),
      },
    },
    (req, res) => {
      const images = ProductsRepository.getProductImages(req.params.productId);
      if (!images || images.size === 0) {
        res.json([]);
        return;
      }
      const filePaths = Array.from(images).map(([id, image]) => `/api/products/${req.params.productId}/images/${id}`);
      res.json(filePaths);
    }
  )
  .route(
    {
      method: 'post',
      path: allProductImagesRoute,
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
      const imageId = ProductsRepository.createProductImage(Number(req.params.productId), req.file.path);
      res.status(201).json({
        id: imageId,
        imageUrl: `/api/products/${req.params.productId}/images/${imageId}`,
      });
    }
  );
