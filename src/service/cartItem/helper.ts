
import { PrismaClient } from "@prisma/client/extension";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

/**
 * ดึง cartId ของ User ปัจจุบัน หากยังไม่มีจะทำการสร้าง Active Cart ใบใหม่ให้ทันที
 * @param userId - ID ของผู้ใช้งาน
 * @param tx - Prisma Transaction Client (Optional) สำหรับใช้ร่วมกับ $transaction
 */
export async function getOrCreateActiveCartId(
    userId: string,
    tx?: Prisma.TransactionClient | PrismaClient
): Promise<string> {
    const client = tx || prisma;

    // 1. ค้นหา Cart เดิมของ User (สามารถเพิ่ม status: "ACTIVE" ได้หากระบบรองรับหลายสถานะ)
    let cart = await client.cart.findFirst({
        where: { userId },
        select: { id: true }
    });

    // 2. ถ้ายังไม่มี Cart ให้สร้างขึ้นใหม่ทันที
    if (!cart) {
        cart = await client.cart.create({
            data: { userId },
            select: { id: true }
        });
    }

    return cart.id;
}