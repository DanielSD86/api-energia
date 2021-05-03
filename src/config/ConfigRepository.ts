import dotenv from "dotenv";
import IConfigRepository, { LEVEL_LOG_DB } from "@lib/repository/IConfigRepository";

dotenv.config();

export function DefaultConfigRepository(): IConfigRepository {
    return {
        connectionString: "postgres://" + process.env.USER_DB +
                            ":" + process.env.PASSWORD_DB +
                            "@" + process.env.HOST_DB +
                            ":" + process.env.PORT_DB +
                            "/" + process.env.NAME_DB,
        applicationName: "NidasApp",
        levelLog: (LEVEL_LOG_DB[process.env.LEVEL_LOG_DB] || LEVEL_LOG_DB.NONE),
    };
}

export function DefaultConfigLogs(): IConfigRepository {
    return {
        connectionString: "",
        applicationName: "NidasAppLog",
    };
}