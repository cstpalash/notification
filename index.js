var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = require('./config.json');
var moment = require('moment');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/script', function(req, res){
  res.sendFile(__dirname + '/notification.js');
});

app.get('/test', function(req, res){
  res.sendFile(__dirname + '/test.html');
});

config.namespaces.map((ns, i) => {
	if(ns.active){
		var nsp = io.of(ns.name);
		nsp.on('connection', function(socket){
		  var now = moment().format(config.dateFormat);

		  console.log(now + ' : ' + socket.id + ' connected to namespace : ' + ns.name);

		  if(socket.request._query.user){
		  	if(socket.request._query.context){
		  		socket.join(socket.request._query.context);
		  		nsp.to(socket.id).emit('notificationInfoSelf', 
		  		{ 
		  			message : socket.request._query.user + ' has joined with context ' + socket.request._query.context,
		  			time : now
		  		});
		  	}
		  	else{
		  		nsp.to(socket.id).emit('notificationInfoSelf', 
		  		{ 
		  			message : socket.request._query.user + ' has joined',
		  			time : now
		  		});
		  	}
		  }
		  else{
		  	nsp.to(socket.id).emit('notificationErrorSelf', 
		  		{ 
		  			message : 'user is mandatory during connection',
		  			time : now,
		  			data : socket.request._query
		  		});
		  }

		  socket.on('notify', function(notificationData){
		  	var notifyNow = moment().format(config.dateFormat);
		  	if(notificationData.user &&  
		  		notificationData.type && 
		  		notificationData.data)
		  	{
		  		notificationData.time = notifyNow;

		  		switch(notificationData.type.toLowerCase()){
		  			case 'allbutmewithcontext':
		  				socket.broadcast.in(notificationData.context).emit('notify', notificationData);
		  				break;
		  			case 'allwithcontext':
		  				nsp.to(notificationData.context).emit('notify', notificationData);
		  				break;
		  			case 'allbutme':
		  				socket.broadcast.emit('notify', notificationData);
		  				break;
		  			case 'all':
		  				nsp.emit('notify', notificationData);
		  				break;
		  			default:
		  				break;
		  		}
		  	}
		  	else{
		  		nsp.to(socket.id).emit('notificationErrorSelf', 
		  		{ 
		  			message : 'user, type and data are mandatory for notification',
		  			time : notifyNow,
		  			data : notificationData
		  		});
		  	}
		  });

		  socket.on('disconnect', function(){
		    console.log(moment().format(config.dateFormat) + ' : ' + socket.id + ' disconnected from namespace : ' + ns.name);
		  });
		});
	}
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});