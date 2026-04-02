from django.shortcuts import render,redirect
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from django.http import StreamingHttpResponse
import cv2
ip_url = "http://10.20.1.81:8080/video"

from .models import Camera, Video,Report, Alert
from .forms import VideoUploadForm
from .ai_module import analyze_video
from .utils import admin_required,officer_required


import time
from django.core.mail import send_mail
from django.contrib.auth import get_user_model 


# LOGIN 
def user_login(request):#POST request
    error = None
    if request.method == 'POST':
        #Checks whether the details used in the login are correct
        user = authenticate(
            username = request.POST['username'],
            password = request.POST['password']
        )
        #if the user is in the database and is an admin, he is directed to admin dashboard and if an officer, he is directed to officer dashboard
        if user:
            auth_login(request,user)#A new session 
            return redirect('admin_dashboard' if user.role == 'admin' else 'officer_dashboard')
        else:
            error = "INVALID USERNAME OR PASSWORD"
    
    #in case of an error it returns the Login page again
    return render(request,'index.html',{'error':error})

#HomePage
def home(request):
    return render(request, 'home.html')

 
#ADMIN'S DASHBOARD
@login_required
@admin_required
def admin_dashboard(request):
    form = VideoUploadForm()
    return render(request,'admin_dashboard.html',{
        'cameras' : Camera.objects.all(),
        'reports' : Report.objects.all(),
        'videos' : Video.objects.all(),
        'form' : form     
    })    
    # return render(request, 'admin_dashboard.html')

#OFFICER'S DASHBOARD
@login_required
@officer_required
def officer_dashboard(request):
    return render(request,'officer_dashboard.html',{
        # 'cameras' : Camera.objects.all(),
        'alerts' : Alert.objects.all()
    }) 
    
    
#HOW WE UPLOAD THE VIDEO IN OFFLINE MODE
@login_required
@admin_required
def upload_video(request):
    
    form = VideoUploadForm(request.POST or None, request.FILES or None)
    
    if form.is_valid():
        video = form.save(commit=False)
        video.uploaded_by = request.user
        video.save()#Saves the Video to the /videos folder as specified by our dbase schema.
        
        #THE AI PROCESSOR Using our AI models
    
        result = analyze_video(video.file.path)
        
        #CREATES A NEW REPORT FROM VIDEO UPLOADED
        Report.objects.create(
            video = video,
            generated_by = request.user,
            summary = result
        )
        
        return redirect('admin_dashboard')
    return render(request,'upload.html',{'form':form})

#LIVESTREAMING
#runs when the Admin Dashboard is loaded
def generate_frames(camera_id=0):
    # cap = cv2.VideoCapture(ip_url)
    cam= cv2.VideoCapture(camera_id)#My Laptop's webcam
    
    if not cam.isOpened():
        print("Camera not opening")
    else:
        print("Camera opened succesfully")
        
    last_alert_time = 0
    AlertCoolDown = 60

    while True:
        success, frame = cam.read()
        if not success:
            break
        
        alerts = analyze_video(frame, camera_id=camera_id)
        current_time = time.time()
    
        
        if alerts and (current_time - last_alert_time > AlertCoolDown):
            for msg in alerts:
                Alert.objects.create(
                    message = msg
                )
            last_alert_time = current_time# This ensures that alerts are sent after one minute to optimize the Database
            
            
            # Autosending the Alert to the admin and the officers
            User = get_user_model()
            emails = User.objects.values_list('email',flat = True) 
            
            send_mail(
                subject='SECURITY ALERT',
                message= msg,
                from_email= 'washira@gmail.com',
                recipient_list=list(emails),
                fail_silently= True
            )

            

        _,buffer = cv2.imencode('.jpg',frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        
        
def video_feed(request, camera_id):
    # camera = Camera.objects.get(id = camera_id)#Used when wanting to load different feeds from the IP webcam
    
    #This loads the videos in frames.
    return StreamingHttpResponse(
        generate_frames(),
        content_type = 'multipart/x-mixed-replace; boundary=frame'
    )
        