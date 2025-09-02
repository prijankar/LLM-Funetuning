-- V2: Creates the table for storing data source configurations

CREATE TABLE IF NOT EXISTS data_sources (
                                            id BIGSERIAL PRIMARY KEY,
                                            name VARCHAR(255) NOT NULL,
                                            type VARCHAR(50) NOT NULL,
                                            connection_details JSONB NOT NULL,
                                            status VARCHAR(50) DEFAULT 'NOT_CONNECTED',
                                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources (type);

SELECT *
FROM data_sources;