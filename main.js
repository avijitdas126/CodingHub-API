import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

import { route } from "./routes/route.js";
import cors from 'cors'
import { webSocket } from "./wss/main.js";

const app = express();

app.use(express.json())
app.use('/',route)
app.use(cors({
   origin:'*'
}))

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws)=>{
  webSocket(ws)
});


server.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});
