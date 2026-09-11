import { Product } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ProductInput, UpdateProductBody } from "../../schemas/product";

export const productService = {
    async findAll() {
        return prisma.product.findMany();
    },
    async create(product: ProductInput): Promise<Product> {
        return prisma.product.create({ data: product });
    },
    async update(id: string, product: UpdateProductBody): Promise<Product> {
        return prisma.product.update({
            where: { id },
            data: product
        })
    },
    async delete(id: string): Promise<Product> {
        return prisma.product.update({
            where: { id },
            data: { isActive: false }
        })
    }
};
