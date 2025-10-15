import { Router } from "express";
export const health = Router();

 health.get("/", (req, res) => {
  res.json(
    JSON.stringify({ status: 200, message: "Resquest handled successfully" })
  );
});

