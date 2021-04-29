export const DateUtils = {
    getDateTimeAnsi(data: Date = new Date()): string {
        return this.getDateAnsi(data) + " " + this.getTimeAnsi(data);
    },
    getDateAnsi(data: Date = new Date()): string {
        return (String(data.getFullYear()).padStart(4, "0") + "-" + String(data.getMonth() + 1).padStart(2, "0") + "-" + String(data.getDate()).padStart(2, "0"));
    },
    getTimeAnsi(data: Date = new Date()): string {
        return (String(data.getHours()).padStart(2, "0") + ":" + String(data.getMinutes()).padStart(2, "0") + ":" + String(data.getSeconds()).padStart(2, "0"));
    },
};
