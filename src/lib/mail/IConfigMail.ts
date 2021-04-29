export interface IConfigAuthMail {
    login: string;
    password: string;
    name: string;
}

export interface IConfigMail {
    host: string;
    port: number;
    secure: boolean;

    from: IConfigAuthMail;
}

export interface IDataMail {
    subject: string;
    to: string[];
    bcc?: string[];
    text?: string;
    html?: string;
    attachments?: string[];
}

export interface IResultMail {
    status: boolean;
    message: string[];
}
