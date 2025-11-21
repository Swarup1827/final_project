-- Database setup script for Inventory Management System
-- Run this script to create the database

CREATE DATABASE inventory_db;

-- Note: Tables will be created automatically by JPA/Hibernate
-- when you run the Spring Boot application with ddl-auto=update

-- The following tables will be created:
-- - shop (id, name, address, phone, owner_id)
-- - product (id, shop_id, name, description, price, stock, category)

