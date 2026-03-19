from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ("litiges", "0005_recreate_messages_litiges"),
    ]

    operations = [
        migrations.RunSQL(
            """
            ALTER TABLE litiges
            ADD COLUMN IF NOT EXISTS admin_assigne_id bigint NULL;

            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'litiges_admin_assigne_id_fk'
                ) THEN
                    ALTER TABLE litiges
                    ADD CONSTRAINT litiges_admin_assigne_id_fk
                    FOREIGN KEY (admin_assigne_id) REFERENCES accounts_user(id)
                    ON DELETE SET NULL;
                END IF;
            END;
            $$;
            """,
            reverse_sql="ALTER TABLE litiges DROP COLUMN IF EXISTS admin_assigne_id;",
        ),
    ]
