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
    BAelement.innerHTML = "Hello, World!!! " + this.config.foo
    var BAsubElement = document.createElement("p")
    BAsubElement.innerHTML = "Click test" 
    BAsubElement.id = "BeforeAfterClickid"
    var BAsubElement2 = document.createElement("p")
    BAsubElement2.innerHTML = "Click2" 
    BAsubElement2.id = "BeforeAfterClickid2"
    BAelement.appendChild(BAsubElement)
    BAelement.appendChild(BAsubElement2)
    return BAelement
  },
  
  notificationReceived: function(notification, payload, sender) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
      var baelem = document.getElementById("BeforeAfterClickid")
      baelem.addEventListener("click", () => {
        
        BeforeAfterMoudule.sendSocketNotification("BEFORECAPTURE")
        BeforeAfterMoudule.sendNotification("LOADINGBEFORE")
        
        console.log(" click successex !")
        baelem.innerHTML = "click success"       
      }) 
      var baelem2 = document.getElementById("BeforeAfterClickid2")
      baelem2.addEventListener("click", () => {
        //
        BeforeAfterMoudule.sendSocketNotification("AFTERCAPTURE")
        BeforeAfterMoudule.sendNotification("LOADINGAFTER")
        
        //
        console.log(" click2 successex !")
        baelem2.innerHTML = "click2 success"       
      }) 
        break
    }
  },
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "BEFORECAPTURESUCCESS":
        console.log("Socket recevied payload : "+payload)
        var baelem2 = document.getElementById("BeforeAfterClickid")
        BeforeAfterMoudule.sendNotification("BEFOREIMAGE")
        //
        BeforeAfterMoudule.sendNotification('SHOWCHANGEDIMAGE');
        //
        baelem2.innerHTML = payload
        break
      case "AFTERCAPTURESUCCESS":
        console.log("Socket recevied payload : "+payload)
        var baelem2 = document.getElementById("BeforeAfterClickid")
        BeforeAfterMoudule.sendNotification("AFTERIMAGE")
        //
        BeforeAfterMoudule.sendNotification('SHOWCHANGEDIMAGE');
        //
        baelem2.innerHTML = payload
      break
    }
  }

})

