-- Migration para renomear a coluna preferences para options na tabela itineraries
-- e transferir dados existentes
BEGIN;

-- Verificar se a coluna preferences existe
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'itineraries' 
        AND column_name = 'preferences'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'itineraries' 
        AND column_name = 'options'
    ) THEN
        -- Adicionar coluna options
        ALTER TABLE itineraries ADD COLUMN options JSONB;
        
        -- Transferir dados de preferences para options
        UPDATE itineraries SET options = preferences;
        
        -- Remover coluna preferences
        ALTER TABLE itineraries DROP COLUMN preferences;
        
        RAISE NOTICE 'Migração concluída: preferences renomeado para options na tabela itineraries';
    ELSIF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'itineraries' 
        AND column_name = 'preferences'
    ) AND EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'itineraries' 
        AND column_name = 'options'
    ) THEN
        -- Ambas as colunas existem, transferir dados se options estiver vazio
        UPDATE itineraries 
        SET options = preferences 
        WHERE options IS NULL AND preferences IS NOT NULL;
        
        -- Remover coluna preferences
        ALTER TABLE itineraries DROP COLUMN preferences;
        
        RAISE NOTICE 'Migração concluída: dados transferidos de preferences para options e coluna preferences removida';
    ELSIF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'itineraries' 
        AND column_name = 'preferences'
    ) AND EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'itineraries' 
        AND column_name = 'options'
    ) THEN
        RAISE NOTICE 'Migração não necessária: coluna options já existe e preferences não existe';
    ELSE
        RAISE NOTICE 'Erro: situação não prevista. Verificar estrutura da tabela itineraries';
    END IF;
END $$;

COMMIT;