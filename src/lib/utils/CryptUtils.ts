import md5 from "md5";

export const CryptUtils = {
    getMd5(value: string): string {
        return md5(value);
    },
    getMd5UpperCase(value: string): string {
        return this.getMd5(value).toUpperCase();
    },
};
