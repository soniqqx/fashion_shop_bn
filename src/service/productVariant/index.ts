import { Product } from "../../generated/prisma/client";
import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { CreateProductVariantsBody } from "../../schemas/productVariant";
import { generateSKU } from "../../utils/skuGenerator";

export const productVariantService = {
    async findAll() {
        return prisma.productVariant.findMany();
    },
    async findByProductId(productId: string) {
        return prisma.productVariant.findMany({
            where: { productId }
        });
    },
    async createMany(
        productId: string,
        data: CreateProductVariantsBody
    ) {
        return prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: {
                    id: productId,
                },
            });

            if (!product) {
                throw new AppError(404, "Product not found");
            }

            const createdVariants = [];

            for (const variant of data.variants) {

                const createdVariant =
                    await tx.productVariant.create({
                        data: {
                            productId,
                            sku: generateSKU(),
                            price: variant.price,
                            imageUrl: variant.imageUrl,
                            color: variant.color,
                            size: variant.size,
                            unit: variant.unit,

                            inventory: {
                                create: {
                                    quantity: 0,
                                    updatedAt: new Date(),
                                },
                            },
                        },

                        include: {
                            inventory: true,
                        },
                    });

                createdVariants.push(createdVariant);
            }

            return createdVariants;
        });
    },
    async delete(id: string): Promise<Product> {
        return prisma.product.update({
            where: { id },
            data: { isActive: false }
        })
    }
};
