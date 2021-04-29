module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                targets: {
                    node: "current",
                },
            },
        ],
        "@babel/preset-typescript",
    ],
    plugins: [
        [
            "module-resolver",
            {
                alias: {
                    "@entities": "./src/entities",
                    "@services": "./src/services",
                    "@config": "./src/config",
                    "@lib": "./src/lib",
                    "@usecases": "./src/usecases",
                },
            },
        ],
        [
            "@babel/plugin-proposal-class-properties",
            {
                loose: true,
            },
        ],
    ],
    ignore: ["**/*.spec.ts"],
};
