import { Product } from "../../generated/prisma/client";
import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { CreateProductBody, UpdateProductBody } from "../../schemas/product";
import { generateSKU } from "../../utils/skuGenerator";

export const productService = {
    async findAll() {
        return prisma.product.findMany();
    },
    async findById(id: string) {
        return prisma.product.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                variants: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        sku: true,
                        price: true,
                        imageUrl: true,
                        color: true,
                        size: true,
                        unit: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                }
            }
        });
    },
    async create(data: CreateProductBody) {
        const variants = data.variants.map((variant) => ({
            ...variant,
            sku: generateSKU(),
        }));

        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,

                variants: {
                    create: variants.map((variant) => ({
                        sku: variant.sku,
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
                    })),
                },
            },

            include: {
                category: true,
                variants: {
                    include: {
                        inventory: true,
                    },
                },
            },
        });

        return product;
    },
    async update(
        productId: string,
        data: UpdateProductBody
    ) {
        return prisma.$transaction(async (tx) => {

            // 1. ตรวจสอบ Product
            const product = await tx.product.findUnique({
                where: {
                    id: productId,
                },
            });

            if (!product) {
                throw new AppError(404, "Product not found");
            }


            // 2. Update Product
            if (
                data.name !== undefined ||
                data.description !== undefined ||
                data.categoryId !== undefined
            ) {
                await tx.product.update({
                    where: {
                        id: productId,
                    },
                    data: {
                        ...(data.name !== undefined && {
                            name: data.name,
                        }),

                        ...(data.description !== undefined && {
                            description: data.description,
                        }),

                        ...(data.categoryId !== undefined && {
                            categoryId: data.categoryId,
                        }),
                    },
                });
            }


            // 3. จัดการ Variants
            if (data.variants) {

                for (const variant of data.variants) {

                    // ==================================
                    // กรณี Variant เดิม → UPDATE
                    // ==================================

                    if (variant.id) {

                        const existingVariant =
                            await tx.productVariant.findFirst({
                                where: {
                                    id: variant.id,
                                    productId,
                                },
                            });

                        if (!existingVariant) {
                            throw new AppError(404, `Product variant ${variant.id} not found`);
                        }

                        await tx.productVariant.update({
                            where: {
                                id: variant.id,
                            },
                            data: {
                                price: variant.price,
                                imageUrl: variant.imageUrl,
                                color: variant.color,
                                size: variant.size,
                                unit: variant.unit,
                                isActive: variant.isActive,
                            },
                        });

                    }

                    // ==================================
                    // กรณีไม่มี id → CREATE
                    // ==================================

                    else {

                        await tx.productVariant.create({
                            data: {
                                productId,

                                sku: generateSKU(),

                                price: variant.price,
                                imageUrl: variant.imageUrl,
                                color: variant.color,
                                size: variant.size,
                                unit: variant.unit,
                                isActive: variant.isActive,

                                inventory: {
                                    create: {
                                        quantity: 0,
                                        updatedAt: new Date(),
                                    },
                                },
                            },
                        });
                    }
                }
            }


            // 4. Return ข้อมูลล่าสุด
            return tx.product.findUnique({
                where: {
                    id: productId,
                },
                include: {
                    category: true,

                    variants: {
                        include: {
                            inventory: true,
                        },

                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
            });
        });
    },
    async delete(id: string): Promise<Product> {
        return prisma.product.update({
            where: { id },
            data: { isActive: false }
        })
    }
};
