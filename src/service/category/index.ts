import { Category } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { CreateCategoryBody, UpdateCategoryBody } from "../../schemas/category"
import { generateCategorySlug } from "../../utils/slugGenerator"

export const categoryService = {
    async findAll() {
        return prisma.category.findMany()
    },
    async findById(id: string) {
        return prisma.category.findFirst({
            where: { id },
            include: {
                products: true
            }
        })
    },
    async findSlugById(id: string) {
        return prisma.category.findFirst({
            where: { id },
            select: {
                slug: true
            },
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
    },
    async delete(id: string): Promise<Category> {
        return prisma.category.update({
            where: { id },
            data: { isActive: false }
        })
    }
}