from django.db import models
from django.core.validators import FileExtensionValidator
from django.contrib.auth.models import User
from autoslug import AutoSlugField

# Create your models here.
class ThreatReports(models.Model):
    title = models.CharField(max_length=200)
    csv_file = models.FileField(upload_to='threat_reports/', max_length=255, validators=[FileExtensionValidator(allowed_extensions=['csv', 'xlsx', 'xls'])])
    reported_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title