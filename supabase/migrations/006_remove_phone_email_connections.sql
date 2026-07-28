-- Remove legacy phone and email contact channels (chat-only product inquiry).
DELETE FROM connections WHERE type IN ('Phone', 'Email');
