# In your app's management/commands directory, create a new Python file, e.g., check_table_name.py

# check_table_name.py
from django.core.management.base import BaseCommand
from .models import CustomUser

class Command(BaseCommand):
    help = 'Prints the class name and table name of CustomUser model'

    def handle(self, *args, **kwargs):
        class_name = CustomUser._meta.verbose_name.title()
        table_name = CustomUser._meta.db_table

        self.stdout.write(f"Class Name: {class_name}")
        self.stdout.write(f"Table Name: {table_name}")