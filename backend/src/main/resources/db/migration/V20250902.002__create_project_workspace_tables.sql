-- Stores the raw data synced from an external source
CREATE TABLE IF NOT EXISTS imported_data (
                                             id BIGSERIAL PRIMARY KEY,
                                             data_source_id BIGINT NOT NULL,
                                             raw_content JSONB NOT NULL,
                                             CONSTRAINT fk_data_source FOREIGN KEY (data_source_id) REFERENCES data_sources(id)
);

-- Stores metadata for a clean, user-defined training set
CREATE TABLE IF NOT EXISTS training_sets (
                                             id BIGSERIAL PRIMARY KEY,
                                             name VARCHAR(255) NOT NULL,
                                             data_source_id BIGINT NOT NULL,
                                             created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                             CONSTRAINT fk_data_source_set FOREIGN KEY (data_source_id) REFERENCES data_sources(id)
);

-- Links a training set to the specific rows of imported data it contains
CREATE TABLE IF NOT EXISTS training_set_items (
                                                  training_set_id BIGINT NOT NULL,
                                                  imported_data_id BIGINT NOT NULL,
                                                  PRIMARY KEY (training_set_id, imported_data_id),
                                                  CONSTRAINT fk_training_set FOREIGN KEY (training_set_id) REFERENCES training_sets(id) ON DELETE CASCADE,
                                                  CONSTRAINT fk_imported_data FOREIGN KEY (imported_data_id) REFERENCES imported_data(id) ON DELETE CASCADE
);

SELECT *
FROM imported_data;

SELECT *
FROM training_sets;

SELECT *
FROM training_set_items;