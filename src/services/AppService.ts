import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import { ConfigRouter } from "@config/ConfigRouter";

export function AppService() {
    const app = express();

    // Outras configurações
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());
    app.use(helmet());

    // Rotas
    const routers = ConfigRouter();
    for (const idx in routers) {
        app.use(routers[idx].path, routers[idx].router);
    }        

    return app;
}