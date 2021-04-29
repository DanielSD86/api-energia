import { IConfigAuthMail } from "@lib/mail/IConfigMail";
import { IMail } from "@lib/mail/IMail";
import { DefaultConfigMail } from "@config/ConfigMail";
import { NodemailerMail } from "./implements/mail/NodemailerMail";

export async function MailService(from?: IConfigAuthMail): Promise<IMail> {
    const configMail = DefaultConfigMail();

    if (from) {
        configMail.from = from;
        return new NodemailerMail(configMail);
    }

    return NodemailerMail.getInstance(configMail);
}