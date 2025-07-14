// save as scripts/generateInterfaceAST.ts
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Recursively get all .ts files in a directory
function getAllTSFiles(dir: string): string[] {
  let results: string[] = [];
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(getAllTSFiles(fullPath));
    } else if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
      results.push(fullPath);
    }
  });
  return results;
}

// Parse interfaces and their references
function parseInterfaces(files: string[]) {
  const program = ts.createProgram(files, {});
  const checker = program.getTypeChecker();
  const interfaces: Record<
    string,
    { properties: Record<string, string>; references: Set<string> }
  > = {};

  for (const sourceFile of program.getSourceFiles()) {
    if (!files.includes(sourceFile.fileName)) continue;

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isInterfaceDeclaration(node)) {
        const name = node.name.text;
        const properties: Record<string, string> = {};
        const references = new Set<string>();

        node.members.forEach((member) => {
          if (ts.isPropertySignature(member) && member.type) {
            const propName = (member.name as ts.Identifier).text;
            const type = checker.typeToString(
              checker.getTypeFromTypeNode(member.type)
            );
            properties[propName] = type;

            // If the type is another interface, add a reference
            if (
              type in interfaces ||
              files.some((f) =>
                fs.readFileSync(f, "utf8").includes(`interface ${type}`)
              )
            ) {
              references.add(type);
            }
          }
        });

        interfaces[name] = { properties, references };
      }
    });
  }
  return interfaces;
}

// MAIN
const rootDir = path.resolve(__dirname, "../src"); // Adjust as needed
const files = getAllTSFiles(rootDir);
const ast = parseInterfaces(files);

// Output as JSON or visualize as needed
fs.writeFileSync(
  "public/data/unigraph-ast/interface-ast.json",
  JSON.stringify(ast, null, 2)
);
console.log("Interface AST written to interface-ast.json");
