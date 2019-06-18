////////////////////////////// 나이추측 인공지능 헤어추천 /////////////////////////////
// 버튼 클릭 
MMM-Testpython/MMM-Testpython.js
var Testpythons;
Module.register("MMM-Testpython", {

    defaults: {},
    start: function (){
        Testpythons = this;
    },

  getDom: function() {
    var element = document.createElement("div")
    element.className = "myContent"
    element.id="divid1"
    element.font = 4
    var subElement = document.createElement("p")
    subElement.innerHTML = "여기를 클릭하세요."
    subElement.id = "clickid1"
    subElement.className = "click"
    subElement.style.fontSize = "2em"
    element.appendChild(subElement)
    var subelement2 = document.createElement("p")
    subelement2.innerHTML = "이 곳에 예상 나이가 표시됩니다."
    subelement2.id = "showage"
    subelement2.className = "showage"
    subelement2.style.fontSize = "2em"
    element.appendChild(subelement2)
    return element
  },
  

  notificationReceived: function(notification, payload, sender) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
      var elem = document.getElementById("clickid1")
      elem.addEventListener("click", () => {
        Testpythons.sendSocketNotification("TEST")
        var showage2 = document.getElementById("showage")
        showage2.innerHTML = "당신의 나이를 분석중입니다."
        Testpythons.sendNotification('CHANGE_POSITIONS', 
        modules = {
              'Man10s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Man20s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Man30s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Man40s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Man50s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman10s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman20s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman30s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman40s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman50s':{
                visible: 'false',
                position: 'bottom_left',
              },
            });
        console.log("hello~hello~hello~hello~hello~hello~hello~hello~hello~hello~")
      }) 
      break;
      case "Modules All Change" :
      var ele2 = document.getElementById("showage")
      ele2.innerHTML =  "이 곳에 예상 나이가 표시됩니다."
      }
  },
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "I_DID":
        console.log("Socket recevied 1: " + payload);
        var payload3;
        payload3=payload.toString().split(",");
        console.log("Socket recevied 1: " + payload3);
        var elemk = document.getElementById("clickid1")
        var elemk2 = document.getElementById("showage");
        var gender = payload3[0];
        console.log("Socket recevied 1: " + gender);
        var age = payload3[1];
        console.log("Socket recevied 1: " + age);
        var change;
        if (gender == "male"){
          if(age <= 19){
            change = 1;
            console.log(age);
            console.log(change);
          }
          else if(19 < age && age < 30){
            change = 2;
            console.log(age);
            console.log(change);
          }
          else if(29 < age && age < 40){
            change = 3; 
            console.log(age);
            console.log(change);
          }
          else if(39 < age && age < 50){
            change = 4;  
            console.log(age);
            console.log(change);
          }
          else if(49 < age){
            change = 5;
            console.log(age);
            console.log(change);
          }
        }
        else if (gender == "female"){
          if(age <= 19){
            change = 6;
            console.log(age);
            console.log(change);
          }
          else if(19 < age && age < 30){
            change = 7;
            console.log(age);
            console.log(change);
          }
          else if(29 < age && age < 40){
            change = 8; 
            console.log(age);
            console.log(change);
          }
          else if(39 < age && age < 50){
            change = 9;  
            console.log(age);
            console.log(change);
          }
          else if(49 < age){
            change = 10;
            console.log(age);
            console.log(change);
          }
        }
          switch(change){
            case 1 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man10s':{
                  visible: 'true',
                  position: 'bottom_left',
                }
              })
              break
            case 2 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man20s':{
                  visible: 'true',
                  position: 'bottom_left',
              }
            })
            break
            case 3 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man30s':{
                  visible: 'true',
                  position: 'bottom_left',
              }
            })
            break
            case 4 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man40s':{
                  visible: 'true',
                  position: 'top_right',
              }
            })
            break
            case 5 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man50s':{
                  visible: 'true',
                  position: 'bottom_left',
              }
            })
            break
            case 6 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman10s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
            case 7 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman20s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
            case 8 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman30s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
            case 9 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman40s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
            case 10 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman50s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
          } 
        elemk.innerHTML = "";
        elemk2.innerHTML = "고객님의 예상나이" + age + "세의 추천헤어입니다.";   
      break
    }
  }
})
//AzureAPI python code
//MMM-Testpython/FCF.py
/*
import requests
import matplotlib.pyplot as plt
from PIL import Image
from matplotlib import patches
from io import BytesIO
import os
import cv2

cap = cv2.VideoCapture(0)

ret, frame = cap.read()
cv2.imwrite('C:/BeautyM/modules/MMM-Testpython/CognitiveFace/CognitiveFace.jpg', frame)

cap.release()
cv2.destroyAllWindows()

subscription_key = "2ad26e5076914e9ca6ab0e80877d3e4a"

image_path = os.path.join('C:/BeautyM/modules/MMM-Testpython/CognitiveFace/CognitiveFace.jpg')

assert subscription_key

face_api_url = 'https://koreacentral.api.cognitive.microsoft.com/face/v1.0/detect'

image_data = open(image_path, "rb")

headers = {'Content-Type': 'application/octet-stream',
           'Ocp-Apim-Subscription-Key': subscription_key}
params = {
    'returnFaceId': 'true',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
    'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
}

response = requests.post(face_api_url, params=params, headers=headers, data=image_data)
response.raise_for_status()
faces = response.json()

image_read = open(image_path, "rb").read()
image = Image.open(BytesIO(image_read))

plt.figure(figsize=(8, 8))
ax = plt.imshow(image, alpha=1)
for face in faces:
    fr = face["faceRectangle"]
    fa = face["faceAttributes"]
    origin = (fr["left"], fr["top"])
    p = patches.Rectangle(
        origin, fr["width"], fr["height"], fill=False, linewidth=2, color='dodgerblue')
    ax.axes.add_patch(p)
    plt.text(origin[0], origin[1], "%s, %d"%(fa["gender"].capitalize(), fa["age"]),
             fontsize=20, weight="bold", va="bottom", color='dodgerblue')
_ = plt.axis("off")
plt.show()

print(fa["gender"])
print(fa["age"])
*/

//MMM-Testpython/node_helper.js
//python과 인터페이스(MMM-Testpython)연결
var NodeHelper = require("node_helper");
var {PythonShell} = require('python-shell');
var socketTestpython;
module.exports = NodeHelper.create({
  start: function() {
    socketTestpython=this;
    console.log(this.name+"node_helper started")
  },
  
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "TEST":
        console.log("notification : " + notification)
	    PythonShell.run('C:/BeautyM/modules/MMM-Testpython/FCF.py', null, function (err, result) {
            if (err) throw err;
            console.log("gender : " + result);          
            socketTestpython.sendSocketNotification("I_DID",result);
          });
	       
        break
    }
  }
}) 

////////////////////////////////전후사진찍기////////////////////////
//메뉴선택인터페이스, 
//MMM-BeforeAfter/MMM-BeforeAfter.js
var BeforeAfterMoudule;
Module.register("MMM-BeforeAfter", {

    defaults: {},
    start: function (){
        BeforeAfterMoudule = this;
    },
  
  getDom: function() {
    var BAelement = document.createElement("div")
    BAelement.className = "BeforeAftercontent"
    BAelement.id="BeforeAfterdiv"
    BAelement.innerHTML = "전 후 사진 비교입니다 !"
    var BAsubElement = document.createElement("p")
    BAsubElement.innerHTML = "전 사진 찍기" 
    BAsubElement.id = "BeforeAfterClickid"
    BAelement.appendChild(BAsubElement)
    var BAsubElement2 = document.createElement("p")
    BAsubElement2.innerHTML = "후 사진 찍기" 
    BAsubElement2.id = "BeforeAfterClickid2"
    BAelement.appendChild(BAsubElement2)

    return BAelement
  },
  
  notificationReceived: function(notification, payload, sender) {
    switch(notification) {
      case "BEFOREIMAGECLICK" :
        var baelem = document.getElementById("BeforeAfterClickid")     
          BeforeAfterMoudule.sendSocketNotification("BEFORECAPTURE")
          baelem.innerHTML = "카메라 로딩 중"       
        break;
      case "AFTERIMAGECLICK" :
      var baelem2 = document.getElementById("BeforeAfterClickid2")
        BeforeAfterMoudule.sendSocketNotification("AFTERCAPTURE")
        //BeforeAfterMoudule.sendNotification("LOADINGAFTER")
        baelem2.innerHTML = "카메라 로딩 중"       
        break;
    }
  },
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "BEFORECAPTURESUCCESS":
        console.log("Socket recevied payload1: "+payload)
        var baelem = document.getElementById("BeforeAfterClickid")
        BeforeAfterMoudule.sendNotification("BEFOREIMAGE")
        //
        BeforeAfterMoudule.sendNotification('SHOWCHANGEDIMAGE');
        //
        baelem.innerHTML = "자르기 전 사진찍기 완료!"
        break
      case "AFTERCAPTURESUCCESS":
        console.log("Socket recevied payload1: "+payload)
        var baelem2 = document.getElementById("BeforeAfterClickid2")
        BeforeAfterMoudule.sendNotification("AFTERIMAGE")
        //
        BeforeAfterMoudule.sendNotification('SHOWCHANGEDIMAGE');
        //
        BeforeAfterMoudule.sendNotification("CUTDAY",payload)

        baelem2.innerHTML = "자르기 후 사진찍기 완료!"
      break
    }
  }

})
//MMM-BeforeAfter/before.py
//컷팅 전 사진 캡쳐
/*
import cv2

cap = cv2.VideoCapture(0)
cap.set(3,640)
cap.set(4,480)
ret, frame = cap.read()

cv2.imshow('frame', frame)
cv2.imwrite('C:/BeautyM/modules/MMM-BeforeAfter/before/before.png', frame)


cap.release()
cv2.destroyAllWindows()
print("python success !")
*/

//MMM-BeforeAfter/before2.py
//컷팅 후 캡쳐
/*
# -*- coding: utf-8 -*-
import datetime
import cv2

cap = cv2.VideoCapture(0)
cap.set(3,640)
cap.set(4,480)
ret, frame = cap.read()
#now = datetime.datetime.now().strftime("%d_%H-%M-%S")
now = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")

cv2.imshow('frame', frame)

cv2.imwrite('C:/BeautyM/modules/MMM-BeforeAfter/before/before2.png', frame)
cv2.imwrite("C:/BeautyM/modules/MMM-BeforeAfter/minsoo/" + str(now) + ".png", frame)

cap.release()
cv2.destroyAllWindows()
print(now)

*/

//

//MMM-BeforeAfter/node_helper.js
// before.py,before2.py와 js 연결코드
var NodeHelper = require("node_helper");
var {PythonShell} = require('python-shell');
var socketTestpython;
module.exports = NodeHelper.create({
  start: function() {
    socketTestpython=this;
    console.log(this.name+"node_helper started")
  },
  
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "BEFORECAPTURE":
        console.log("notification : " + notification)
	      PythonShell.run('C:/BeautyM/modules/MMM-BeforeAfter/before.py', null, function (err, result) {
            if (err) throw err;
            console.log(result);          
            socketTestpython.sendSocketNotification("BEFORECAPTURESUCCESS",result);
          });
	       
        break
      case "AFTERCAPTURE":
        console.log("notification : " + notification)
        PythonShell.run('C:/BeautyM/modules/MMM-BeforeAfter/before2.py', null, function (err, result) {
          if (err) throw err;
          console.log(result);          
          socketTestpython.sendSocketNotification("AFTERCAPTURESUCCESS",result);
        });
        
      break
    }
  }
}) 

//MMM-BeforeImage/MMM-BeforeImage.js
//컷팅 전 사진을 띄어줌
var BeforeImages;
Module.register("MMM-BeforeImage", {

	// Default module config.

	defaults: {

        // an array of strings, each is a path to a directory with images

        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],

        // the speed at which to switch between images, in milliseconds

		slideshowSpeed: 10 * 50,

        // if zero do nothing, otherwise set width to a pixel value

        fixedImageWidth: 0,

        // if zero do nothing, otherwise set height to a pixel value        

        fixedImageHeight: 0,

        // if true randomize image order, otherwise do alphabetical

        randomizeImageOrder: false,

        // if true combine all images in all the paths

        // if false each path with be viewed seperately in the order listed

        treatAllPathsAsOne: false,

	// if true reload the image list after each iteration

	reloadImageList: true,

        // if true, all images will be made grayscale, otherwise as they are

        makeImagesGrayscale: false,

        // list of valid file extensions, seperated by commas

        validImageFileExtensions: 'bmp,jpg,gif,png',

		// a delay timer after all images have been shown, to wait to restart (in ms)

		delayUntilRestart: 0,

		a:0,

	},

    // load function

	start: function () {
		BeforeImages = this;
        // add identifier to the config

        this.config.identifier = this.identifier;

        // ensure file extensions are lower case

        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();

        // set no error

		this.errorMessage = null;

        if (this.config.imagePaths.length == 0) {

			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."

        }

        else {

            // create an empty image list

            this.imageList = [];

            // set beginning image index to -1, as it will auto increment on start

            this.imageIndex = -1;

            // ask helper function to get the image list

            console.log("MMM-ImageSlideshow sending socket notification");

            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);

			// do one update time to clear the html

			this.updateDom();

			// set a blank timer

			this.interval = null;

			this.loaded = false;

        }

	},

	// Define required scripts.

	getStyles: function() {

        // the css contains the make grayscale code

		return ["imageslideshow.css"];

	},    

	// the socket handler

	socketNotificationReceived: function(notification, payload) {

                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);

		// if an update was received

		if (notification === "IMAGESLIDESHOW_FILELIST") {

			// check this is for this module based on the woeid

			if (payload.identifier === this.identifier)

			{

				// extract new list

				var newImageList = payload.imageList;

				

				// check if anything has changed. return if not.

				if (newImageList.length == this.imageList.length) {

					var unchanged = true;

					for (var i = 0 ; i < newImageList.length; i++) {

						unchanged = this.imageList[i] == newImageList[i];

						if (!unchanged)

							break;

					}

					if (unchanged)

						return;

				}

				// set the image list

				this.imageList = payload.imageList;

                // if image list actually contains images

                // set loaded flag to true and update dom

                if (this.imageList.length > 0 && !this.loaded) {

                    this.loaded = true;

                    this.updateDom();

					// set the timer schedule to the slideshow speed			

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom();

						}, this.config.slideshowSpeed);					

                }

			}

		}

    },    

	// Override dom generator.

	getDom: function () {

		var wrapper = document.createElement("div");

        // if an error, say so (currently no errors can occur)

        if (this.errorMessage != null) {

            wrapper.innerHTML = this.errorMessage;

        }

        // if no errors

        else {

            // if the image list has been loaded

            if (this.loaded === true) {

				// if was delayed until restart, reset index reset timer

				if (this.imageIndex == -2) {

					this.imageIndex = -1;

					clearInterval(this.interval);

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom(0);

						}, this.config.slideshowSpeed);						

				}				

                // iterate the image list index

                this.imageIndex += 1;

				// set flag to show stuff

				var showSomething = true;

                // if exceeded the size of the list, go back to zero

                if (this.imageIndex == this.imageList.length) {

                                       // console.log("MMM-ImageSlideshow sending reload request");

				       // reload image list at end of iteration, if config option set

                                       if (this.config.reloadImageList) 

                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);



					// if delay after last image, set to wait

					if (this.config.delayUntilRestart > 0) {

						this.imageIndex = -2;

						wrapper.innerHTML = "&nbsp;";

						showSomething = false;

						clearInterval(this.interval);

						var self = this;

						this.interval = setInterval(function() {

							self.updateDom(0);

							}, this.config.delayUntilRestart);									

					}

					// if not reset index

					else

						this.imageIndex = 0;

				}

				if (showSomething) {

					// create the image dom bit

					var image = document.createElement("img");
					image.id="imgid";
					// if set to make grayscale, flag the class set in the .css file
					image.addEventListener("click", () => {
						console.log(" image click !!!!!");
						this.config.a=3;
						BeforeImages.sendNotification("BEFOREIMAGECLICK");
                                              });
					
					
					if (this.config.makeImagesGrayscale)

						image.className = "desaturate";

					// create an empty string

					var styleString = '';

					// if width or height or non-zero, add them to the style string

					if (this.config.fixedImageWidth != 0)

						styleString += 'width:' + this.config.fixedImageWidth + 'px;';

					if (this.config.fixedImageHeight != 0)

						styleString += 'height:' + this.config.fixedImageHeight + 'px;';

					// if style string has antyhing, set it

					if (styleString != '')

						image.style = styleString;

					// set the image location
					/*
					image.addEventListener("click", () => {
					  
					  console.log(" click success !");
					  this.config.a==1;
							
					}) 
					*/					
					
					if(this.config.a==0){
					image.src = this.imageList[0];
					
					}
					if(this.config.a==1){
						image.src = this.imageList[this.imageList.length-1];
						}
					if(this.config.a==2){
						image.src = this.imageList[this.imageList.length-2];
						}
					if(this.config.a==3){
						image.src = this.imageList[2];
						}
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
					
					wrapper.appendChild(image);					

				}

            }

            else {

                // if no data loaded yet, empty html

                wrapper.innerHTML = "&nbsp;";

            }

        }
		
        // return the dom

		return wrapper;

	},
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		
		if(notification === "BEFOREIMAGE"){
			//console.log("this a ", this.config.a)
			this.config.a=1;
		}
		if(notification === "setDefault"){
			//console.log("this a ", this.config.a)
			this.config.a=0;
		}
		if(notification === "AFTERIMAGE"){
			//console.log("this a ", this.config.a)
			this.config.a=2;
		}
		if(notification === "LOADINGBEFORE"){
			//console.log("this a ", this.config.a)
			this.config.a=3;
		}
/*
		if(notification === "LOADINGAFTER"){
			console.log("this a ", this.config.a)
			this.config.a=3;

		}
*/
	}

});

//MMM-AfterImage/MMM-AfterImage.js
//컷팅 후 사진을 보여줌

Module.register("MMM-AfterImage", {
	// Default module config.
	defaults: {
        // an array of strings, each is a path to a directory with images
        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],
        // the speed at which to switch between images, in milliseconds
		slideshowSpeed: 10 * 50,
        // if zero do nothing, otherwise set width to a pixel value
        fixedImageWidth: 0,
        // if zero do nothing, otherwise set height to a pixel value        
        fixedImageHeight: 0,
        // if true randomize image order, otherwise do alphabetical
        randomizeImageOrder: false,
        // if true combine all images in all the paths
        // if false each path with be viewed seperately in the order listed
        treatAllPathsAsOne: false,
	// if true reload the image list after each iteration
	reloadImageList: true,
        // if true, all images will be made grayscale, otherwise as they are
        makeImagesGrayscale: false,
        // list of valid file extensions, seperated by commas
        validImageFileExtensions: 'bmp,jpg,gif,png',
		// a delay timer after all images have been shown, to wait to restart (in ms)
		delayUntilRestart: 0,
		a: 0,
	},
    // load function
	start: function () {
        // add identifier to the config
        this.config.identifier = this.identifier;
        // ensure file extensions are lower case
        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();
        // set no error
		this.errorMessage = null;
        if (this.config.imagePaths.length == 0) {
			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."
        }
        else {
            // create an empty image list
            this.imageList = [];
            // set beginning image index to -1, as it will auto increment on start
            this.imageIndex = -1;
            // ask helper function to get the image list
            console.log("MMM-ImageSlideshow sending socket notification");
            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);
			// do one update time to clear the html
			this.updateDom();
			// set a blank timer
			this.interval = null;
			this.loaded = false;
        }
	},
	// Define required scripts.
	getStyles: function() {
        // the css contains the make grayscale code
		return ["imageslideshow.css"];
	},    
	// the socket handler
	socketNotificationReceived: function(notification, payload) {
                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);
		// if an update was received
		if (notification === "IMAGESLIDESHOW_FILELIST") {
			// check this is for this module based on the woeid
			if (payload.identifier === this.identifier)
			{
				// extract new list
				var newImageList = payload.imageList;
				//console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@imageList : ",newImageList.length,this.imageList.length)
				// check if anything has changed. return if not.
				if (newImageList.length == this.imageList.length) {
					var unchanged = true;
					for (var i = 0 ; i < newImageList.length; i++) {
						unchanged = this.imageList[i] == newImageList[i];
						if (!unchanged)
							break;
					}
					if (unchanged)
						return;
				}
				// set the image list
				this.imageList = payload.imageList;
                // if image list actually contains images
                // set loaded flag to true and update dom
                if (this.imageList.length > 0 && !this.loaded) {
                    this.loaded = true;
                    this.updateDom();
					// set the timer schedule to the slideshow speed			
					var self = this;
					this.interval = setInterval(function() {
						self.updateDom();
						}, this.config.slideshowSpeed);					
                }
			}
		}
    },    
	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
        // if an error, say so (currently no errors can occur)
        if (this.errorMessage != null) {
            wrapper.innerHTML = this.errorMessage;
        }
        // if no errors
        else {
            // if the image list has been loaded
            if (this.loaded === true) {
				// if was delayed until restart, reset index reset timer
				if (this.imageIndex == -2) {
					this.imageIndex = -1;
					clearInterval(this.interval);
					var self = this;
					this.interval = setInterval(function() {
						self.updateDom(0);
						}, this.config.slideshowSpeed);						
				}				
                // iterate the image list index
                this.imageIndex += 1;
				// set flag to show stuff
				var showSomething = true;
                // if exceeded the size of the list, go back to zero
                if (this.imageIndex == this.imageList.length) {
                                       // console.log("MMM-ImageSlideshow sending reload request");
				       // reload image list at end of iteration, if config option set
                                       if (this.config.reloadImageList) 
                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);

					// if delay after last image, set to wait
					if (this.config.delayUntilRestart > 0) {
						this.imageIndex = -2;
						wrapper.innerHTML = "&nbsp;";
						showSomething = false;
						clearInterval(this.interval);
						var self = this;
						this.interval = setInterval(function() {
							self.updateDom(0);
							}, this.config.delayUntilRestart);									
					}
					// if not reset index
					else
						this.imageIndex = 0;
				}
				if (showSomething) {
					// create the image dom bit
					var image = document.createElement("img");
					// if set to make grayscale, flag the class set in the .css file
					
					image.addEventListener("click", () => {
						console.log(" after image click !!!!!");
						this.config.a=3;
						BeforeImages.sendNotification("AFTERIMAGECLICK");
                                              });
					if (this.config.makeImagesGrayscale)
						image.className = "desaturate";
					// create an empty string
					var styleString = '';
					// if width or height or non-zero, add them to the style string
					if (this.config.fixedImageWidth != 0)
						styleString += 'width:' + this.config.fixedImageWidth + 'px;';
					if (this.config.fixedImageHeight != 0)
						styleString += 'height:' + this.config.fixedImageHeight + 'px;';
					// if style string has antyhing, set it
					if (styleString != '')
						image.style = styleString;
					// set the image location
					//console.log("this.imageList.length]",this.imageList.length)
					//console.log("this a",this.config.a)
					if(this.config.a==0){
					this.hide();
					}
					if(this.config.a==1){
						image.src = this.imageList[1];
						}
					if(this.config.a==2){
						image.src = this.imageList[this.imageList.length-1];
						}
					if(this.config.a==3){
						image.src = this.imageList[2];
						}
					// ad the image to the dom
					wrapper.appendChild(image);					
				}
            }
            else {
                // if no data loaded yet, empty html
                wrapper.innerHTML = "&nbsp;";
            }
        }
        // return the dom
		return wrapper;
	},
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		
		if(notification === "Modules All Change"){
			//console.log("this a ", this.config.a)
			//this.hide()

		}
		if(notification === "setDefault"){
			//console.log("this a ", this.config.a)
			this.hide();
			this.config.a=0;
			
		}
		if(notification === "BEFOREIMAGE"){
			//console.log("this a ", this.config.a)
			this.show()
			this.config.a=1;

		}
		if(notification === "AFTERIMAGE"){
			//console.log("this a ", this.config.a)
			this.config.a=2;

		}
		if(notification === "LOADINGAFTER"){
			//console.log("this a ", this.config.a)
			this.config.a=3;

		}
	}
});




///////////////////////////////////컷팅히스토리////////////////////////
//MMM-HistoryImage1/MMM-HistoryImage1.js
//컷팅히스토리파일에 저장되있는 첫번째 사진을 보여줌(MMM-BeforeAfter/minsoo 파일에 있는 사진)
Module.register("MMM-HistoryImage1", {

	// Default module config.

	defaults: {

        // an array of strings, each is a path to a directory with images

        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],

        // the speed at which to switch between images, in milliseconds

		slideshowSpeed: 10 * 500,

        // if zero do nothing, otherwise set width to a pixel value

        fixedImageWidth: 0,

        // if zero do nothing, otherwise set height to a pixel value        

        fixedImageHeight: 0,

        // if true randomize image order, otherwise do alphabetical

        randomizeImageOrder: false,

        // if true combine all images in all the paths

        // if false each path with be viewed seperately in the order listed

        treatAllPathsAsOne: false,

	// if true reload the image list after each iteration

	reloadImageList: true,

        // if true, all images will be made grayscale, otherwise as they are

        makeImagesGrayscale: false,

        // list of valid file extensions, seperated by commas

        validImageFileExtensions: 'bmp,jpg,gif,png',

		// a delay timer after all images have been shown, to wait to restart (in ms)

		delayUntilRestart: 0,
		d:0,
		a:0,
		payload3:0,
		c:0,

	},

    // load function

	start: function () {

        // add identifier to the config

        this.config.identifier = this.identifier;

        // ensure file extensions are lower case

        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();

        // set no error

		this.errorMessage = null;

        if (this.config.imagePaths.length == 0) {

			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."

        }

        else {

            // create an empty image list

            this.imageList = [];

            // set beginning image index to -1, as it will auto increment on start

            this.imageIndex = -1;

            // ask helper function to get the image list

            console.log("MMM-ImageSlideshow sending socket notification");

            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);

			// do one update time to clear the html

			this.updateDom();

			// set a blank timer

			this.interval = null;

			this.loaded = false;

        }

	},

	// Define required scripts.

	getStyles: function() {

        // the css contains the make grayscale code

		return ["imageslideshow.css"];

	},    

	// the socket handler

	socketNotificationReceived: function(notification, payload) {

                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);

		// if an update was received

		if (notification === "IMAGESLIDESHOW_FILELIST") {

			// check this is for this module based on the woeid

			if (payload.identifier === this.identifier)

			{

				// extract new list

				var newImageList = payload.imageList;

				

				// check if anything has changed. return if not.

				if (newImageList.length == this.imageList.length) {

					var unchanged = true;

					for (var i = 0 ; i < newImageList.length; i++) {

						unchanged = this.imageList[i] == newImageList[i];

						if (!unchanged)

							break;

					}

					if (unchanged)

						return;

				}

				// set the image list

				this.imageList = payload.imageList;

                // if image list actually contains images

                // set loaded flag to true and update dom

                if (this.imageList.length > 0 && !this.loaded) {

                    this.loaded = true;

                    this.updateDom();

					// set the timer schedule to the slideshow speed			

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom();

						}, this.config.slideshowSpeed);					

                }

			}

		}

    },    

	// Override dom generator.

	getDom: function () {

		var wrapper = document.createElement("div");

        // if an error, say so (currently no errors can occur)

        if (this.errorMessage != null) {

            wrapper.innerHTML = this.errorMessage;

        }

        // if no errors

        else {

            // if the image list has been loaded

            if (this.loaded === true) {

				// if was delayed until restart, reset index reset timer

				if (this.imageIndex == -2) {

					this.imageIndex = -1;

					clearInterval(this.interval);

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom(0);

						}, this.config.slideshowSpeed);						

				}				

                // iterate the image list index

                this.imageIndex += 1;

				// set flag to show stuff

				var showSomething = true;

                // if exceeded the size of the list, go back to zero

                if (this.imageIndex == this.imageList.length) {

                                       // console.log("MMM-ImageSlideshow sending reload request");

				       // reload image list at end of iteration, if config option set

                                       if (this.config.reloadImageList) 

                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);



					// if delay after last image, set to wait

					if (this.config.delayUntilRestart > 0) {

						this.imageIndex = -2;

						wrapper.innerHTML = "&nbsp;";

						showSomething = false;

						clearInterval(this.interval);

						var self = this;

						this.interval = setInterval(function() {

							self.updateDom(0);

							}, this.config.delayUntilRestart);									

					}

					// if not reset index

					else

						this.imageIndex = 0;

				}

				if (showSomething) {

					// create the image dom bit

					var image = document.createElement("img");
					image.id="imgid";
					// if set to make grayscale, flag the class set in the .css file

					
					
					if (this.config.makeImagesGrayscale)

						image.className = "desaturate";

					// create an empty string

					var styleString = '';

					// if width or height or non-zero, add them to the style string

					if (this.config.fixedImageWidth != 0)

						styleString += 'width:' + this.config.fixedImageWidth + 'px;';

					if (this.config.fixedImageHeight != 0)

						styleString += 'height:' + this.config.fixedImageHeight + 'px;';

					// if style string has antyhing, set it

					if (styleString != '')

						image.style = styleString;

					// set the image location
					/*
					image.addEventListener("click", () => {
					  
					  console.log(" click success !");
					  this.config.a==1;
							
					}) 
					*/					
					image.src = this.imageList[this.imageList.length-1];
					//image.src.lastIndexOf("/");
					this.config.c=image.src.toString().match(/.*\/(.+?)\./);
					this.config.d=this.config.c[1];
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
        			this.config.payload3=this.config.d.split("-");
					console.log("filenameeeeeeeeeeeeeeeeeeeeeeedd",this.config.payload3[0],"file name end");
					wrapper.appendChild(image);					

				}

            }

            else {

                // if no data loaded yet, empty html

                wrapper.innerHTML = "&nbsp;";

            }

        }
		
        // return the dom

		return wrapper;

	},
	
	getHeader: function() {
		if(this.config.c[1]==1)
		{
			return "컷트를 한 기록이 없습니다!";
			
		}
		else
		{
			return this.config.payload3[0]+"년"+this.config.payload3[1]+"월"+this.config.payload3[2]+"일"+this.config.payload3[3]+"시"+this.config.payload3[4]+"분"+this.config.payload3[5]+"초"+"에 하신 컷트 사진입니다.";
		}
		//return '2019-05-'+this.data.header;
	},
	
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		/*
		if(notification === "CUTDAY"){
			console.log("cut day notification success!", payload)
			this.data.header=payload;
			this.updateDom();
			

		}
		*/
		
	}

});

//MMM-HistoryImage2/MMM-HistoryImage2.js
//컷팅히스토리파일에 저장되있는 두번째 사진을 보여줌(MMM-BeforeAfter/minsoo 파일에 있는 사진)
Module.register("MMM-HistoryImage2", {

	// Default module config.

	defaults: {

        // an array of strings, each is a path to a directory with images

        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],

        // the speed at which to switch between images, in milliseconds

		slideshowSpeed: 10 * 500,

        // if zero do nothing, otherwise set width to a pixel value

        fixedImageWidth: 0,

        // if zero do nothing, otherwise set height to a pixel value        

        fixedImageHeight: 0,

        // if true randomize image order, otherwise do alphabetical

        randomizeImageOrder: false,

        // if true combine all images in all the paths

        // if false each path with be viewed seperately in the order listed

        treatAllPathsAsOne: false,

	// if true reload the image list after each iteration

	reloadImageList: true,

        // if true, all images will be made grayscale, otherwise as they are

        makeImagesGrayscale: false,

        // list of valid file extensions, seperated by commas

        validImageFileExtensions: 'bmp,jpg,gif,png',

		// a delay timer after all images have been shown, to wait to restart (in ms)

		delayUntilRestart: 0,

		a:0,
		d:0,
		payload3:0,
		c:0,
	},

    // load function

	start: function () {

        // add identifier to the config

        this.config.identifier = this.identifier;

        // ensure file extensions are lower case

        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();

        // set no error

		this.errorMessage = null;

        if (this.config.imagePaths.length == 0) {

			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."

        }

        else {

            // create an empty image list

            this.imageList = [];

            // set beginning image index to -1, as it will auto increment on start

            this.imageIndex = -1;

            // ask helper function to get the image list

            console.log("MMM-ImageSlideshow sending socket notification");

            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);

			// do one update time to clear the html

			this.updateDom();

			// set a blank timer

			this.interval = null;

			this.loaded = false;

        }

	},

	// Define required scripts.

	getStyles: function() {

        // the css contains the make grayscale code

		return ["imageslideshow.css"];

	},    

	// the socket handler

	socketNotificationReceived: function(notification, payload) {

                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);

		// if an update was received

		if (notification === "IMAGESLIDESHOW_FILELIST") {

			// check this is for this module based on the woeid

			if (payload.identifier === this.identifier)

			{

				// extract new list

				var newImageList = payload.imageList;

				

				// check if anything has changed. return if not.

				if (newImageList.length == this.imageList.length) {

					var unchanged = true;

					for (var i = 0 ; i < newImageList.length; i++) {

						unchanged = this.imageList[i] == newImageList[i];

						if (!unchanged)

							break;

					}

					if (unchanged)

						return;

				}

				// set the image list

				this.imageList = payload.imageList;

                // if image list actually contains images

                // set loaded flag to true and update dom

                if (this.imageList.length > 0 && !this.loaded) {

                    this.loaded = true;

                    this.updateDom();

					// set the timer schedule to the slideshow speed			

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom();

						}, this.config.slideshowSpeed);					

                }

			}

		}

    },    

	// Override dom generator.

	getDom: function () {

		var wrapper = document.createElement("div");

        // if an error, say so (currently no errors can occur)

        if (this.errorMessage != null) {

            wrapper.innerHTML = this.errorMessage;

        }

        // if no errors

        else {

            // if the image list has been loaded

            if (this.loaded === true) {

				// if was delayed until restart, reset index reset timer

				if (this.imageIndex == -2) {

					this.imageIndex = -1;

					clearInterval(this.interval);

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom(0);

						}, this.config.slideshowSpeed);						

				}				

                // iterate the image list index

                this.imageIndex += 1;

				// set flag to show stuff

				var showSomething = true;

                // if exceeded the size of the list, go back to zero

                if (this.imageIndex == this.imageList.length) {

                                       // console.log("MMM-ImageSlideshow sending reload request");

				       // reload image list at end of iteration, if config option set

                                       if (this.config.reloadImageList) 

                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);



					// if delay after last image, set to wait

					if (this.config.delayUntilRestart > 0) {

						this.imageIndex = -2;

						wrapper.innerHTML = "&nbsp;";

						showSomething = false;

						clearInterval(this.interval);

						var self = this;

						this.interval = setInterval(function() {

							self.updateDom(0);

							}, this.config.delayUntilRestart);									

					}

					// if not reset index

					else

						this.imageIndex = 0;

				}

				if (showSomething) {

					// create the image dom bit

					var image = document.createElement("img");
					image.id="imgid";
					// if set to make grayscale, flag the class set in the .css file

					
					
					if (this.config.makeImagesGrayscale)

						image.className = "desaturate";

					// create an empty string

					var styleString = '';

					// if width or height or non-zero, add them to the style string

					if (this.config.fixedImageWidth != 0)

						styleString += 'width:' + this.config.fixedImageWidth + 'px;';

					if (this.config.fixedImageHeight != 0)

						styleString += 'height:' + this.config.fixedImageHeight + 'px;';

					// if style string has antyhing, set it

					if (styleString != '')

						image.style = styleString;

					// set the image location
					/*
					image.addEventListener("click", () => {
					  
					  console.log(" click success !");
					  this.config.a==1;
							
					}) 
					*/
					if(this.config.a==0){
						image.src = this.imageList[this.imageList.length-2];
						
						}		
					if(this.config.a==1){
						image.src = this.imageList[0];
						}		
					this.config.c=image.src.toString().match(/.*\/(.+?)\./);
					this.config.d=this.config.c[1];
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
        			this.config.payload3=this.config.d.split("-");
				
					console.log("filenameeeeeeeeeeeeeeeeeeeeeee",this.config.c[1],"file name end");
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
					
					wrapper.appendChild(image);					

				}

            }

            else {

                // if no data loaded yet, empty html

                wrapper.innerHTML = "&nbsp;";

            }

        }
		
        // return the dom

		return wrapper;

	},
	getHeader: function() {
		if(this.config.c[1]==127)
		{
			return " ";
			
		}
		else if(this.config.c[1]=1)
		{
			return "더이상 컷트기록이 없습니다!";
		}
		else{
			return this.config.payload3[0]+"년"+this.config.payload3[1]+"월"+this.config.payload3[2]+"일"+this.config.payload3[3]+"시"+this.config.payload3[4]+"분"+this.config.payload3[5]+"초"+"에 하신 컷트 사진입니다.";
		}
		//return '2019-05-'+this.data.header;
	},
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		/*
		if(notification === "setDefault"){
			console.log("Delete notification success!", payload)
			this.config.a=1;
			this.updateDom();
			

		}
		*/
		
	}

});

//MMM-HistoryImage3/MMM-HistoryImage3.js
//컷팅히스토리파일에 저장되있는 두번째 사진을 보여줌(MMM-BeforeAfter/minsoo 파일에 있는 사진)
Module.register("MMM-HistoryImage3", {

	// Default module config.

	defaults: {

        // an array of strings, each is a path to a directory with images

        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],

        // the speed at which to switch between images, in milliseconds

		slideshowSpeed: 10 * 500,

        // if zero do nothing, otherwise set width to a pixel value

        fixedImageWidth: 0,

        // if zero do nothing, otherwise set height to a pixel value        

        fixedImageHeight: 0,

        // if true randomize image order, otherwise do alphabetical

        randomizeImageOrder: false,

        // if true combine all images in all the paths

        // if false each path with be viewed seperately in the order listed

        treatAllPathsAsOne: false,

	// if true reload the image list after each iteration

	reloadImageList: true,

        // if true, all images will be made grayscale, otherwise as they are

        makeImagesGrayscale: false,

        // list of valid file extensions, seperated by commas

        validImageFileExtensions: 'bmp,jpg,gif,png',

		// a delay timer after all images have been shown, to wait to restart (in ms)

		delayUntilRestart: 0,
		d:0,
		payload3:0,
		a:0,
		c:0,
	},

    // load function

	start: function () {

        // add identifier to the config

        this.config.identifier = this.identifier;

        // ensure file extensions are lower case

        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();

        // set no error

		this.errorMessage = null;

        if (this.config.imagePaths.length == 0) {

			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."

        }

        else {

            // create an empty image list

            this.imageList = [];

            // set beginning image index to -1, as it will auto increment on start

            this.imageIndex = -1;

            // ask helper function to get the image list

            console.log("MMM-ImageSlideshow sending socket notification");

            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);

			// do one update time to clear the html

			this.updateDom();

			// set a blank timer

			this.interval = null;

			this.loaded = false;

        }

	},

	// Define required scripts.

	getStyles: function() {

        // the css contains the make grayscale code

		return ["imageslideshow.css"];

	},    

	// the socket handler

	socketNotificationReceived: function(notification, payload) {

                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);

		// if an update was received

		if (notification === "IMAGESLIDESHOW_FILELIST") {

			// check this is for this module based on the woeid

			if (payload.identifier === this.identifier)

			{

				// extract new list

				var newImageList = payload.imageList;

				

				// check if anything has changed. return if not.

				if (newImageList.length == this.imageList.length) {

					var unchanged = true;

					for (var i = 0 ; i < newImageList.length; i++) {

						unchanged = this.imageList[i] == newImageList[i];

						if (!unchanged)

							break;

					}

					if (unchanged)

						return;

				}

				// set the image list

				this.imageList = payload.imageList;

                // if image list actually contains images

                // set loaded flag to true and update dom

                if (this.imageList.length > 0 && !this.loaded) {

                    this.loaded = true;

                    this.updateDom();

					// set the timer schedule to the slideshow speed			

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom();

						}, this.config.slideshowSpeed);					

                }

			}

		}

    },    

	// Override dom generator.

	getDom: function () {

		var wrapper = document.createElement("div");

        // if an error, say so (currently no errors can occur)

        if (this.errorMessage != null) {

            wrapper.innerHTML = this.errorMessage;

        }

        // if no errors

        else {

            // if the image list has been loaded

            if (this.loaded === true) {

				// if was delayed until restart, reset index reset timer

				if (this.imageIndex == -2) {

					this.imageIndex = -1;

					clearInterval(this.interval);

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom(0);

						}, this.config.slideshowSpeed);						

				}				

                // iterate the image list index

                this.imageIndex += 1;

				// set flag to show stuff

				var showSomething = true;

                // if exceeded the size of the list, go back to zero

                if (this.imageIndex == this.imageList.length) {

                                       // console.log("MMM-ImageSlideshow sending reload request");

				       // reload image list at end of iteration, if config option set

                                       if (this.config.reloadImageList) 

                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);



					// if delay after last image, set to wait

					if (this.config.delayUntilRestart > 0) {

						this.imageIndex = -2;

						wrapper.innerHTML = "&nbsp;";

						showSomething = false;

						clearInterval(this.interval);

						var self = this;

						this.interval = setInterval(function() {

							self.updateDom(0);

							}, this.config.delayUntilRestart);									

					}

					// if not reset index

					else

						this.imageIndex = 0;

				}

				if (showSomething) {

					// create the image dom bit

					var image = document.createElement("img");
					image.id="imgid";
					// if set to make grayscale, flag the class set in the .css file

					
					
					if (this.config.makeImagesGrayscale)

						image.className = "desaturate";

					// create an empty string

					var styleString = '';

					// if width or height or non-zero, add them to the style string

					if (this.config.fixedImageWidth != 0)

						styleString += 'width:' + this.config.fixedImageWidth + 'px;';

					if (this.config.fixedImageHeight != 0)

						styleString += 'height:' + this.config.fixedImageHeight + 'px;';

					// if style string has antyhing, set it

					if (styleString != '')

						image.style = styleString;

					// set the image location
					/*
					image.addEventListener("click", () => {
					  
					  console.log(" click success !");
					  this.config.a==1;
							
					}) 
					*/					
					image.src = this.imageList[this.imageList.length-3];
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
					this.config.c=image.src.toString().match(/.*\/(.+?)\./);
					this.config.d=this.config.c[1];
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
        			this.config.payload3=this.config.d.split("-");
					console.log("filenameeeeeeeeeeeeeeeeeeeeeee",this.config.c[1],"file name end");
					
					wrapper.appendChild(image);					

				}

            }

            else {

                // if no data loaded yet, empty html

                wrapper.innerHTML = "&nbsp;";

            }

        }
		
        // return the dom

		return wrapper;

	},
	getHeader: function() {
		if(this.config.c[1]==127)
		{
			return " ";
			
		}
		else if(this.config.c[1]=1)
		{
			return "더이상 컷트기록이 없습니다!";
		}
		else{
			return this.config.payload3[0]+"년"+this.config.payload3[1]+"월"+this.config.payload3[2]+"일"+this.config.payload3[3]+"시"+this.config.payload3[4]+"분"+this.config.payload3[5]+"초"+"에 하신 컷트 사진입니다.";
		}
		//return '2019-05-'+this.data.header;
	},
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		
		
	}

});

//MMM-DeleteImage/MMM-DeleteImage.js
//사진을 지우기의 인터페이스
/* global Module */

/* Magic Mirror
 * Module: MM Hide All
 *
 * By EoF https://forum.magicmirror.builders/user/eof
 * MIT Licensed.
 */
var DeleteImageS;
Module.register("MMM-DeleteImage",{
	defaults: {},
    start: function (){
        DeleteImageS = this;
    },
	getScripts: function() {
		return ["modules/MMM-DeleteImage/js/jquery.js"];
	},

	getStyles: function() {
		return ["MMM-DeleteImage-style.css"];
	},
	
	getDom: function() {
		var wrapper = document.createElement("div");
		var button = document.createElement("div");
		var text = document.createElement("span");
		var overlay = document.createElement("div");
		var hidden = true;
		
		overlay.className = "paint-it-black";
		
		button.className = "hide-toggle";
		button.appendChild(text);
		text.innerHTML = "끝내기";
		
		wrapper.appendChild(button);
		wrapper.appendChild(overlay);
		
		$(button).on("click", function(){
			if(hidden){

				DeleteImageS.sendNotification("REMOTE_ACTION", {action: "MONITOROFF"});
				DeleteImageS.sendNotification("REMOTE_ACTION", {action: "REFRESH"});
				DeleteImageS.sendNotification("setDefault")
				DeleteImageS.sendSocketNotification("DELETE")
				$(text).html('접속');
				hidden = false;
			}else{
				$(overlay).fadeOut(1000);
				$(button).fadeTo(1000, 1);
				$(text).html('끝내기');
				hidden = true;
			}
		});
		
		return wrapper;
	}
});

//MMM-DeleteImage/Delete.py
//실제로 특정사진을 지우는 파이썬코드
/*
import os

def removeExtensionFile(filePath, fileExtension):
    if os.path.exists(filePath):
        for file in os.scandir(filePath):
            if file.name.endswith(fileExtension):
                os.remove(file.path)
        return 'Remove File:' + fileExtension
    else:
        return 'Directory Not Found'
print(removeExtensionFile('C:/BeautyM/modules/MMM-BeforeAfter/minsoo','.png'))
print(removeExtensionFile('C:/BeautyM/modules/MMM-BeforeAfter/before','.png'))
*/

//MMM-Testpython/node_helper.js
//파이썬코드와 js연결코드
var NodeHelper = require("node_helper");
var {PythonShell} = require('python-shell');
var socketDeleteImage;
module.exports = NodeHelper.create({
  start: function() {
    socketDeleteImage=this;
    console.log(this.name+"node_helper started")
  },
  
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "DELETE":
        console.log("notification : " + notification)
	    PythonShell.run('C:/BeautyM/modules/MMM-DeleteImage/Delete.py', null, function (err, result) {
            if (err) throw err;
            console.log("Delete Success" + result);          
            //socketDeleteImage.sendSocketNotification("I_DID",result);
          });
	       
        break
    }
  }
}) 


