import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Insert setbuf(stdout, NULL); at the start of the main function body.
 * Works for `int main(...)`, `void main(...)`, with brace on same line or next line.
 *
 * @param {string} src - original C/C++ source code
 * @returns {string} patched source
 */

function injectSetbufIntoMain(src) {
  // Find the position of a main declaration (int|void main(...))
  // This regex finds the signature but not the opening brace reliably.
  const mainSigRegex = /(^\s*(?:int|void)\s+main\s*\([^)]*\))/im;
  const sigMatch = src.match(mainSigRegex);
  if (!sigMatch) {
    // no main found — return original source
    return src;
  }

  // index where signature ends
  const sigEndIndex = sigMatch.index + sigMatch[0].length;

  // search for the first '{' after the signature end
  const rest = src.slice(sigEndIndex);
  const braceIndexInRest = rest.indexOf("{");

  if (braceIndexInRest === -1) {
    // No brace found after signature — return original source
    return src;
  }

  // absolute index of the opening brace in the source string
  const absBraceIndex = sigEndIndex + braceIndexInRest;

  // insert our line after the brace, preserving indentation
  // determine indentation of the next line (if any)
  // we'll insert "setbuf(stdout, NULL);\n" with same indentation + 4 spaces
  // but simplest: insert with one level indentation (4 spaces)
  const insertion = "\n    setbuf(stdout, NULL);\n";

  const patched =
    src.slice(0, absBraceIndex + 1) + insertion + src.slice(absBraceIndex + 1);
  return patched;
}
/**
 * Find Main class from original code
 *
 * @param {string} code - original java source code
 * @returns {string} main class
 */
function find_class_java(code) {
  // Step 1: Match all class names
  const classMatches = [...code.matchAll(/class\s+(\w+)/g)];
  // Step 2: Find the class that contains main()
  let mainClass = null;
  for (const m of classMatches) {
    const className = m[1];
    // Regex to check if this class has main()
    const classBodyRegex = new RegExp(
      `class\\s+${className}\\s*\\{([\\s\\S]*?)\\}`,
      "m"
    );
    const bodyMatch = code.match(classBodyRegex);
    if (
      bodyMatch &&
      /public\s+static\s+void\s+main\s*\(\s*String\[\]\s+\w+\s*\)/.test(
        bodyMatch[1]
      )
    ) {
      mainClass = className;
      break;
    }
  }
  return mainClass;
}

export function setup(id, lang, code) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const tmp = path.join(__dirname, `../tmp/${id}`);
  let tmp_file;
  let mainClass = null;
  //creating tmp file
  const is_exit = fs.existsSync(tmp);
  if (!is_exit) {
    fs.mkdirSync(tmp, { recursive: true });
  }
  if (lang.startsWith("c++") || lang.startsWith("cpp") || lang.startsWith("c")) {
    tmp_file = path.join(tmp, `${id}.cpp`);
  } else if (lang.startsWith("java")) {
    mainClass = find_class_java(code);
    tmp_file = path.join(tmp, `${mainClass}.java`);
  } else {
    tmp_file = path.join(tmp, `${id}.${lang}`);
  }
  // writing data of file
  let cs = fs.createWriteStream(tmp_file);
  if (lang.startsWith("c") || lang.startsWith("c++") || lang.startsWith("cpp")) {
    // find 'int main' and insert 'setbuf(stdout,NULL);' after the opening brace
    code = injectSetbufIntoMain(code);
  }
  cs.write(code);
  cs.end();
  let command = cmd(lang, id, mainClass);
  return command;
}

export function cmd(lang, id, mainClass = null) {
  let cmd = null;
  if (lang.startsWith("c++") || lang.startsWith("cpp") || lang.startsWith("c")) {
    cmd = `cd tmp/${id} && g++ ${id}.cpp -o ./maincpp && ./maincpp`;
  } else if (lang.startsWith("java")) {
    cmd = `cd tmp/${id} && javac ${mainClass}.java && java ${mainClass}`;
  } else if (lang.startsWith("py")) {
    cmd = `cd tmp/${id} && python -u ${id}.py`;
  } else if (lang.startsWith("go")) {
    cmd = `cd tmp/${id} && go build ${id}.go && ./${id}`;
  } else if (lang.startsWith("js")) {
    cmd = `cd tmp/${id} && node ${id}.js`;
  }
  return cmd;
}
