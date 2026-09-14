import slugify from 'slugify'; // แนะนำ Library: npm install slugify
import { nanoid } from 'nanoid'; // สำหรับสุ่ม ID สั้นๆ: npm install nanoid

export function generateCategorySlug(nameEn?: string | null): string {
    if (nameEn && nameEn.trim() !== '') {
        // แปลง nameEn ให้เป็น slug พิมพ์เล็ก ตัดตัวอักขระพิเศษออก
        const baseSlug = slugify(nameEn, {
            lower: true,      // แปลงเป็นตัวพิมพ์เล็ก
            strict: true,     // ตัดอักขระพิเศษที่ไม่ใช่ a-z, 0-9 ออก
            remove: /[*+~.()'"!:@]/g
        });

        // ต่อท้ายด้วย ID สั้นๆ 6 หลัก เพื่อกัน Slug ซ้ำกันในระบบ
        return `${baseSlug}-${nanoid(6)}`;
    }

    // กรณีผู้ใช้ไม่ได้กรอก nameEn มา ให้สุ่ม Slug สำหรับ Category นั้นโดยเฉพาะ
    return `cat-${nanoid(8)}`;
}