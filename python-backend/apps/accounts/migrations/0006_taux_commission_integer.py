from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0005_remove_loyaltyaccount_parrain_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='taux_commission_defaut',
            field=models.IntegerField(null=True, blank=True),
        ),
    ]
