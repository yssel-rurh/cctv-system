from django.urls import path
from . import views

urlpatterns = [
    path('', views.user_login, name='login'),#Directs us to a login page
    # path('login/', views.user_login, name='login'),#This page determines whether the user is an admin or an officer
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),#Sees Live Streams, Uploads Offline footage for automatic AI ANALYSIS, Views Reports, Views uploaded videos. 
    path('officer-dashboard/', views.officer_dashboard, name='officer_dashboard'),#Sees the Lives Streams and the Alerts only 
    path('upload/', views.upload_video, name='upload'),#Embedded in the admin's page to upload a video.
    path('video/<int:camera_id>/', views.video_feed, name='video_feed'),#embedded in the admins page to load livestream
] 
