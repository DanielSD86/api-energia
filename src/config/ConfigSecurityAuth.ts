import { IConfigSecurityAuth } from "@lib/security/IConfigSecurityAuth";

export function DefaultSecurityAuth(): IConfigSecurityAuth{
    return {
        token: "api-token",
        expiresIn: "1h",
    };
}