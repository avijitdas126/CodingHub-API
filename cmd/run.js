import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function run(cmd, input, res, id) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const tmp = path.join(__dirname, `../../tmp/${id}`);

    console.log("Running:", cmd);
    const child = spawn(cmd, { shell: true, stdio: ["pipe", "pipe", "pipe"] });

    let output = "";
    let errorOutput = "";
let isResponded = false;
    child.stdout.on("data", (data) => (output += data.toString()));
    child.stderr.on("data", (data) => (errorOutput += data.toString()));

    // handle stdin
    if (input && input.trim() !== "") {
      child.stdin.write(input.replace(/,/g, " ") + "\n");
    }
    child.stdin.end();

    // timeout
    const timer = setTimeout(() => {
       if (!isResponded) {
    child.kill("SIGTERM");
   // res.json({ error: "Execution timeout" });
    isResponded = true;
  }
      // cleanup
      if (fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true, force: true });
    }, 60000);

    child.on("close", (code) => {
      clearTimeout(timer);
      if (errorOutput && !output) {
        res.json({ error: errorOutput });
      } else {
        res.json({ output });
      }
      // cleanup
      if (fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true, force: true });
      console.log(`Tmp folder deleted: ${tmp}`);
    });
  } catch (err) {
    res.json({ error: err.message });
  }
}
