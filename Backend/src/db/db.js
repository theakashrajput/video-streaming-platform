import mongoose from "mongoose";
import { dotenv } from "../../config/env.config.js";

const connectToDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(dotenv.MONGO_URI);
        console.log(
            `MongoDB connected !! DB HOST: `,
            connectionInstance.connection.host
        );
    } catch (error) {
        console.error("MONGODB connection failed: ", error);
        process.exit(1);
    }
};

export default connectToDB;
