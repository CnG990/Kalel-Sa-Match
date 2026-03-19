from django.db import migrations


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS messages_litiges (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    contenu TEXT NOT NULL,
    est_interne BOOLEAN NOT NULL DEFAULT FALSE,
    pieces_jointes JSONB NOT NULL DEFAULT '[]'::jsonb,
    litige_id BIGINT NOT NULL,
    auteur_id BIGINT NOT NULL,
    CONSTRAINT messages_litiges_litige_id_fk
        FOREIGN KEY (litige_id) REFERENCES litiges(id)
        ON DELETE CASCADE,
    CONSTRAINT messages_litiges_auteur_id_fk
        FOREIGN KEY (auteur_id) REFERENCES accounts_user(id)
        ON DELETE CASCADE
);
"""

CREATE_INDEX_SQL = """
CREATE INDEX IF NOT EXISTS messages_li_litige__68476a_idx
ON messages_litiges (litige_id, created_at);
"""


class Migration(migrations.Migration):

    dependencies = [
        ("litiges", "0004_rename_litiges_statut_created_idx_litiges_statut_aeeb62_idx_and_more"),
    ]

    operations = [
        migrations.RunSQL(
            CREATE_TABLE_SQL,
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            CREATE_INDEX_SQL,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
