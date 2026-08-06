import { app } from "./app.js";
import { getPort } from "./config.js";

const port = getPort(process.env.PORT);

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
