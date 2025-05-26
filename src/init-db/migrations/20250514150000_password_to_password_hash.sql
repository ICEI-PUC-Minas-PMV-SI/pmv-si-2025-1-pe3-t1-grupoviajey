-- Migração: Renomear coluna 'password' para 'password_hash' na tabela users
-- Data: 14 de Maio de 2025

-- Verificar se a coluna 'password' existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'password'
    ) THEN
        -- Renomear a coluna password para password_hash
        ALTER TABLE users RENAME COLUMN password TO password_hash;
        RAISE NOTICE 'Coluna password renomeada para password_hash na tabela users';
    ELSE
        RAISE NOTICE 'Coluna password não existe na tabela users ou já foi renomeada';
    END IF;
END $$;