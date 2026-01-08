from django.contrib import admin
from .models import *

# Register your models here.
admin.site.site_header = "RiskLens Admin"
admin.site.site_title = "RiskLens Admin Portal"
admin.site.index_title = "Welcome to RiskLens Admin Portal"

admin.site.register(ThreatReports)
