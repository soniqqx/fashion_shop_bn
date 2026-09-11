import { prisma } from "../../lib/prisma"

export const categoryService = {
    async findSlugById(id: string) {
        return prisma.category.findFirst({
            where: { id },
            select: {
                slug: true
            },
        })
    }
}