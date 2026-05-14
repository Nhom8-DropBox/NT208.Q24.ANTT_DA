CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    refresh_token VARCHAR(255),
    storage_limit BIGINT DEFAULT 16106127360
);

CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    storage_bytes BIGINT NOT NULL,
    used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO promo_codes (code, storage_bytes) VALUES
    ('SAKURA30', 32212254720),
    ('NHOM8VIP', 32212254720),
    ('UPGRADE2025', 32212254720);

CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- user_id is email--
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE file_versions (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    version_no INTEGER NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    size_bytes BIGINT DEFAULT 0,
    etag VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(file_id, version_no)
);


CREATE TABLE upload_sessions (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id INTEGER REFERENCES files(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    s3_upload_id VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    chunk_size INTEGER DEFAULT 5242880,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE upload_parts (
    id SERIAL PRIMARY KEY,
    upload_session_id INTEGER NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
    part_number INTEGER NOT NULL,
    etag VARCHAR(100) NOT NULL,
    size_bytes BIGINT DEFAULT 0,
    UNIQUE(upload_session_id, part_number)
);

CREATE TABLE share_links (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    version_id INTEGER REFERENCES file_versions(id) ON DELETE SET NULL,
    token_uuid VARCHAR(36) NOT NULL UNIQUE,
    permission VARCHAR(20) DEFAULT 'view',
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
