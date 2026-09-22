# E-commerce Backend

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

> Backend API สำหรับฝึกออกแบบระบบ E-commerce โดยเริ่มจาก business flow, data model และความถูกต้องของสต็อกก่อนสร้าง frontend

**สถานะ:** อยู่ระหว่างพัฒนา — มีเฉพาะ Backend API; ยังไม่มีหน้าเว็บ, payment gateway, API documentation แบบ OpenAPI/Swagger หรือระบบ deploy

## เป้าหมายของโปรเจกต์

โปรเจกต์นี้สร้างขึ้นเพื่อเรียนรู้ว่า e-commerce ไม่ได้มีแค่การแสดงสินค้าและรับออเดอร์ แต่ต้องจัดการความสัมพันธ์ของสินค้า, ราคา, ตะกร้า, สต็อก, ที่อยู่จัดส่ง และสถานะคำสั่งซื้อให้สอดคล้องกัน

สิ่งที่กำลังโฟกัสในช่วงนี้คือการวาง flow ฝั่ง Backend ให้ชัดเจนและทดสอบได้ ก่อนนำ API ไปเชื่อมกับหน้าบ้านของลูกค้าและผู้ดูแลระบบ

## Try it

### สิ่งที่ต้องมี

- Node.js 20 ขึ้นไป
- Docker Desktop และ Docker Compose (สำหรับรัน PostgreSQL ในเครื่อง)

### 1. สร้างไฟล์ environment

คัดลอกไฟล์ตัวอย่างเป็น `.env` แล้วเปลี่ยนค่า `JWT_SECRET` เป็นค่าลับของตนเอง:

```powershell
Copy-Item .env.example .env
```

ไฟล์ `.env.example` ใช้ค่า PostgreSQL ที่ตรงกับ `docker-compose.yml` แล้ว จึงไม่จำเป็นต้องแก้ `DATABASE_URL` หากใช้ database ผ่าน Docker ตามขั้นตอนถัดไป

### 2. เริ่ม PostgreSQL ด้วย Docker

```bash
docker compose up -d
```

ตรวจสอบว่า container พร้อมรับการเชื่อมต่อ:

```bash
docker compose ps
```

> ต้องรันคำสั่งนี้ในครั้งแรกและทุกครั้งที่ container ถูกหยุดไว้ แต่ไม่ต้องรันซ้ำเมื่อ container ยังทำงานอยู่ ข้อมูล database จะถูกเก็บไว้ใน Docker volume `ecommerce_data`

### 3. ติดตั้ง, สร้างตาราง และเริ่ม API

```bash
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

ตรวจว่า API เริ่มทำงานแล้ว:

```bash
curl http://localhost:3000/health
```

### Test account

หลังรัน `npm run seed` จะมีข้อมูลตัวอย่างสินค้า, variant, inventory, เหตุผลการปรับสต็อก และบัญชีต่อไปนี้:

| บทบาท | Email | Password | ใช้ทำอะไร |
| --- | --- | --- | --- |
| Admin | `admin@example.com` | `123456` | เข้าสู่ระบบและทดลอง endpoint สำหรับผู้ดูแล |
| User | `user@example.com` | `123456` | ข้อมูลผู้ใช้ตัวอย่างในฐานข้อมูล |


### Interactive guide: ลอง flow ฝั่ง Admin ใน 3 ขั้น

**1. เข้าสู่ระบบ**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"123456\"}"
```

ผลลัพธ์จะมี `token` ให้คัดลอกไว้ แล้วกำหนดเป็นตัวแปร `TOKEN` ใน shell ที่ใช้:

```bash
# PowerShell
$TOKEN = "<token-from-login-response>"
```

**2. ดูสินค้าและสต็อกตัวอย่าง**

```bash
curl http://localhost:3000/api/product/find-all
curl http://localhost:3000/api/inventory/find-all
```

**3. ดูข้อมูลผู้ใช้จาก token**

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

หากใช้ PowerShell ให้แทน `curl` ด้วย `curl.exe` เมื่อเจอพฤติกรรมของ alias `Invoke-WebRequest` ที่ไม่ตรงกับตัวอย่างข้างต้น

## System flow

ให้นึกภาพว่า ระบบนี้มีงานอยู่ 2 ฝั่ง: **Admin เตรียมสินค้าให้ขายได้** และ **Customer เลือกซื้อสินค้า** เมื่อ Customer กด checkout ระบบจะเปลี่ยนข้อมูลหลายส่วนพร้อมกัน เพื่อให้ยอดสต็อกและคำสั่งซื้อไม่ขัดแย้งกัน

### ก่อนลูกค้าซื้อ: Admin เตรียมสินค้า

```text
สร้างหมวดหมู่
    ↓
สร้างสินค้า เช่น “Basic Cotton T-Shirt”
    ↓
สร้างตัวเลือกของสินค้า (Variant) เช่น สี Black / ไซซ์ M / ราคา 390 บาท
    ↓
กำหนดจำนวนในคลังของ Variant นั้น เช่น 30 ตัว
    ↓
สินค้าเริ่มพร้อมให้ลูกค้าสั่งซื้อ
```

> สต็อกผูกกับ **Variant** ไม่ได้ผูกกับ Product โดยตรง เพราะเสื้อสีดำ ไซซ์ M และเสื้อสีขาว ไซซ์ M คือคนละสินค้าคงคลัง

### ตอนลูกค้าซื้อ: จากตะกร้าสู่คำสั่งซื้อ

```text
1. ลูกค้าเลือก Variant ที่ต้องการ
              ↓
2. เพิ่ม Variant นั้นลง Cart พร้อมจำนวนที่ต้องการ
              ↓
3. เพิ่มหรือเลือก Address สำหรับจัดส่ง
              ↓
4. เลือกรายการใน Cart แล้วกด Checkout
              ↓
5. ระบบตรวจว่า Address เป็นของลูกค้าคนนี้ และสินค้าใน Cart ยังมีอยู่
              ↓
6. ระบบคำนวณยอดสินค้า + ค่าส่ง
              ↓
7. ระบบจองสต็อกตามจำนวนที่ซื้อ
              ↓
8. ระบบสร้าง Order และ OrderItem เพื่อเก็บรายการที่ซื้อ
              ↓
9. ระบบบันทึกว่า Order เริ่มต้นที่สถานะ PENDING
              ↓
10. ระบบบันทึก InventoryTransaction ว่าสต็อกลดลงทำการ RESERVE variant
              ↓
11. ลบเฉพาะรายการที่ checkout แล้วออกจาก Cart
              ↓
12. ส่ง Order ที่สร้างสำเร็จกลับให้ client
```

ตัวอย่าง: ลูกค้ามีเสื้อ Black / M อยู่ใน Cart 2 ตัว และคลังมีอยู่ 10 ตัว เมื่อ checkout สำเร็จ ระบบจะสร้าง order จำนวน 2 ตัว, ลดสต็อกเหลือ 8 ตัว, บันทึกประวัติการลดจาก `10 → 8` และลบรายการนี้ออกจาก Cart

### สถานะของ Order ตอนนี้

เมื่อ checkout สำเร็จ Order จะเริ่มที่ `PENDING` ซึ่งหมายถึง “สร้างคำสั่งซื้อแล้ว และรอการชำระเงิน” โครงสร้างฐานข้อมูลรองรับสถานะ `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `DELIVERY_FAILED` และ `RETURN` แล้ว แต่ endpoint สำหรับเปลี่ยนสถานะและ payment flow ยังเป็นงานถัดไป

## Architecture / App shell

แม้ยังไม่มี UI แต่ API ถูกจัดเป็นชั้นเพื่อให้ frontend ในอนาคตเชื่อมกับ use case ได้ตรงไปตรงมา:

```text
Future Customer / Admin UI
             │ HTTP + JWT
             ▼
Express Routes → Middleware (auth / role / validation)
             ▼
        Controllers
             ▼
         Services
             ▼
Prisma + PostgreSQL
```

| ชั้น | หน้าที่ |
| --- | --- |
| Routes | กำหนด URL และสิทธิ์ของ endpoint |
| Middleware | ยืนยัน JWT, ตรวจ role และ validate request ด้วย Zod |
| Controllers | แปลง HTTP request/response และส่งต่อ error |
| Services | เก็บ business rules ของสินค้า, cart, checkout และ stock |
| Prisma / PostgreSQL | จัดการ schema, migration และข้อมูลแบบ relational |

## Tech stack

| เทคโนโลยี | หน้าที่ในโปรเจกต์ |
| --- | --- |
| TypeScript | เพิ่ม type safety ให้ API และ business logic |
| Express 5 | HTTP server และ routing |
| PostgreSQL | เก็บข้อมูลหลักของระบบแบบ relational |
| Prisma | schema, migration, query และ database transaction |
| Zod | ตรวจความถูกต้องของ request body ก่อนเข้าถึง service |
| JWT + bcrypt | ยืนยันตัวตนแบบ token และ hash password |
| Vitest + Supertest | integration test ของ API และ service flow |
| Redis | มี service สำหรับ reservation TTL อยู่ระหว่างศึกษาเชื่อมเข้ากับ checkout flow |

## API modules ที่มีในปัจจุบัน

| Module | ความสามารถหลัก | การเข้าถึง |
| --- | --- | --- |
| Auth | Login, ดู profile ของ token | Login เป็น public; profile ต้องมี token |
| Category / Product / Variant | อ่านสินค้า; จัดการ catalogue และ variant | อ่านเป็น public; เขียนเป็น Admin |
| Address | จัดการที่อยู่จัดส่งของผู้ใช้ | User / Admin ตาม route |
| Cart item | เพิ่ม, แก้, ลบ และดูรายการในตะกร้า | User |
| Checkout | สร้าง order จาก cart item ที่เลือก | User |
| Inventory | ดูสต็อกและรายละเอียด | รายการรวมเป็น public; รายละเอียดเป็น Admin |
| Inventory transaction / reason | ปรับสต็อกและบันทึกเหตุผล | Admin |

ดู endpoint จริงได้จากโฟลเดอร์ [`src/routes`](./src/routes) ซึ่งเป็น source of truth ของ API ในระหว่างที่ยังไม่มี OpenAPI specification

## จุดที่น่าสนใจในโค้ด

### 1. Checkout ทำงานแบบ all-or-nothing

การ checkout รวมการอ่าน cart, ตรวจที่อยู่, คำนวณราคา, จองสต็อก, สร้าง order/order items, เขียน status log และลบ cart item ไว้ใน Prisma transaction เดียว หากขั้นตอนไหนล้มเหลว การเปลี่ยนแปลงก่อนหน้าจะ rollback ทั้งหมด

โค้ดอยู่ที่ [`src/service/checkout/index.ts`](./src/service/checkout/index.ts)

### 2. ป้องกันสต็อกติดลบเมื่อมีคำขอพร้อมกัน

การตัดสต็อกใช้ conditional update (`quantity >= requested quantity`) แทนการอ่านค่าแล้วเขียนทับโดยตรง จึงปฏิเสธคำขอที่มาไม่ทันเมื่อสต็อกไม่พอ และไม่ปล่อยให้จำนวนติดลบ

โค้ดอยู่ที่ [`src/service/inventory/index.ts`](./src/service/inventory/index.ts) และมี integration test สำหรับ concurrent OUT requests ใน [`tests/inventoryTransaction.test.ts`](./tests/inventoryTransaction.test.ts)

### 3. เก็บ snapshot ที่จำเป็นใน Order

`Order` เก็บชื่อ, โทรศัพท์ และที่อยู่จัดส่งไว้ ณ เวลาสั่งซื้อ พร้อมเก็บ `productName` และ `unitPrice` ไว้ใน `OrderItem` เพื่อให้ประวัติคำสั่งซื้อไม่เปลี่ยนตามการแก้ข้อมูลสินค้า/ที่อยู่ภายหลัง

schema อยู่ที่ [`prisma/schema.prisma`](./prisma/schema.prisma)

### 4. บันทึกเหตุผลและยอดก่อน–หลังทุกครั้งที่สต็อกเปลี่ยน

`InventoryTransaction` เก็บ type, reason, quantity, `beforeQuantity` และ `afterQuantity` ทำให้ตรวจสอบที่มาของจำนวนสต็อกได้ ไม่ใช่แก้ตัวเลขคงเหลืออย่างเดียว

### 5. ตะกร้าไม่สร้างแถวซ้ำสำหรับ variant เดิม

ฐานข้อมูลกำหนด unique constraint ที่ `(cartId, variantId)` และ logic การเพิ่มสินค้าจะเพิ่ม quantity ให้รายการเดิม ผลลัพธ์จึงยังถูกต้องเมื่อมีการกดเพิ่มสินค้าพร้อมกัน

## Tests

```bash
npm run test:migrate
npm test
```

ชุดทดสอบปัจจุบันครอบคลุม cart item, inventory transaction และ checkout รวมถึงกรณีสต็อกไม่พอ, rollback และ concurrent requests โดยใช้ฐานข้อมูล test ที่กำหนดผ่าน `.env.test`

## Roadmap

- [x] Authentication และ role พื้นฐาน
- [x] Category, product และ product variant
- [x] Address และ cart item
- [x] Checkout ที่สร้าง order และบันทึกประวัติสต็อกแบบ transaction
- [x] Integration tests สำหรับ flow สำคัญ
- [ ] เปิด customer authentication ให้ user login ได้
- [ ] เชื่อม Redis reservation TTL เข้ากับ checkout และคืนสต็อกเมื่อหมดเวลาชำระเงิน
- [ ] Payment flow / webhook simulation
- [ ] Endpoint สำหรับจัดการ order status และการจัดส่ง
- [ ] OpenAPI / Swagger documentation
- [ ] Customer storefront และ Admin dashboard
- [ ] Deploy และ CI/CD

## ข้อจำกัด

นี่เป็นโปรเจกต์เพื่อการเรียนรู้และยังไม่พร้อมใช้งานจริง: secret ต้องกำหนดเองใน environment, payment ยังไม่เชื่อมต่อ, reservation TTL ยังไม่ได้เรียกใช้จาก checkout และยังไม่มี frontend หรือ production deployment
