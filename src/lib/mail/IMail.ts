import { IConfigMail, IDataMail, IResultMail } from "./IConfigMail";

export interface IMail {
    config: IConfigMail;

    send(data: IDataMail): Promise<IResultMail>;
    sendNoWait(data: IDataMail): void;
}