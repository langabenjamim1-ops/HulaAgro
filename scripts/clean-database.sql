-- Script de limpeza completa do banco de dados
-- Execute este script para remover TODOS os dados e deixar as tabelas vazias

-- Desabilitar constraints temporariamente
ALTER TABLE IF EXISTS daily_records DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS health_records DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS batches DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS costs DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS diseases DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS contracts DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS payroll DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS sensors DISABLE TRIGGER ALL;

-- Deletar todos os dados
DELETE FROM daily_records;
DELETE FROM health_records;
DELETE FROM batches;
DELETE FROM costs;
DELETE FROM diseases;
DELETE FROM contracts;
DELETE FROM payroll;
DELETE FROM sensors;

-- Reabilitar constraints
ALTER TABLE IF EXISTS daily_records ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS health_records ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS batches ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS costs ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS diseases ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS contracts ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS payroll ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS sensors ENABLE TRIGGER ALL;

-- Resetar sequences (se houver)
SELECT setval(pg_get_serial_sequence('batches', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('daily_records', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('health_records', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('costs', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('diseases', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('contracts', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('payroll', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('sensors', 'id'), 1, false);
