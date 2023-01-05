import app from "./server";

const port = Number(process.argv[2]) || 3250;

app.listen(port, () => {
  console.log(`Server started http://localhost:${port}`);
});
