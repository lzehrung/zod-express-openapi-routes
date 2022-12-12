import {TypedRequest, TypedRequestParams} from "zod-express-middleware";
import {Response} from "express";
import {Product} from "./db-models";
import {ServiceRepository} from "./service-repository";
import {routeParams} from "./product-api-schema";

export class ProductController {
    static getProduct(
        req: TypedRequestParams<typeof routeParams>,
        res: Response<Product>
    ) {
        const product = ServiceRepository.getProduct(req.params.id);
        if (!product) {
            res.status(404).send();
            return;
        }
        res.status(200).json(product);
    }
}