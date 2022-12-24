import { zodiosApp, zodiosRouter } from "@zodios/express";
import { openApiBuilder } from "@zodios/openapi";
import { serve, setup } from "swagger-ui-express";
import { ProductController2 } from "./products/product-controller-2";
import { getProductEndpoint, productApi, productsRouter } from "./products/products-routes";

const openApiDocs = openApiBuilder({
  title: "ACME Products API",
  version: "1.0.0",
})
  .addServer({ url: "" })
  .addPublicApi(productApi)
  .build();

const app = zodiosApp();

app.use("/", productsRouter);

app.use(`/swagger.json`, (_, res) => res.json(openApiDocs));
app.use("/api-docs", serve);
app.use("/api-docs", setup(undefined, { swaggerUrl: "/swagger.json" }));

// app.post("/products", (req, res) =>
//   ProductController2.createProduct(req as any, res as any)
// );

export default app;
