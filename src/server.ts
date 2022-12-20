import { z } from "zod";
import { openApiRoutes, extendZodWithOpenApi } from "./open-api-helpers";
extendZodWithOpenApi(z);
import express from "express";
import { productRoutes } from "./products/product-routes";

const router = express.Router();

router.use(
  openApiRoutes({
    info: {
      title: "ACME Products API",
      version: "1.0.0",
    },
    routes: [...productRoutes],
    version: "3.0.0",
  })
);

router.use("/", (req, res) => {
  res.redirect("/api-docs");
});

const app = express();
app.use(express.json());
app.use(router);

export default app;
