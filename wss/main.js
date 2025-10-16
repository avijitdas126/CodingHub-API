import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { setup } from "../cmd/main.js";

export function webSocket(ws){
    const id = randomUUID();
  console.log(`New client connected at ${id}`);
  let currentLang = null;
  let child = null;
  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (err) {
      return ws.send(JSON.stringify({ type: "error", data: "Invalid JSON" }));
    }
    let { lang, type, code, input } = data;
    if (
      (lang.startsWith("go") ||
        lang.startsWith("c") ||
        lang.startsWith("c++") ||
        lang.startsWith("cpp") ||
        lang.startsWith("java") ||
        lang.startsWith("py") ||
        lang.startsWith("js") ||
      lang.startsWith("ts")) &&
      type == "run"
    ) {
      // Kill previous process if still running
      if (child) {
        child.kill("SIGTERM");
      }
      const cmd = setup(id, lang, code);
      console.log("Running:", cmd);
      child = spawn(cmd, { shell: true });
      currentLang = lang;

      child.stdout.on("data", (data) => {
        console.log("stdout ", data.toString());
        ws.send(JSON.stringify({ type: "stdout", data: data.toString() }));
      });
      child.stderr.on("data", (data) => {
        console.log("stderr ", data.toString());
        ws.send(JSON.stringify({ type: "stderr", data: data.toString() }));
      });
      child.on("close", (code) => {
        ws.send(JSON.stringify({ type: "exit", code }));
        cleanupTmp();
        child = null;
      });
    } // 💬 handle real-time input
    else if (type === "input") {
      if (child) {
        if (child) child.stdin.write(input.replace(/,/g, " ") + "\n");
      } else {
        ws.send(
          JSON.stringify({ type: "error", data: "No program is running" })
        );
      }
    } else if (type == "kill" && child) {
      child.kill("SIGTERM");
      ws.send(JSON.stringify({ type: "killed" }));
       cleanupTmp();
      currentProcess = null;
    } else {
      ws.send(
        JSON.stringify({
          error:
            "Only Go,C,C++,Java,Python,Typescript and Javascript languages are supportted",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected at ${id}`);
  });
}

  function cleanupTmp() {
    const tmp = path.join(__dirname, `../tmp/${id}`);
    if (fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true, force: true });
  }
