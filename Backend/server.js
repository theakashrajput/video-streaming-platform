import { dotenv } from "./config/env.config.js";
import app from "./src/app.js";
import connectToDB from "./src/db/db.js";

const PORT = dotenv.PORT || 5000;

connectToDB()
  .then(() => {
    app.on("ERROR", (error) => {
      console.error("ERROR: ", error);
      throw error;
    });
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch((error) => console.error("MONGODB connect failed !", error));
