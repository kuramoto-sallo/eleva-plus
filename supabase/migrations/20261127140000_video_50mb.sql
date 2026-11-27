-- Vídeo limitado a 50 MB (limite de upload do plano gratuito do Supabase; decisão de 27/11/2026).
update storage.buckets set file_size_limit = 52428800 where id = 'candidate-files';
