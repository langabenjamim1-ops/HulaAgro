-- HULA Agro - Clean Database Script
-- This script removes all demo/seed data while keeping the schema intact
-- Execute this in Supabase SQL Editor to reset the database

BEGIN;

-- Disable foreign key constraints temporarily
ALTER TABLE production_records DISABLE TRIGGER ALL;
ALTER TABLE feed_consumption DISABLE TRIGGER ALL;
ALTER TABLE mortality_records DISABLE TRIGGER ALL;
ALTER TABLE health_records DISABLE TRIGGER ALL;
ALTER TABLE environmental_data DISABLE TRIGGER ALL;
ALTER TABLE financial_records DISABLE TRIGGER ALL;
ALTER TABLE inventory_items DISABLE TRIGGER ALL;
ALTER TABLE batch_genetics DISABLE TRIGGER ALL;

-- Delete all data from tables (in reverse order of dependencies)
DELETE FROM production_records;
DELETE FROM feed_consumption;
DELETE FROM mortality_records;
DELETE FROM health_records;
DELETE FROM environmental_data;
DELETE FROM financial_records;
DELETE FROM inventory_items;
DELETE FROM batch_genetics;
DELETE FROM batches;
DELETE FROM employees;
DELETE FROM facilities;

-- Reset sequences/auto-increment
ALTER SEQUENCE batches_id_seq RESTART WITH 1;
ALTER SEQUENCE production_records_id_seq RESTART WITH 1;
ALTER SEQUENCE feed_consumption_id_seq RESTART WITH 1;
ALTER SEQUENCE mortality_records_id_seq RESTART WITH 1;
ALTER SEQUENCE health_records_id_seq RESTART WITH 1;
ALTER SEQUENCE environmental_data_id_seq RESTART WITH 1;
ALTER SEQUENCE financial_records_id_seq RESTART WITH 1;
ALTER SEQUENCE employees_id_seq RESTART WITH 1;
ALTER SEQUENCE facilities_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_items_id_seq RESTART WITH 1;
ALTER SEQUENCE batch_genetics_id_seq RESTART WITH 1;

-- Re-enable foreign key constraints
ALTER TABLE production_records ENABLE TRIGGER ALL;
ALTER TABLE feed_consumption ENABLE TRIGGER ALL;
ALTER TABLE mortality_records ENABLE TRIGGER ALL;
ALTER TABLE health_records ENABLE TRIGGER ALL;
ALTER TABLE environmental_data ENABLE TRIGGER ALL;
ALTER TABLE financial_records ENABLE TRIGGER ALL;
ALTER TABLE inventory_items ENABLE TRIGGER ALL;
ALTER TABLE batch_genetics ENABLE TRIGGER ALL;

COMMIT;

-- Verify cleanup
SELECT 'Limpeza Concluída' as Status;
SELECT 'Lotes' as Tabela, COUNT(*) as Registros FROM batches
UNION ALL
SELECT 'Produção', COUNT(*) FROM production_records
UNION ALL
SELECT 'Funcionários', COUNT(*) FROM employees
UNION ALL
SELECT 'Registros de Saúde', COUNT(*) FROM health_records
UNION ALL
SELECT 'Registros Financeiros', COUNT(*) FROM financial_records;
