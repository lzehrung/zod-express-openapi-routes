import { zodiosApiApp } from "./zodios-helpers";
import productsController from "./products/products-controller";

const app = zodiosApiApp(
  {
    title: "ACME Products API",
    version: "1.0.0",
    docsPath: `/api/reference`,
    swaggerPath: `/api/swagger.json`,
  },
  [productsController]
);

app.use((req, res) => {
  res.redirect("/api/reference");
});

export default app;
