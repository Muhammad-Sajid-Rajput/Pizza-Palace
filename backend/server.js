import * as dotenv from "dotenv";
import cron from "node-cron";
import connectDB from "./src/config/database.js";
import { checkInventoryThreshold } from "./src/utils/inventoryCheck.js";
import { createApp } from "./src/app.js";

dotenv.config();

const app = createApp();
const PORT = Number(process.env.PORT) || 3002;
const CRON_ENABLED = process.env.ENABLE_INVENTORY_CRON !== "false";

await connectDB();

if (CRON_ENABLED) {
  cron.schedule("0 * * * *", async () => {
    console.log("Running inventory threshold check...");
    await checkInventoryThreshold();
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
