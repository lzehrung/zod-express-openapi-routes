import path from 'path';
import express from "express";
import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIGenerator,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

import { registerProductRoutes } from "./products/product-routes";

const registry = new OpenAPIRegistry();

const router = express.Router();
registerProductRoutes(registry, router);

router.use('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, './templates/api-docs.html'));
});

router.use("/swagger.json", (req, res) => {
  const docGen = new OpenAPIGenerator(registry.definitions, "3.0.0");
  const docs = docGen.generateDocument({
    info: {
      title: "ACME API",
      version: "1.0.0",
    },
  });
  res.json(docs);
});

const app = express();
app.use(router);

app.listen(3000, () => {
  console.log("Server started http://localhost:3000");
});
