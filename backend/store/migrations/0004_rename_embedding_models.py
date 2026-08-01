import django.db.models.deletion
import pgvector.django.vector
from django.db import migrations, models

# Kept literal (not imported from models) so the migration stays self-contained.
CATEGORY_CHOICES = [
    ('shirts', 'Shirts'),
    ('pants', 'Pants'),
    ('footwear', 'Footwear'),
    ('coats_jackets', 'Coats & Jackets'),
]


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_product_store_produ_categor_92f296_idx_and_more'),
    ]

    operations = [
        # 1. Rename ProductEmbedding -> ProductEmbeddingText (keeps existing data)
        migrations.RenameModel(
            old_name='ProductEmbedding',
            new_name='ProductEmbeddingText',
        ),
        # 2. Update the reverse accessor (embeddings -> text_embeddings)
        migrations.AlterField(
            model_name='productembeddingtext',
            name='product',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='text_embeddings',
                to='store.product',
            ),
        ),
        # 3. Add denormalized filter fields to the text embedding table
        migrations.AddField(
            model_name='productembeddingtext',
            name='category',
            field=models.CharField(blank=True, choices=CATEGORY_CHOICES, max_length=20),
        ),
        migrations.AddField(
            model_name='productembeddingtext',
            name='color',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddIndex(
            model_name='productembeddingtext',
            index=models.Index(fields=['category'], name='store_pet_category_idx'),
        ),
        migrations.AddIndex(
            model_name='productembeddingtext',
            index=models.Index(fields=['color'], name='store_pet_color_idx'),
        ),
        # 4. New Fashion-CLIP image embedding table (1024-d)
        migrations.CreateModel(
            name='ProductEmbeddingImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('embedding', pgvector.django.vector.VectorField(dimensions=1024)),
                ('category', models.CharField(blank=True, choices=CATEGORY_CHOICES, max_length=20)),
                ('color', models.CharField(blank=True, max_length=50)),
                ('product', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='image_embedding',
                    to='store.product',
                )),
            ],
        ),
        migrations.AddIndex(
            model_name='productembeddingimage',
            index=models.Index(fields=['category'], name='store_pei_category_idx'),
        ),
        migrations.AddIndex(
            model_name='productembeddingimage',
            index=models.Index(fields=['color'], name='store_pei_color_idx'),
        ),
    ]
