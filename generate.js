const fs = require("mz/fs");
const path = require("path");

async function main() {
  const filename = process.argv[2];
  const outputFilename = path.basename(filename, ".ast") + ".js";
  const contents = (await fs.readFile(filename)).toString();
  try {
    const ast = JSON.parse(contents);
    const jsCode = generateJs(ast, []);
    await fs.writeFile(outputFilename, jsCode);
    console.log(`Wrote ${outputFilename}.`);
  } catch (e) {
    console.log("Parse failed", e.message);
  }
}

function generateJs(statements, declaredVariable) {
  const lines = [];
  for (let statement of statements) {
    if (statement.type === "var_assignment") {
      const value = generateJSForExpression(statement.value, declaredVariable);
      if (declaredVariable.indexOf(statement.varname) === -1){
        lines.push(`let ${statement.varname} = ${value};`);
        declaredVariable.push(statement.varname);
      }else{
        lines.push(`${statement.varname} = ${value};`);
      }
      
    } else if (statement.type === "print_statement") {
      const expression = generateJSForExpression(
        statement.expression,
        declaredVariable
      );
      lines.push(`console.log(${expression});`);
    } else if (statement.type === "while_loop") {
      const condition = generateJSForExpression(
        statement.condition,
        declaredVariable
      );
      const body = generateJs(statement.body, declaredVariable)
        .split("\n")
        .map((line) => "  " + line)
        .join("\n");
      lines.push(`while (${condition}) {\n${body}\n}`);
    }
  }
  return lines.join("\n");
  // return "console.log('Hello World!');";
}

function generateJSForExpression(expression, declaredVariable) {
  const operatorMap = {
    "+": "+",
    "-": "-",
    x: "*",
    "/": "/",
    ">": ">",
    "<": "<",
    ">=": ">=",
    "<=": "<=",
    "=": "===",
  };

  if (typeof expression === "object") {
    if (expression.type === "binary_expression") {
      const left = generateJSForExpression(expression.left, declaredVariable);
      const right = generateJSForExpression(expression.right, declaredVariable);
      const operator = operatorMap[expression.operator];
      return `${left} ${operator} ${right}`;
    }
  } else {
    return expression;
  }
}

main();
