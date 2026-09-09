import app from "../app";
import { logger } from "../config/logger";
import config from "../config";
import { prisma } from "../lib/prisma";

const normalizePort = (val: string) => {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

const port = normalizePort(config.port || '000');
app.set('port', port);


const startServer = async (): Promise<void> => {
    try {
        await prisma.$connect();
        logger.info("Connected to database via Prisma.");
    } catch (error) {
        logger.warn("Database is not ready yet. Server will still start.", error);
    }

    const server = app.listen(port, () => {
        logger.info(`Server running on http://localhost:${port}`);
    });

    const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
        logger.info(`Received ${signal}, shutting down.`);
        server.close(async () => {
            await prisma.$disconnect();
            process.exit(0);
        });
    };

    process.on("SIGINT", () => {
        void shutdown("SIGINT");
    });
    process.on("SIGTERM", () => {
        void shutdown("SIGTERM");
    });
};

void startServer();
