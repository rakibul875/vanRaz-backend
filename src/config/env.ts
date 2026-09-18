import dotenv from "dotenv";
dotenv.config();

export const envVars = {
  port: process.env.PORT || 5000,
  dbUri: process.env.MONGODB_URL as string,
};

if (!envVars.dbUri) {
  console.error("FATAL ERROR: MONGODB_URL environment variable is missing.");
  process.exit(1);
}
