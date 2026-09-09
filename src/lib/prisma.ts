// เปลี่ยนมานำเข้า PrismaPg แทน MariaDB
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";
import config from "../config";

// 1. สร้าง Pool สำหรับจัดการ Connection ในรูปแบบของ PostgreSQL
const pool = new Pool({
  connectionString: config.db_url
});

// 2. นำ Pool ใส่เข้าไปใน Prisma Driver Adapter
const adapter = new PrismaPg(pool);

// 3. เริ่มต้นใช้งาน Prisma Client พร้อมแนบ Adapter เข้าไป
export const prisma = new PrismaClient({ adapter });

