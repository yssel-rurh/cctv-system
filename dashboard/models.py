from django.db import models
from django.contrib.auth.models import AbstractUser
 #Our Database Models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin','Security Admin'),
        ('officer','Surveillance Officer')
    )
    role = models.CharField(max_length=10,choices=ROLE_CHOICES)
    email = models.EmailField()
    
class Camera(models.Model):
    name = models.CharField(max_length=100)
    ip_address = models.URLField()
    


class Video(models.Model):
    uploaded_by = models.ForeignKey(User,on_delete=models.CASCADE)
    file = models.FileField(upload_to='videos/')#Django helps us to autosave uploaded videos to the /videos folder
    uploaded_at = models.DateTimeField(auto_now_add = True)

class Alert(models.Model):
    camera = models.ForeignKey(
        Camera, 
        null=True,  #db     
        blank=True,    #form  
        on_delete=models.SET_NULL
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    # camera = models.ForeignKey(Camera,on_delete= models.CASCADE)# used only when we shall be using ipwebcam

class AlertSummary(models.Model):
    summary_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    alert_count = models.IntegerField(default=0)

