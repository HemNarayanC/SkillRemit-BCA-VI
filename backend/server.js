import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./src/config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected");

        await sequelize.sync({ alter: false });
        console.log("Models synced");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("DB connection failed:", error);
    }
})();
