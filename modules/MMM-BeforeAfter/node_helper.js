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
	      PythonShell.run('/home/pi/Desktop/testbeforeafter/modules/MMM-BeforeAfter/before.py', null, function (err, result) {
            if (err) throw err;
            console.log(result);          
            socketTestpython.sendSocketNotification("BEFORECAPTURESUCCESS",result);
          });
	       
        break
      case "AFTERCAPTURE":
        console.log("notification : " + notification)
        PythonShell.run('/home/pi/Desktop/testbeforeafter/modules/MMM-BeforeAfter/before2.py', null, function (err, result) {
          if (err) throw err;
          console.log(result);          
          socketTestpython.sendSocketNotification("AFTERCAPTURESUCCESS",result);
        });
        
      break
    }
  }
}) 
