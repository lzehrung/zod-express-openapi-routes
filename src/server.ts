import { zodiosApiApp } from "./zodios-helpers";
import productsController from "./products/products-controller";

const app = zodiosApiApp(
  {
    title: "ACME Products API",
    version: "1.0.0",
  },
  [productsController]
);

export default app;
