export const CompareUtils = {
    equalIn(value: string, ...list: string[]): boolean {
        return (list.find((item) => item.toLowerCase() == value.toLowerCase()) !== undefined);
    },
};
