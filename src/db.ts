import { Pool } from "pg";
import { databaseConfig } from "./config.js";

export const databasePool = new Pool(databaseConfig);
