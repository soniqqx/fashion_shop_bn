import { prisma } from "../../lib/prisma";
import { User } from "../../generated/prisma/client";

export const userService = {
    findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true
            },
        });
    },
    findAdminByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    },
};
