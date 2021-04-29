import jsonwebtoken from "jsonwebtoken";
import { IConfigSecurityAuth, IDataSecurityAuth, } from "@lib/security/IConfigSecurityAuth";
import { ISecurityAuth } from "@lib/security/ISecurityAuth";
import { NextFunction, Request, Response } from "express";

export class JwtSecurityAuth implements ISecurityAuth {
    static instance: JwtSecurityAuth;

    static MSG_TOKEN_NOT_FOUND = "Token não informado, efetue o login.";
    static MSG_TOKEN_EXPIRED = "Token expirou, efetue o login novamente.";
    static MSG_TOKEN_INVALID = "Dados do token são inválidos. Efetue login novamente.";

    static ID_TOKEN = "x-access-token";
    static ID_SESSION = "session";

    config: IConfigSecurityAuth;

    constructor(config: IConfigSecurityAuth) {
        this.config = config;
    }

    static getInstance(config: IConfigSecurityAuth): JwtSecurityAuth {
        if (!JwtSecurityAuth.instance) {
            JwtSecurityAuth.instance = new JwtSecurityAuth(config);
        }
        return JwtSecurityAuth.instance;
    }

    async generateToken(data: IDataSecurityAuth): Promise<string> {
        return jsonwebtoken.sign(data, this.config.token, {
            expiresIn: this.config.expiresIn,
        });
    }

    async decodeToken(token: string): Promise<IDataSecurityAuth> {
        const data = jsonwebtoken.verify(token, this.config.token);
        return data as IDataSecurityAuth;
    }

    validateAuthController = async (request: Request, response: Response, next: NextFunction) => {
        const token = request.headers[JwtSecurityAuth.ID_TOKEN] as string;

        if (!token) {
            return response
                .status(401)
                .json({ message: [JwtSecurityAuth.MSG_TOKEN_NOT_FOUND] });
        } else {
            jsonwebtoken.verify(
                token,
                this.config.token,
                function (error, decoded) {
                    if (error) {
                        return response
                            .status(401)
                            .json({ message: [JwtSecurityAuth.MSG_TOKEN_EXPIRED] });
                    } else {
                        const data = decoded as IDataSecurityAuth;

                        const session: IDataSecurityAuth = {
                            empresa: data.empresa,
                            usuario: data.usuario,
                            login: data.login,
                            tenant: data.tenant,
                        };

                        if (!session.empresa || !session.usuario || !session.login || !session.tenant ) {
                            return response
                                .status(401)
                                .json({ message: [JwtSecurityAuth.MSG_TOKEN_INVALID] });
                        }

                        request[JwtSecurityAuth.ID_SESSION] = session;

                        next();
                    }
                }
            );
        }
    };
}
