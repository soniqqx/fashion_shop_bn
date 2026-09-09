import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/client";
import bcrypt from "bcrypt";
import config from "../src/config/index"
// import { prisma } from "../src/lib/prisma"


const adapter = new PrismaPg({
    connectionString: config.db_url!,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🌱 Seeding database...");

    // =========================
    // Users
    // =========================

    const password = await bcrypt.hash("123456", 10);

    const admin = await prisma.user.upsert({
        where: {
            email: "admin@example.com",
        },
        update: {},
        create: {
            email: "admin@example.com",
            username: "admin",
            password,
            role: Role.ADMIN,
        },
    });

    const user = await prisma.user.upsert({
        where: {
            email: "user@example.com",
        },
        update: {},
        create: {
            email: "user@example.com",
            username: "testuser",
            password,
            role: Role.USER,
        },
    });

    // =========================
    // Categories
    // =========================

    const electronics = await prisma.category.upsert({
        where: {
            slug: "electronics",
        },
        update: {},
        create: {
            name: "Electronics",
            slug: "electronics",
        },
    });

    const clothing = await prisma.category.upsert({
        where: {
            slug: "clothing",
        },
        update: {},
        create: {
            name: "Clothing",
            slug: "clothing",
        },
    });

    const accessories = await prisma.category.upsert({
        where: {
            slug: "accessories",
        },
        update: {},
        create: {
            name: "Accessories",
            slug: "accessories",
        },
    });

    // =========================
    // Products
    // =========================

    const products = await Promise.all([
        prisma.product.upsert({
            where: {
                sku: "ELEC-001",
            },
            update: {},
            create: {
                name: "Wireless Headphones",
                sku: "ELEC-001",
                description: "หูฟังไร้สายสำหรับใช้งานทั่วไป",
                price: 1290,
                unit: "ชิ้น",
                categoryId: electronics.id,
            },
        }),

        prisma.product.upsert({
            where: {
                sku: "ELEC-002",
            },
            update: {},
            create: {
                name: "Mechanical Keyboard",
                sku: "ELEC-002",
                description: "คีย์บอร์ด Mechanical สำหรับทำงานและเล่นเกม",
                price: 2490,
                unit: "ชิ้น",
                categoryId: electronics.id,
            },
        }),

        prisma.product.upsert({
            where: {
                sku: "ELEC-003",
            },
            update: {},
            create: {
                name: "Wireless Mouse",
                sku: "ELEC-003",
                description: "เมาส์ไร้สายสำหรับใช้งานทั่วไป",
                price: 890,
                unit: "ชิ้น",
                categoryId: electronics.id,
            },
        }),

        prisma.product.upsert({
            where: {
                sku: "CLOTH-001",
            },
            update: {},
            create: {
                name: "Basic T-Shirt",
                sku: "CLOTH-001",
                description: "เสื้อยืด Basic Cotton",
                price: 390,
                unit: "ตัว",
                categoryId: clothing.id,
            },
        }),

        prisma.product.upsert({
            where: {
                sku: "CLOTH-002",
            },
            update: {},
            create: {
                name: "Hoodie",
                sku: "CLOTH-002",
                description: "เสื้อ Hoodie สำหรับใส่ในวันสบาย ๆ",
                price: 890,
                unit: "ตัว",
                categoryId: clothing.id,
            },
        }),

        prisma.product.upsert({
            where: {
                sku: "ACC-001",
            },
            update: {},
            create: {
                name: "Canvas Backpack",
                sku: "ACC-001",
                description: "กระเป๋า Canvas สำหรับใช้งานประจำวัน",
                price: 790,
                unit: "ใบ",
                categoryId: accessories.id,
            },
        }),
    ]);

    // =========================
    // Inventory
    // =========================

    const inventoryData = [
        { product: products[0], quantity: 20 },
        { product: products[1], quantity: 10 },
        { product: products[2], quantity: 30 },
        { product: products[3], quantity: 50 },
        { product: products[4], quantity: 15 },
        { product: products[5], quantity: 25 },
    ];

    for (const item of inventoryData) {
        await prisma.inventory.upsert({
            where: {
                productId: item.product.id,
            },
            update: {
                quantity: item.quantity,
            },
            create: {
                productId: item.product.id,
                quantity: item.quantity,
                updatedAt: new Date(),
            },
        });
    }

    console.log("✅ Seed completed!");
    console.log(`Admin: ${admin.email}`);
    console.log(`User: ${user.email}`);
    console.log(`Products: ${products.length}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });