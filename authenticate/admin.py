

# Register your models here.
from django.contrib import admin
from .models import CustomUser,Profile
# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Profile)