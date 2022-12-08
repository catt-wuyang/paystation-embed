import serve from "rollup-plugin-serve";
import { terser } from "rollup-plugin-terser";
import livereload from "rollup-plugin-livereload";
import sass from "rollup-plugin-sass";

export default [
  // browser UMD build
  {
    input: "src/main.js",
    output: [
      {
        name: "XPayStationWidget",
        file: "dist/paystation-embed.js",
        format: "iife",
        plugins: [
          sass(),
          serve({
            open: true,
            contentBase: "dist",
            port: "3003",
          }),
          livereload(),
        ],
      },
      {
        name: "paystation-embed",
        file: "dist/paystation-embed.min.js",
        format: "umd",
        sourcemap: true,
        plugins: [terser()],
      },
    ],
  },

  // CommonJS (for Node) & ES Module build
];
