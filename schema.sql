CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Araştırma', source_url TEXT DEFAULT '', body TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE VIRTUAL TABLE IF NOT EXISTS document_search USING fts5(title, body, content='documents', content_rowid='id', tokenize='unicode61');
CREATE TRIGGER IF NOT EXISTS doc_insert AFTER INSERT ON documents BEGIN INSERT INTO document_search(rowid,title,body) VALUES(new.id,new.title,new.body); END;
CREATE TRIGGER IF NOT EXISTS doc_delete AFTER DELETE ON documents BEGIN INSERT INTO document_search(document_search,rowid,title,body) VALUES('delete',old.id,old.title,old.body); END;
CREATE TRIGGER IF NOT EXISTS doc_update AFTER UPDATE ON documents BEGIN INSERT INTO document_search(document_search,rowid,title,body) VALUES('delete',old.id,old.title,old.body); INSERT INTO document_search(rowid,title,body) VALUES(new.id,new.title,new.body); END;
CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, value TEXT NOT NULL);
