import server from './server';

const port = Number(process.argv[2]) || 3250;

server.listen(port, () => {
  console.log(`Server started http://localhost:${port}`);
});
