const nearley = require("nearley");
const grammar = require("./ng.js");
const fs = require("mz/fs");
const path = require("path");

async function main(){
    const parser = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammar)
    );
    const filename = process.argv[2];
    const outputFilename = path.basename(filename,".ng") + ".ast";
    const code = (await fs.readFile(filename)).toString();
    try {
        parser.feed(code);
        const ast = parser.results[0];
        await fs.writeFile(outputFilename, JSON.stringify(ast, null, "  "));
        console.log("Parse succeed");
        console.log(`Wrote ${outputFilename}.`);
    } catch (e) {
        console.log("Parse failed", e.message);
    }
}

main();