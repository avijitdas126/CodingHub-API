import { Router } from "express";
import { health } from "./GET/route.js";
import { exec } from "./POST/route.js";
export const route=Router()

route.use('/health',health)
route.use('/exec',exec)