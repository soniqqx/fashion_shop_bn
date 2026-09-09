import cors from "cors";
import express from "express";
import apiRoutes from "./routes"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({ sucess: true, message: "ok" });
});

app.use(apiRoutes);

export default app;