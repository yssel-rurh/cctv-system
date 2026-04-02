import cv2
from ultralytics import YOLO#identifying objects
from deep_sort_realtime.deepsort_tracker import DeepSort#Tracks Identified objects

import time
from .models import Alert

import math

CAMERA_RESTRICTED_ZONE = {0:(0,0,640,480)}

MAX_TIME = 5 * 60  #Suspicion alerts go off after 5 minutes.

human_loitering_time = {}
bag_last_unattended_time = {}

def is_inside_zone(camera_id, x,y):
    x1,y1,x2,y2 = CAMERA_RESTRICTED_ZONE[camera_id]# 0,0,640,480
    
    test = x1<=x<=x2 and y1<=y<=y2
    return test

def alert_message(msg):
    print("Alert: ", msg)
    Alert.objects.create(message = msg)
    

model=YOLO("yolov8n.pt")#detects OBJECTS from the frames
tracker = DeepSort(max_age = 30)#The system remembers a given object for the next 30 frames even if it disappears briefly

def analyze_video(frame, camera_id = 0):
    results = model(frame)
    detectedObjects = []
    
    for result in results:
        for box,conf_score,cls in zip(result.boxes.xyxy, result.boxes.conf, result.boxes.cls):#the boxes is for mapping the area covered by a given object and the cls is object figure to determine what has been detected
            x1,y1,x2,y2 = map(int,box) #working with integer values for the coordinates
            class_id = int(cls)#
            
            #HUMAN=0 and BAGS=24-28=> cls value
            
            if class_id in [0,24,26,28]:#only persons and Bags Added to DetectedObjects
                width, height = x2-x1,y2-y1
                detectedObjects.append(([x1,y1,width,height], float(conf_score),class_id))
    
    current_time = time.time()
    alerts = []   
         
         #DEEP SORT        
    tracks = tracker.update_tracks(detectedObjects, frame = frame)#Match newly detected Objects with the existing ones
    #this loop checks for a match 
    for track in tracks:
        if not track.is_confirmed():#Helps us to deal with false positives by ensuring an object is real, ie confirmed
            continue 
        track_id = track.track_id
        l,t,r,b = map(int,track.to_ltrb())
        class_id = track.det_class
    
        #find the center of both the human and the bag.
        center_x = (l+r)//2
        center_y = (t+b)//2
        
        if class_id==0:
            label = f"Person {track_id}"
            color = (0,255,0)
        elif class_id in[24,26,28]:
            label = f"Bag {track_id}"
            color = (0,0,255)
        else:
            continue 
            
        #RESTRICTED AREA ACCESS CHECK
        if class_id == 0:
            if is_inside_zone(camera_id, center_x, center_y):
                if (camera_id,track_id) not in human_loitering_time:
                    human_loitering_time[(camera_id, track_id)] = current_time #We create a new initial time
                elif current_time - human_loitering_time[(camera_id, track_id)]>MAX_TIME:
                    msg = f"Alert: {label} OVERSTAYING IN RESTRICTED AREA"
                    alerts.append(msg)
            #He has left the restricted area
            else:
                human_loitering_time.pop((camera_id,track_id),None)
                
            
        
        #UNATTENDED BAG CHECK
        elif class_id in [24,26,28]:
            #Checking whether there is a humn nearby
            human_nearby = False
            
            for person in tracks:
                if person.det_class == 0:
                    pl,pt,pr,pb = map(int,person.to_ltrb())
                    px,py = (pr+pl)//2, (pt+pb)//2
                   
                    #Distance from the bag
                    distance = math.sqrt((px - center_x)**2 + (py - center_y)**2)
                    if distance < 50:
                        human_nearby = True
                        break  #Analyzes the next person
            
            if not human_nearby: #false flip
                if (camera_id,track_id) not in bag_last_unattended_time:
                    bag_last_unattended_time[(camera_id, track_id)] = current_time
                elif current_time - bag_last_unattended_time[camera_id,track_id]>MAX_TIME:
                    msg = f"{label} BAG LEFT UNATTENDED!"
                    alerts.append(msg)
                    
             #Human nearby   
            else:
                bag_last_unattended_time.pop((camera_id,track_id), None)
                
                
        cv2.rectangle(frame, (l,t),(r,b), color,2)
        cv2.putText(frame, label,(l,t-10), cv2.FONT_HERSHEY_COMPLEX,0.6,color,2)#The string sits on top without overlapping the top edge
        
    #restricted zone marking
    x1,y1,x2,y2 = CAMERA_RESTRICTED_ZONE[camera_id]
    cv2.rectangle(frame, (x1,y1),(x2,y2),(255,0,0),2)
    cv2.putText(frame,"Restricted Area!",(x1,y1-10),cv2.FONT_HERSHEY_SIMPLEX, 0.6,(255,0,0),2)
    

    
    
    return alerts


def generate_Alert():
    return "Suspicious Movement Detected"