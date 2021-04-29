export const ListUtils = {
    join(list: any[], quoted: boolean): string {
        if (quoted)
            return "'" + list.join("','") + "'";
        else
            return list.join(",");
    },
};
