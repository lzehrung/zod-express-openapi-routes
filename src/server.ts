import express from "express";
import { docs, productRoutes } from "./zodopenapi-product-api";

const router = express.Router();
router.use(productRoutes);
router.use("/swagger.json", (req, res) => {
  res.json(docs);
});

const app = express();
app.use('/', router);

app.listen(3000, () => {
  console.log("Server started http://localhost:3000");
});
