import dotenv from "dotenv";

import { AppService } from "@services/AppService";
import { NextFunction, Request, Response } from "express";

dotenv.config();
const app = AppService();

app.get("/", (request: Request, response: Response, next: NextFunction) => {
    return response.json({ message: "Api-Energia" });
});

app.listen(process.env.PORT || 3001, () => {
    console.log("Servidor iniciado.");
});
