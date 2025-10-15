import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function run(cmd, input, res) {
  try {
    console.log("Running:", cmd);
    let child = spawn(cmd, { shell: true, stdio: ["pipe", "pipe", "pipe"] });
    let output = "";
    let errorOutput = "";
    child.stdout.on("data", (data) => {
      console.log("stdout ", data.toString());
      output += data.toString();
    });
    child.stderr.on("data", (data) => {
      console.log("stderr ", data.toString());
      errorOutput += data.toString();
    });
    if (input && input.trim() !== "") {
      let inA = input.split(",");
      inA.map((e) => {
        child.stdin.write(e + "\n");
      });
    }
    child.stdin.end(); // close stdin so program doesn't hang waiting for more input
    child.on("close", (code) => {
      if (errorOutput && !output) {
        res.json({ error: errorOutput });
      } else {
        res.json({ output });
      }
    });
    setTimeout(() => {
      child.kill("SIGTERM");
      if (!res.headersSent) {
        res.json({ error: "Execution timeout" });
      }
    }, 5000);
  } catch (error) {
    res.json({ error: err.message });
  } finally {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const tmp = path.join(__dirname, `../../tmp/${id}`);
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`Tmp folder is deleted successfully ${tmp}`);
  }
}
