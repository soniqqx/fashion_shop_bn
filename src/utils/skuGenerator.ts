import crypto from 'crypto';

export function generateSKU(): string {
    const randomHash = crypto.randomBytes(3).toString('hex').toUpperCase();

    return `GAD-${randomHash}`;
}