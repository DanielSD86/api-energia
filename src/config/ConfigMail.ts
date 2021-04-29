import dotenv from "dotenv";
import { IConfigMail } from "@lib/mail/IConfigMail";

dotenv.config();

export function DefaultConfigMail(): IConfigMail {
    return {
        host: process.env.HOST_MAIL,
        port: parseInt(process.env.PORT_MAIL || "587"),
        secure: process.env.PORT_MAIL === "S",
        from: {
            login: process.env.USER_MAIL_NO_REPLY,
            password: process.env.PASSWORD_MAIL_NO_REPLY,
            name: process.env.NAME_MAIL_NO_REPLY,
        }
    };
}
