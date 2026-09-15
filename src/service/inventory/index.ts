import { prisma } from "../../lib/prisma"
import { CreateCategoryBody, UpdateCategoryBody } from "../../schemas/category"
import { generateCategorySlug } from "../../utils/slugGenerator"

export const inventoryService = {
    async findAll() {
        return prisma.inventory.findMany()
    },
    async findById(id: string) {
        return prisma.inventory.findFirst({
            where: { id },
            include: {
                variant: {
                    include: {
                        product: true
                    }
                },
                inventoryTransaction: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                }
            }
        })
    },
    async create(data: CreateCategoryBody) {
        return prisma.category.create(
            {
                data: {
                    nameTh: data.nameTh,
                    nameEn: data.nameEn,
                    slug: generateCategorySlug(data.nameEn)
                }
            }
        )
    },
    async update(id: string, data: UpdateCategoryBody) {
        return prisma.category.update({
            where: { id },
            data: data
        })
    }
}