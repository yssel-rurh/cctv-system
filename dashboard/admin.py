from django.contrib import admin
from .models import User, Camera, Video, Alert, Report

admin.site.register(User)
admin.site.register(Camera)
admin.site.register(Video)
admin.site.register(Alert)
admin.site.register(Report)
