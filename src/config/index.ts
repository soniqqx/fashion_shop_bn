import * as dotenv from "dotenv";

dotenv.config();


const config = {
    node_env: process.env.NODE_ENV || "development",
    port: process.env.PORT,
    db_url: process.env.DATABASE_URL /* "postgresql://postgres:rootpassword123@localhost:5433/ecommerce_db_test" */,
    db_username: process.env.DB_USERNAME,
    db_password: process.env.DB_PASSWORD,
    db_name: process.env.DB_NAME,
    db_host: process.env.DB_HOST,
    db_port: process.env.DB_PORT,
    db_is_ssl: process.env.DB_IS_SSL,
    db_pool_max: process.env.DB_POOL_MAX ?? 5,
    db_pool_min: process.env.DB_POOL_MIN ?? 0,
    db_pool_acquire: process.env.DB_POOL_ACQUIRE ?? 30000,
    db_pool_idle: process.env.DB_POOL_IDLE ?? 10000,
    custom_header_key: process.env.CUSTOM_HEADER_KEY,
    JWT_SECRET: process.env.JWT_SECRET ?? "change-this-in-production",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1d",
};


export default config;