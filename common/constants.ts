import { config } from "dotenv";
config();

export const SUBGRAPH_URL = process.env.SUBGRAPH_URL || "";
export const ROWS_TO_PULL = 1000;