import type { PoolConfig } from "pg";

const portString = process.env.SERVER_PORT ? process.env.SERVER_PORT : "4000";
export const portNumeric = Number(portString);

function getRequiredEnvironmentVariable(environmentVariableName: string): string {
    const variable = process.env[environmentVariableName];
    if (typeof variable === "string" && variable.trim() !== "") {
        return variable;
    }
    throw new Error(`Invalid ${environmentVariableName} in .env`);
}

function getDatabasePort(): number {
    const databasePortString = getRequiredEnvironmentVariable("POSTGRES_PORT");
    const databasePort = Number(databasePortString);

    if (Number.isInteger(databasePort) && databasePort > 0 && databasePort <= 65535)
        return databasePort;

    throw new Error("Invalid POSTGRES_PORT in .env");
}

export const databaseConfig: PoolConfig = {
    host: getRequiredEnvironmentVariable("DB_HOST"),
    port: getDatabasePort(),
    user: getRequiredEnvironmentVariable("POSTGRES_USER"),
    password: getRequiredEnvironmentVariable("POSTGRES_PASSWORD"),
    database: getRequiredEnvironmentVariable("POSTGRES_DB"),
};
