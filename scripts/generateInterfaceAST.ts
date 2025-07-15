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
  const interfaces: Record<string, any> = {};

  for (const sourceFile of program.getSourceFiles()) {
    if (!files.includes(sourceFile.fileName)) continue;

    ts.forEachChild(sourceFile, (node) => {
      if (
        ts.isInterfaceDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isFunctionDeclaration(node)
      ) {
        const name = (node as any).name?.text;
        if (!name) return;
        let kind = "interface";
        if (ts.isClassDeclaration(node)) kind = "class";
        if (ts.isTypeAliasDeclaration(node)) kind = "type";
        if (ts.isFunctionDeclaration(node)) kind = "function";

        const properties: Record<string, string> = {};
        const references = new Set<string>();

        if (ts.isInterfaceDeclaration(node)) {
          node.members.forEach((member) => {
            if (ts.isPropertySignature(member) && member.type) {
              const propName = (member.name as ts.Identifier).text;
              const type = checker.typeToString(
                checker.getTypeFromTypeNode(member.type)
              );
              properties[propName] = type;

              // If the type is another interface or type, add a reference
              if (
                type in interfaces ||
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
        } else if (ts.isTypeAliasDeclaration(node)) {
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
        } else if (ts.isFunctionDeclaration(node) && node.name) {
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
                paramType in interfaces ||
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
              returnType in interfaces ||
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

          interfaces[name] = {
            kind: "function",
            properties: {},
            references,
            arguments: functionArguments,
            returnType,
            file: sourceFile.fileName,
          };
        } else if (ts.isClassDeclaration(node) && node.name) {
          const properties: Record<string, string> = {};
          const methods: Record<
            string,
            { arguments: Record<string, string>; returnType: string }
          > = {};
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
            if (
              ts.isPropertyDeclaration(member) &&
              member.type &&
              ts.isIdentifier(member.name)
            ) {
              const propName = member.name.text;
              const propType = checker.typeToString(
                checker.getTypeFromTypeNode(member.type)
              );
              properties[propName] = propType;

              // Add reference if it's a custom type
              if (
                propType in interfaces ||
                files.some(
                  (f) =>
                    fs
                      .readFileSync(f, "utf8")
                      .includes(`interface ${propType}`) ||
                    fs.readFileSync(f, "utf8").includes(`type ${propType}`) ||
                    fs.readFileSync(f, "utf8").includes(`class ${propType}`)
                )
              ) {
                references.add(propType);
              }
            } else if (
              ts.isMethodDeclaration(member) &&
              ts.isIdentifier(member.name)
            ) {
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
                    paramType in interfaces ||
                    files.some(
                      (f) =>
                        fs
                          .readFileSync(f, "utf8")
                          .includes(`interface ${paramType}`) ||
                        fs
                          .readFileSync(f, "utf8")
                          .includes(`type ${paramType}`) ||
                        fs
                          .readFileSync(f, "utf8")
                          .includes(`class ${paramType}`)
                    )
                  ) {
                    references.add(paramType);
                  }
                }
              });

              // Parse return type
              let returnType = "void";
              if (member.type) {
                returnType = checker.typeToString(
                  checker.getTypeFromTypeNode(member.type)
                );
                if (
                  returnType in interfaces ||
                  files.some(
                    (f) =>
                      fs
                        .readFileSync(f, "utf8")
                        .includes(`interface ${returnType}`) ||
                      fs
                        .readFileSync(f, "utf8")
                        .includes(`type ${returnType}`) ||
                      fs.readFileSync(f, "utf8").includes(`class ${returnType}`)
                  )
                ) {
                  references.add(returnType);
                }
              }

              methods[methodName] = { arguments: methodArguments, returnType };
            }
          });

          interfaces[name] = {
            kind: "class",
            properties,
            references,
            methods,
            extends: extendsClass,
            implements:
              implementsInterfaces.length > 0
                ? implementsInterfaces
                : undefined,
            file: sourceFile.fileName,
          };
        }
      }
    });
  }

  // Build _files and _directories
  const filesMap: Record<string, string[]> = {};
  for (const [name, data] of Object.entries(interfaces)) {
    if (data.file) {
      if (!filesMap[data.file]) filesMap[data.file] = [];
      filesMap[data.file].push(name);
    }
  }
  interfaces["_files"] = filesMap;

  // Build _directories
  const directoriesMap: Record<string, string[]> = {};
  for (const filePath of Object.keys(filesMap)) {
    const dir = path.dirname(filePath);
    if (!directoriesMap[dir]) directoriesMap[dir] = [];
    directoriesMap[dir].push(filePath);
  }
  interfaces["_directories"] = directoriesMap;

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
