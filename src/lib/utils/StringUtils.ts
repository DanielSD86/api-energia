export const StringUtils = {
    getNumberOnly(value: string): string {
        return value.replace(/\D/g, "");
    },
    getFormatMsg(value: string, ...args: string[]): string {
        return value.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined' ? args[number] : match;
            ;
        });
    }
};
