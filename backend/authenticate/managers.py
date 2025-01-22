from django.contrib.auth.base_user import BaseUserManager

class CustomUserManager(BaseUserManager):

    def create_user(self, email, username, password, **extra_fields):
        if not email:
            raise ValueError("Please enter an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("is_staff status must be True")
        
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("is_superuser status must be True")
        
        if extra_fields.get('is_active') is not True:
            raise ValueError("is_active status must be True")
        
        return self.create_user(email, username, password, **extra_fields)
