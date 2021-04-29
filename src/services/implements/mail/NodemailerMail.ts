import nodemailer from "nodemailer";
import Mail, { Options } from "nodemailer/lib/mailer";
import { IConfigMail, IDataMail, IResultMail } from "@lib/mail/IConfigMail";
import { IMail } from "@lib/mail/IMail";

export class NodemailerMail implements IMail {
    static instance: NodemailerMail;

    config: IConfigMail; 
    transporter: Mail;   

    static getInstance(config: IConfigMail): NodemailerMail {
        if (!NodemailerMail.instance) {
            NodemailerMail.instance = new NodemailerMail(config);
        }
        return NodemailerMail.instance;
    }

    constructor(config: IConfigMail) {
        this.config = config;

        this.transporter = nodemailer.createTransport({
            host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                auth: {
                    user: this.config.from.login,
                    pass: this.config.from.password,
                } 
        });
    }

    sendNoWait(data: IDataMail): void {
        this.send(data).then(() => {
            console.log("Sucesso");
        }).catch((error) => {
            console.error(error);
        });
    }

    async send(data: IDataMail): Promise<IResultMail> {
        const sendMail: Options = {
            from: this.config.from.name,
            to: data.to.join(";"),
            bcc: (data.bcc || []).join(";"),
            subject: data.subject,
            text: (data.text ?? undefined),
            html: (data.html ?? undefined),
        };

        try {
            await this.transporter.sendMail(sendMail);

            return { 
                status: true,
                message: [],
            };
        } catch (e) {
            return {
                status: false,
                message: [e.message],
            };
        }
    }
}