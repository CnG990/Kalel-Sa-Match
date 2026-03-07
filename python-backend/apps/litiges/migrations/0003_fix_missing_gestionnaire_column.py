from django.db import migrations


SQL_ADD_COLUMN = """
ALTER TABLE litiges
ADD COLUMN IF NOT EXISTS gestionnaire_id bigint NULL;
"""

SQL_ADD_FK = """
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_name = 'litiges_gestionnaire_id_fk'
    ) THEN
        ALTER TABLE litiges
        ADD CONSTRAINT litiges_gestionnaire_id_fk
        FOREIGN KEY (gestionnaire_id) REFERENCES accounts_user(id)
        DEFERRABLE INITIALLY DEFERRED;
    END IF;
END;
$$;
"""

SQL_ADD_INDEX = """
CREATE INDEX IF NOT EXISTS litiges_gestionnaire_id_idx
ON litiges (gestionnaire_id);
"""

SQL_DROP_CONSTRAINT = """
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_name = 'litiges_gestionnaire_id_fk'
    ) THEN
        ALTER TABLE litiges DROP CONSTRAINT litiges_gestionnaire_id_fk;
    END IF;
END;
$$;
"""

SQL_DROP_COLUMN = """
ALTER TABLE litiges
DROP COLUMN IF EXISTS gestionnaire_id;
"""


class Migration(migrations.Migration):

    dependencies = [
        ("litiges", "0002_add_niveau_escalade"),
    ]

    operations = [
        migrations.RunSQL(SQL_ADD_COLUMN, SQL_DROP_COLUMN),
        migrations.RunSQL(SQL_ADD_FK, SQL_DROP_CONSTRAINT),
        migrations.RunSQL(SQL_ADD_INDEX, "DROP INDEX IF EXISTS litiges_gestionnaire_id_idx"),
    ]
