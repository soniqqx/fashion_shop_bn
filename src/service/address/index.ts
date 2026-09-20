import { Address, Prisma } from "../../generated/prisma/client"
import { AppError } from "../../lib/errors"
import { prisma } from "../../lib/prisma"
import { CreateAddressBody, UpdateAddressBody } from "../../schemas/address"

export const addressService = {
    async findAll() {
        return prisma.address.findMany()
    },
    async findById(id: string) {
        return prisma.address.findFirst({
            where: { id }
        })
    },
    async create(id: string, data: CreateAddressBody) {
        return prisma.address.create(
            {
                data: {
                    ...data,
                    userId: id
                }
            }
        )
    },
    async update(id: string, data: UpdateAddressBody) {
        return prisma.address.update({
            where: { id },
            data: data
        })
    },
    async delete(id: string): Promise<Address> {
        return prisma.address.update({
            where: { id },
            data: { isActive: false }
        })
    },
    async getCheckoutAddress(
        tx: Prisma.TransactionClient,
        userId: string,
        addressId: string,
    ) {

        const address = await tx.address.findFirst({
            where: {
                id: addressId,
                userId,
                isActive: true,
            },
        });

        if (!address) {
            throw new AppError(
                404,
                "Address not found"
            );
        }

        return address;
    }
}