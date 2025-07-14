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
  const ast: Record<
    string,
    {
      kind: "interface" | "type";
      properties: Record<string, string>;
      references: Set<string>;
      definition?: string; // For type aliases
    }
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

            // If the type is another interface or type, add a reference
            if (
              type in ast ||
              files.some(
                (f) =>
                  fs.readFileSync(f, "utf8").includes(`interface ${type}`) ||
                  fs.readFileSync(f, "utf8").includes(`type ${type}`)
              )
            ) {
              references.add(type);
            }
          }
        });

        ast[name] = { kind: "interface", properties, references };
      } else if (ts.isTypeAliasDeclaration(node)) {
        const name = node.name.text;
        const references = new Set<string>();
        const definition = checker.typeToString(
          checker.getTypeFromTypeNode(node.type)
        );

        // Extract references from type definition
        const typeText = node.type.getText();
        files.forEach((f) => {
          const content = fs.readFileSync(f, "utf8");
          const interfaceMatches = content.match(/interface\s+(\w+)/g);
          const typeMatches = content.match(/type\s+(\w+)/g);

          [...(interfaceMatches || []), ...(typeMatches || [])].forEach(
            (match) => {
              const typeName = match.split(/\s+/)[1];
              if (typeText.includes(typeName) && typeName !== name) {
                references.add(typeName);
              }
            }
          );
        });

        ast[name] = {
          kind: "type",
          properties: {},
          references,
          definition,
        };
      }
    });
  }
  return ast;
}

// MAIN
const rootDir = path.resolve(__dirname, "../src"); // Adjust as needed
const files = getAllTSFiles(rootDir);
const ast = parseInterfaces(files);

// Convert Sets to Arrays for JSON serialization
const serializedAst = Object.fromEntries(
  Object.entries(ast).map(([name, data]) => [
    name,
    { ...data, references: Array.from(data.references) },
  ])
);

// Output as JSON or visualize as needed
fs.writeFileSync(
  "public/data/unigraph-ast/interface-ast.json",
  JSON.stringify(serializedAst, null, 2)
);
console.log("Interface and Type AST written to interface-ast.json");
