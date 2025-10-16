import { Router } from "express";
import { setup } from "../../cmd/main.js";
import { run } from "../../cmd/run.js";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
export const exec = Router();

exec.post("/", (req, res) => {
  let { lang, code, input } = req.body;
  if (
    lang.startsWith("go") ||
    lang.startsWith("c") ||
    lang.startsWith("c++") ||
    lang.startsWith("cpp") ||
    lang.startsWith("java") ||
    lang.startsWith("py") ||
    lang.startsWith("js")  ||
    lang.startsWith("ts")
  ) {
    const id = randomUUID();
    const cmd = setup(id, lang, code);
    run(cmd, input, res, id);
  } else {
    res.json({
      error:
        "Only Go,C,C++,Java,Python,Typescript and Javascript languages are supportted",
    });
  }
});
