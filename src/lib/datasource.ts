import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  "type": "sqlite",
  "database": "interview.sqlite",
  "synchronize": true,
  "logging": false,
  "entities": [
    "src/models/*/entity.ts"
  ],
})

export function createConnection(): Promise<DataSource> {
  return AppDataSource.initialize();
}
