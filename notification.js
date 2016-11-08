var socket = null;
var notificationCallback = null;

function initNotificationService(host, namespace, user, context, callBack){
  $.getScript("https://cdn.socket.io/socket.io-1.4.5.js", function(){
    console.log("socket.io client script loaded");

    if(context){
      socket = io(host + namespace, { query : "user=" + user + "&context=" + context });
    }
    else{
      socket = io(host + namespace, { query : "user=" + user });
    }

    notificationCallback = callBack;

    socket.on('notificationInfoSelf', function(info){
      console.log(info);
    });  
    socket.on('notificationErrorSelf', function(error){
      console.error(error);
    });
    socket.on('notify', function(notification){
      callBack(notification);
    });

  });
}

function notify(data){
  if(socket)
    socket.emit('notify', data);
}

