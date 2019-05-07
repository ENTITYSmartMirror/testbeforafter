import cv2

cap = cv2.VideoCapture(0)

cap.set(3,640)
cap.set(4,480)

ret, frame = cap.read()
cv2.imshow('frame', frame)
cv2.imwrite('/home/pi/Desktop/testbeforeafter/modules/MMM-BeforeAfter/before/before.jpg', frame)

cap.release()
cv2.destroyAllWindows()
print("python success !")

