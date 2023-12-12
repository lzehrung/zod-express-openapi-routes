import { z } from 'zod';
import { getListParam, product, productList } from './api-schemas';
// import { apiBuilder, errorResponse, notFoundResponse } from "../zodios-helpers";
import {RouteConfig, RouteResponses, ZodApiController} from '../zod-to-openapi';
import { ResponseObject } from 'openapi3-ts/oas31';
import {Request, Response} from "express";
import {ProductRepository} from "./product-repository";

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

const defaultErrors: RouteResponses = {
  404: errorFormat
}

export const productController = new ZodApiController(defaultErrors)
  .route({
    method: 'get',
    path: allProductsRoute,
    description: 'Get Products',
    query: getListParam,
    responses: {
      200: productList,
    },
  }, (req, res) => {
    const product = ProductRepository.getProducts({ ...req.query });
    if (!product) {
      res.status(404).json({ message: 'Product not found', data: req.query }).send();
      return;
    }
    res.json(product);
  });
  // .route({
  //   method: 'post',
  //   path: allProductsRoute,
  //   description: 'Create product',
  //   body: product,
  //   responses: {
  //     201: product,
  //   },
  //   handler: (req, res) => {
  //     res.send([]);
  //   },
  // })
  // .route({
  //   method: 'get',
  //   path: singleProductRoute,
  //   description: 'Get Product',
  //   params: z.object({
  //     productId: z.number(),
  //   }),
  //   responses: {
  //     200: product,
  //   },
  //   handler: (req, res) => {
  //     res.send([]);
  //   },
  // })
  // .route({
  //   method: 'patch',
  //   path: singleProductRoute,
  //   description: 'Update Product',
  //   params: z.object({
  //     productId: z.number(),
  //   }),
  //   body: product.partial(),
  //   responses: {
  //     204: z.object({}),
  //   },
  //   handler: (req, res) => {
  //     res.send([]);
  //   },
  // })
  // .route({
  //   method: 'delete',
  //   path: singleProductRoute,
  //   description: 'Delete Product',
  //   params: z.object({
  //     productId: z.number(),
  //   }),
  //   responses: {
  //     204: z.object({}),
  //   },
  //   handler: (req, res) => {
  //     res.send([]);
  //   },
  // })
  // .route({
  //   method: 'get',
  //   path: allProductImagesRoute,
  //   description: 'Get Product Images',
  //   params: z.object({
  //     productId: z.number(),
  //   }),
  //   responses: {
  //     200: z.array(z.string()),
  //   },
  //   handler: (req, res) => {
  //     res.send([]);
  //   },
  // });
