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
      kind: "interface" | "type" | "function" | "class";
      properties: Record<string, string>;
      references: Set<string>;
      definition?: string; // For type aliases
      arguments?: Record<string, string>; // For functions
      returnType?: string; // For functions
      methods?: Record<string, { arguments: Record<string, string>; returnType: string }>; // For classes
      extends?: string; // For classes that extend other classes
      implements?: string[]; // For classes that implement interfaces
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
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        const name = node.name.text;
        const references = new Set<string>();
        const functionArguments: Record<string, string> = {};

        // Parse function parameters
        node.parameters.forEach((param) => {
          if (param.name && ts.isIdentifier(param.name) && param.type) {
            const paramName = param.name.text;
            const paramType = checker.typeToString(
              checker.getTypeFromTypeNode(param.type)
            );
            functionArguments[paramName] = paramType;

            // Add reference if it's a custom type
            if (
              paramType in ast ||
              files.some(
                (f) =>
                  fs
                    .readFileSync(f, "utf8")
                    .includes(`interface ${paramType}`) ||
                  fs.readFileSync(f, "utf8").includes(`type ${paramType}`)
              )
            ) {
              references.add(paramType);
            }
          }
        });

        // Parse return type
        let returnType = "void";
        if (node.type) {
          returnType = checker.typeToString(
            checker.getTypeFromTypeNode(node.type)
          );
          if (
            returnType in ast ||
            files.some(
              (f) =>
                fs
                  .readFileSync(f, "utf8")
                  .includes(`interface ${returnType}`) ||
                fs.readFileSync(f, "utf8").includes(`type ${returnType}`)
            )
          ) {
            references.add(returnType);
          }
        }

        ast[name] = {
          kind: "function",
          properties: {},
          references,
          arguments: functionArguments,
          returnType,
        };
      } else if (ts.isClassDeclaration(node) && node.name) {
        const name = node.name.text;
        const references = new Set<string>();
        const properties: Record<string, string> = {};
        const methods: Record<string, { arguments: Record<string, string>; returnType: string }> = {};
        let extendsClass: string | undefined;
        const implementsInterfaces: string[] = [];

        // Check for extends clause
        if (node.heritageClauses) {
          for (const clause of node.heritageClauses) {
            if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
              const extendedType = clause.types[0];
              if (ts.isIdentifier(extendedType.expression)) {
                extendsClass = extendedType.expression.text;
                references.add(extendsClass);
              }
            } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
              for (const type of clause.types) {
                if (ts.isIdentifier(type.expression)) {
                  const implementedInterface = type.expression.text;
                  implementsInterfaces.push(implementedInterface);
                  references.add(implementedInterface);
                }
              }
            }
          }
        }

        // Parse class members
        node.members.forEach((member) => {
          if (ts.isPropertyDeclaration(member) && member.type && ts.isIdentifier(member.name)) {
            const propName = member.name.text;
            const propType = checker.typeToString(
              checker.getTypeFromTypeNode(member.type)
            );
            properties[propName] = propType;

            // Add reference if it's a custom type
            if (
              propType in ast ||
              files.some((f) =>
                fs.readFileSync(f, "utf8").includes(`interface ${propType}`) ||
                fs.readFileSync(f, "utf8").includes(`type ${propType}`) ||
                fs.readFileSync(f, "utf8").includes(`class ${propType}`)
              )
            ) {
              references.add(propType);
            }
          } else if (ts.isMethodDeclaration(member) && ts.isIdentifier(member.name)) {
            const methodName = member.name.text;
            const methodArguments: Record<string, string> = {};

            // Parse method parameters
            member.parameters.forEach((param) => {
              if (param.name && ts.isIdentifier(param.name) && param.type) {
                const paramName = param.name.text;
                const paramType = checker.typeToString(
                  checker.getTypeFromTypeNode(param.type)
                );
                methodArguments[paramName] = paramType;

                // Add reference if it's a custom type
                if (
                  paramType in ast ||
                  files.some((f) =>
                    fs.readFileSync(f, "utf8").includes(`interface ${paramType}`) ||
                    fs.readFileSync(f, "utf8").includes(`type ${paramType}`) ||
                    fs.readFileSync(f, "utf8").includes(`class ${paramType}`)
                  )
                ) {
                  references.add(paramType);
                }
              }
            });

            // Parse return type
            let returnType = 'void';
            if (member.type) {
              returnType = checker.typeToString(
                checker.getTypeFromTypeNode(member.type)
              );
              if (
                returnType in ast ||
                files.some((f) =>
                  fs.readFileSync(f, "utf8").includes(`interface ${returnType}`) ||
                  fs.readFileSync(f, "utf8").includes(`type ${returnType}`) ||
                  fs.readFileSync(f, "utf8").includes(`class ${returnType}`)
                )
              ) {
                references.add(returnType);
              }
            }

            methods[methodName] = { arguments: methodArguments, returnType };
          }
        });

        ast[name] = {
          kind: 'class',
          properties,
          references,
          methods,
          extends: extendsClass,
          implements: implementsInterfaces.length > 0 ? implementsInterfaces : undefined
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
console.log("Complete AST (interfaces, types, functions, classes) written to interface-ast.json");
