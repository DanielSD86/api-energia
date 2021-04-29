import { DefaultSecurityAuth } from "@config/ConfigSecurityAuth";
import { ISecurityAuth } from "@lib/security/ISecurityAuth";
import { JwtSecurityAuth } from "./implements/security/JwtSecurityAuth";

export function SecutiryAuthService(): ISecurityAuth {
    return JwtSecurityAuth.getInstance(DefaultSecurityAuth());
}