from django.contrib import admin
from .models import *

# Register your models here.
admin.site.site_header = "CyberSec Admin"
admin.site.site_title = "CyberSec Admin Portal"
admin.site.index_title = "Welcome to CyberSec Admin Portal"

admin.site.register(ThreatReports)