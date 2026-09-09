import { prisma } from "../../lib/prisma";
import { Product } from "../../generated/prisma/client";

export const productService = {
    async findAll() {
        return prisma.product.findMany();
    },
};
