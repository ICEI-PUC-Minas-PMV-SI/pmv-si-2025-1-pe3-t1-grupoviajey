-- Renomeia a coluna 'password' para 'password_hash' na tabela 'users'
ALTER TABLE users RENAME COLUMN password TO password_hash;