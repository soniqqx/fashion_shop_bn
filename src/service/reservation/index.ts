import { redis } from "../lib/redis";

const RESERVATION_TTL = 15 * 60;

const getReservationKey = (orderId: string) => {
    return `order:reservation:${orderId}`;
};

class ReservationService {
    async create(orderId: string) {
        const key = getReservationKey(orderId);

        await redis.set(
            key,
            "PENDING_PAYMENT",
            {
                EX: RESERVATION_TTL,
            }
        );
    }

    async exists(orderId: string) {
        const key = getReservationKey(orderId);

        const result = await redis.exists(key);

        return result === 1;
    }

    async getTTL(orderId: string) {
        const key = getReservationKey(orderId);

        return redis.ttl(key);
    }

    async cancel(orderId: string) {
        const key = getReservationKey(orderId);

        await redis.del(key);
    }
}

export const reservationService =
    new ReservationService();