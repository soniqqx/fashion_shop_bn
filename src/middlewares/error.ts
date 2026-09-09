import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors";
import { logger } from "../config/logger";



type ErrorPayload = {
    success: false;
    message: string;
    details?: unknown;
};

export const errorMiddleware = (
    error: unknown,
    _req: Request,
    res: Response<ErrorPayload>,
    _next: NextFunction,
): Response<ErrorPayload> => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            details: error.details,
        });
    }

    logger.error("Unhandled server error", error);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};
