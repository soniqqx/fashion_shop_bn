import dotenv from "dotenv";

dotenv.config({
    path: ".env.test",
    override: true,
});

if (!process.env.DATABASE_URL?.includes("ecommerce_db_test")) {
    throw new Error(
        "Tests must run against ecommerce_db_test"
    );
}