import cv2
from ultralytics import YOLO#identifying objects
from deep_sort_realtime.deepsort_tracker import DeepSort#Tracks Identified objects

import time
from .models import Alert

import math

CAMERA_RESTRICTED_ZONE = {0:(0,0,320,480)}

MAX_TIME = 5 #Suspicion alerts go off after 5 seconds


human_loitering_time = {}
bag_last_unattended_time = {}

def is_inside_zone(camera_id, x,y):
    x1,y1,x2,y2 = CAMERA_RESTRICTED_ZONE[camera_id]# 0,0,640,480
    
    test = x1<=x<=x2 and y1<=y<=y2
    return test


model=YOLO("yolov8n.pt")#detects OBJECTS from the frames
tracker = DeepSort(max_age = 10, n_init=0.3, max_cosine_distance=0.2)#The system remembers a given object for the next 30 frames even if it disappears briefly

def analyze_video(frame, camera_id = 0):
    detectedObjects = []
    results = model(frame)
    
    for result in results:
        for box,conf_score,cls in zip(result.boxes.xyxy, result.boxes.conf, result.boxes.cls):#the boxes is for mapping the area covered by a given object and the cls is object figure to determine what has been detected
            x1,y1,x2,y2 = map(int,box) #working with integer values for the coordinates
            class_id = int(cls)        #Determines the object Detected
            
            #HUMAN=0 and BAGS=24-28=> cls value
            
            if class_id in [0,24,26,28] and conf_score>0.7:#only persons and Bags Added to DetectedObjects
                width, height = x2-x1,y2-y1
                detectedObjects.append(([x1,y1,width,height], float(conf_score),class_id))
                #To work with minimum number of tracked objects
                if len(detectedObjects)==2:
                    break
    
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
        
        #NAMING THE OBJECTS
        if class_id==0:
            label = f"Person {track_id}"
            color = (0,255,0)
            print(label)
        elif class_id in[24,26,28]:
            label = f"Bag {track_id}"
            color = (0,0,255)
            print(label)
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
            #Checking whether there is a human nearby
            human_nearby = False
            persons = [t for t in tracks if t.det_class== 0] #persons is a list of t items which are of type Person: 0
            
            for person in persons:
                
                pl,pt,pr,pb = map(int,person.to_ltrb())
                px,py = (pr+pl)//2, (pt+pb)//2# Nearest Person Center Coordinates
            
                
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
                
        #Drawing Bounds for the Tracked Items
        cv2.rectangle(frame, (l,t),(r,b), color,2)
        cv2.putText(frame, label,(l,t-10), cv2.FONT_HERSHEY_COMPLEX,0.6,color,2)#The string sits on top without overlapping the top edge
        
    #Drawing the Restricted Zone
    x1,y1,x2,y2 = CAMERA_RESTRICTED_ZONE[camera_id]
    cv2.rectangle(frame, (x1,y1),(x2,y2),(255,0,0),2)
    cv2.putText(frame,"Restricted Area!",(x1,y1-10),cv2.FONT_HERSHEY_SIMPLEX, 0.6,(255,0,0),2)
    
    
    return alerts
