import { PrismaPg } from "@prisma/adapter-pg";
import {
    PrismaClient,
    Role,
    TransactionType,
} from "../src/generated/prisma/client";
import bcrypt from "bcrypt";
import config from "../src/config/index";

const adapter = new PrismaPg({
    connectionString: config.db_url!,
});

const prisma = new PrismaClient({
    adapter,
});

const reasonsData = [
    {
        code: 'PURCHASE_RECEIVED',
        name: 'รับสินค้าจาก Supplier',
        transactionType: TransactionType.IN,
    },
    {
        code: 'SALE',
        name: 'ขายสินค้า',
        transactionType: TransactionType.OUT,
    },
    {
        code: 'CUSTOMER_RETURN',
        name: 'ลูกค้าคืนสินค้า',
        transactionType: TransactionType.IN,
    },
    {
        code: 'DAMAGED',
        name: 'สินค้าชำรุด',
        transactionType: TransactionType.OUT,
    },
    {
        code: 'LOST',
        name: 'สินค้าสูญหาย',
        transactionType: TransactionType.OUT,
    },
    {
        code: 'ADJUSTMENT_IN',
        name: 'ปรับยอด Stock',
        transactionType: TransactionType.IN,
    },
    {
        code: 'ADJUSTMENT_OUT',
        name: 'ปรับยอด Stock',
        transactionType: TransactionType.OUT,
    },
    {
        code: 'RESERVE',
        name: 'check out สินค้า',
        transactionType: TransactionType.OUT,
    },
    {
        code: 'EXPIRED_RESERVE',
        name: 'หมดเวลาจ่ายเงิน',
        transactionType: TransactionType.IN,
    },
];

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

    const tshirt = await prisma.category.upsert({
        where: {
            slug: "t-shirt",
        },
        update: {},
        create: {
            nameTh: "เสื้อยืด",
            nameEn: "T-Shirt",
            slug: "t-shirt",
        },
    });

    const shirt = await prisma.category.upsert({
        where: {
            slug: "shirt",
        },
        update: {},
        create: {
            nameTh: "เสื้อเชิ้ต",
            nameEn: "Shirt",
            slug: "shirt",
        },
    });

    const hoodie = await prisma.category.upsert({
        where: {
            slug: "hoodie",
        },
        update: {},
        create: {
            nameTh: "เสื้อฮู้ด",
            nameEn: "Hoodie",
            slug: "hoodie",
        },
    });

    const pants = await prisma.category.upsert({
        where: {
            slug: "pants",
        },
        update: {},
        create: {
            nameTh: "กางเกง",
            nameEn: "Pants",
            slug: "pants",
        },
    });

    const accessories = await prisma.category.upsert({
        where: {
            slug: "accessories",
        },
        update: {},
        create: {
            nameTh: "เครื่องประดับและอุปกรณ์เสริม",
            nameEn: "Accessories",
            slug: "accessories",
        },
    });

    // =========================
    // Products
    // =========================

    const basicTshirt = await prisma.product.create({
        data: {
            name: "Basic Cotton T-Shirt",
            description: "เสื้อยืด Cotton พื้นฐาน ใส่ได้ทุกวัน",
            categoryId: tshirt.id,

            variants: {
                create: [
                    {
                        sku: "TSHIRT-BASIC-BLK-S",
                        price: 390,
                        color: "Black",
                        size: "S",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-BASIC-BLK-M",
                        price: 390,
                        color: "Black",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-BASIC-BLK-L",
                        price: 390,
                        color: "Black",
                        size: "L",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-BASIC-WHT-S",
                        price: 390,
                        color: "White",
                        size: "S",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-BASIC-WHT-M",
                        price: 390,
                        color: "White",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-BASIC-WHT-L",
                        price: 390,
                        color: "White",
                        size: "L",
                        unit: "ตัว",
                    },
                ],
            },
        },

        include: {
            variants: true,
        },
    });

    const oversizeTshirt = await prisma.product.create({
        data: {
            name: "Oversize T-Shirt",
            description: "เสื้อยืดทรง Oversize สำหรับใส่แบบสบาย ๆ",
            categoryId: tshirt.id,

            variants: {
                create: [
                    {
                        sku: "TSHIRT-OVS-NVY-M",
                        price: 490,
                        color: "Navy",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-OVS-NVY-L",
                        price: 490,
                        color: "Navy",
                        size: "L",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-OVS-NVY-XL",
                        price: 490,
                        color: "Navy",
                        size: "XL",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-OVS-GRY-M",
                        price: 490,
                        color: "Gray",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-OVS-GRY-L",
                        price: 490,
                        color: "Gray",
                        size: "L",
                        unit: "ตัว",
                    },
                    {
                        sku: "TSHIRT-OVS-GRY-XL",
                        price: 490,
                        color: "Gray",
                        size: "XL",
                        unit: "ตัว",
                    },
                ],
            },
        },

        include: {
            variants: true,
        },
    });

    const casualShirt = await prisma.product.create({
        data: {
            name: "Casual Oxford Shirt",
            description: "เสื้อเชิ้ต Oxford สำหรับใส่ทำงานหรือใส่ลำลอง",
            categoryId: shirt.id,

            variants: {
                create: [
                    {
                        sku: "SHIRT-OXF-BLU-M",
                        price: 690,
                        color: "Blue",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "SHIRT-OXF-BLU-L",
                        price: 690,
                        color: "Blue",
                        size: "L",
                        unit: "ตัว",
                    },
                    {
                        sku: "SHIRT-OXF-BLU-XL",
                        price: 690,
                        color: "Blue",
                        size: "XL",
                        unit: "ตัว",
                    },
                    {
                        sku: "SHIRT-OXF-WHT-M",
                        price: 690,
                        color: "White",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "SHIRT-OXF-WHT-L",
                        price: 690,
                        color: "White",
                        size: "L",
                        unit: "ตัว",
                    },
                ],
            },
        },

        include: {
            variants: true,
        },
    });

    const hoodieProduct = await prisma.product.create({
        data: {
            name: "Basic Hoodie",
            description: "เสื้อ Hoodie เนื้อผ้านุ่มสำหรับใส่ในวันสบาย ๆ",
            categoryId: hoodie.id,

            variants: {
                create: [
                    {
                        sku: "HOODIE-BSC-BLK-M",
                        price: 890,
                        color: "Black",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "HOODIE-BSC-BLK-L",
                        price: 890,
                        color: "Black",
                        size: "L",
                        unit: "ตัว",
                    },
                    {
                        sku: "HOODIE-BSC-GRY-M",
                        price: 890,
                        color: "Gray",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "HOODIE-BSC-GRY-L",
                        price: 890,
                        color: "Gray",
                        size: "L",
                        unit: "ตัว",
                    },
                ],
            },
        },

        include: {
            variants: true,
        },
    });

    const pantsProduct = await prisma.product.create({
        data: {
            name: "Straight Fit Pants",
            description: "กางเกงทรง Straight Fit สำหรับใส่ในชีวิตประจำวัน",
            categoryId: pants.id,

            variants: {
                create: [
                    {
                        sku: "PANTS-STR-BLK-M",
                        price: 790,
                        color: "Black",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "PANTS-STR-BLK-L",
                        price: 790,
                        color: "Black",
                        size: "L",
                        unit: "ตัว",
                    },
                    {
                        sku: "PANTS-STR-BEI-M",
                        price: 790,
                        color: "Beige",
                        size: "M",
                        unit: "ตัว",
                    },
                    {
                        sku: "PANTS-STR-BEI-L",
                        price: 790,
                        color: "Beige",
                        size: "L",
                        unit: "ตัว",
                    },
                ],
            },
        },

        include: {
            variants: true,
        },
    });

    const capProduct = await prisma.product.create({
        data: {
            name: "Minimal Cotton Cap",
            description: "หมวก Cotton ดีไซน์เรียบง่าย",
            categoryId: accessories.id,

            variants: {
                create: [
                    {
                        sku: "CAP-MIN-BLK-OS",
                        price: 290,
                        color: "Black",
                        size: "One Size",
                        unit: "ใบ",
                    },
                    {
                        sku: "CAP-MIN-BEI-OS",
                        price: 290,
                        color: "Beige",
                        size: "One Size",
                        unit: "ใบ",
                    },
                ],
            },
        },

        include: {
            variants: true,
        },
    });

    const products = [
        basicTshirt,
        oversizeTshirt,
        casualShirt,
        hoodieProduct,
        pantsProduct,
        capProduct,
    ];

    // =========================
    // Inventory
    // =========================

    const inventoryQuantity: Record<string, number> = {
        "TSHIRT-BASIC-BLK-S": 20,
        "TSHIRT-BASIC-BLK-M": 30,
        "TSHIRT-BASIC-BLK-L": 15,
        "TSHIRT-BASIC-WHT-S": 18,
        "TSHIRT-BASIC-WHT-M": 25,
        "TSHIRT-BASIC-WHT-L": 12,

        "TSHIRT-OVS-NVY-M": 15,
        "TSHIRT-OVS-NVY-L": 20,
        "TSHIRT-OVS-NVY-XL": 10,
        "TSHIRT-OVS-GRY-M": 18,
        "TSHIRT-OVS-GRY-L": 22,
        "TSHIRT-OVS-GRY-XL": 8,

        "SHIRT-OXF-BLU-M": 12,
        "SHIRT-OXF-BLU-L": 15,
        "SHIRT-OXF-BLU-XL": 8,
        "SHIRT-OXF-WHT-M": 10,
        "SHIRT-OXF-WHT-L": 14,

        "HOODIE-BSC-BLK-M": 10,
        "HOODIE-BSC-BLK-L": 12,
        "HOODIE-BSC-GRY-M": 8,
        "HOODIE-BSC-GRY-L": 10,

        "PANTS-STR-BLK-M": 15,
        "PANTS-STR-BLK-L": 12,
        "PANTS-STR-BEI-M": 10,
        "PANTS-STR-BEI-L": 8,

        "CAP-MIN-BLK-OS": 20,
        "CAP-MIN-BEI-OS": 15,
    };

    let variantCount = 0;

    for (const product of products) {
        for (const variant of product.variants) {
            await prisma.inventory.upsert({
                where: {
                    variantId: variant.id,
                },
                update: {
                    quantity:
                        inventoryQuantity[variant.sku] ?? 0,
                    updatedAt: new Date(),
                },
                create: {
                    variantId: variant.id,
                    quantity:
                        inventoryQuantity[variant.sku] ?? 0,
                    updatedAt: new Date(),
                },
            });

            variantCount++;
        }
    }

    for (const reason of reasonsData) {
        await prisma.inventoryTransactionReason.upsert({
            where: { code: reason.code },
            update: {
                name: reason.name,
                transactionType: reason.transactionType,
            },
            create: {
                code: reason.code,
                name: reason.name,
                transactionType: reason.transactionType,
            },
        });
    }

    // =========================
    // Summary
    // =========================

    console.log("✅ Seed completed!");
    console.log(`Admin: ${admin.email}`);
    console.log(`User: ${user.email}`);
    console.log(`Categories: 5`);
    console.log(`Products: ${products.length}`);
    console.log(`Variants: ${variantCount}`);
    console.log(`Inventory: ${variantCount}`);
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
