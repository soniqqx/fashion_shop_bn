import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import config from "../../config";
import { userService } from "../user";
import { LoginBody } from "../../schemas/auth";
import { AppError } from "../../lib/errors";

export const authService = {
    async login(credentials: LoginBody) {
        const admin = await userService.findAdminByEmail(credentials.email);

        if (!admin || !admin.isActive) {
            throw new AppError(401, "Invalid username or password.");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, admin.password);
        if (!isValidPassword) {
            throw new AppError(401, "Invalid username or password.");
        }

        const expiresIn: SignOptions["expiresIn"] = config.JWT_EXPIRES_IN as SignOptions["expiresIn"];
        const token = jwt.sign({ sub: admin.id, username: admin.username }, config.JWT_SECRET, {
            expiresIn,
        });

        return {
            token,
            admin: {
                id: admin.id,
                username: admin.username,
            },
        };
    },
};
