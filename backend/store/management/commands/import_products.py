from django.core.management.base import BaseCommand
from data_preprocessing.upload_products_to_db import run_product_import


class Command(BaseCommand):
    help = 'Triggers the external data preprocessing pipeline to seed the database'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the enriched CSV file')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']

        # stdout is passed through so the pipeline logs via Django's writer.
        run_product_import(csv_file_path, stdout_writer=self.stdout)