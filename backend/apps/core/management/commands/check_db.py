"""
Management command to check database configuration.
"""

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Check which database is being used'

    def handle(self, *args, **kwargs):
        self.stdout.write(f"Database vendor: {connection.vendor}")
        self.stdout.write(f"Database name: {connection.settings_dict['NAME']}")
        self.stdout.write(f"Database engine: {connection.settings_dict['ENGINE']}")
        
        if connection.vendor == 'sqlite':
            self.stdout.write(self.style.WARNING('⚠️  Using SQLite - Schema switching disabled!'))
        elif connection.vendor == 'postgresql':
            self.stdout.write(self.style.SUCCESS('✅ Using PostgreSQL - Schema switching enabled'))
