import { dotenv } from "./config/env.config.js";
import app from "./src/app.js";

const PORT = dotenv.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
