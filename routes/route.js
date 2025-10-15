import { Router } from "express";
import { health } from "./GET/route.js";
export const route=Router()

route.use('/health',health)
