import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../lib/errors";
import { paymentService } from "../../../service/payment";
import { updatePaymentBody } from "../../../schemas/payment";

const paymentController = {
    async pay(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const parseResult = updatePaymentBody.safeParse(req.body);

            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            const paymentId = req.params.paymentId;

            if (!paymentId || typeof paymentId !== "string") {
                throw new AppError(400, "Payment Id must be a string.");
            }

            const result = await paymentService.update(parseResult.data.orderId, paymentId);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
}

export default paymentController;