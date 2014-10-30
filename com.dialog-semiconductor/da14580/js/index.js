/*
	Copyright 2013-2014, JUMA Technology

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

var app = {

	device:{},
	timer:null,
	numID:1,
    // Application Constructor
    initialize: function() {
        app.bindCordovaEvents();
    },
    
    bindCordovaEvents: function() {
		document.addEventListener('deviceready',app.onDeviceReady,false);
        document.addEventListener('bcready', app.onBCReady, false);
    },
    
	onDeviceReady : function(){
		var BC = window.BC = cordova.require("org.bcsphere.bcjs");
		var ProgressEvent = window.ProgressEvent = cordova.require('org.apache.cordova.file.ProgressEvent');
		var LocalFileSystem = window.LocalFileSystem = cordova.require('org.apache.cordova.file.LocalFileSystem');
		var requestFileSystem = window.requestFileSystem = cordova.require('org.apache.cordova.file.requestFileSystem');
		requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.gotFS, app.fail);
	},
	
	onBCReady : function(){
		//document.addEventListener("newDevice",app.newDevice,false)
		app.device = new BC.Device({deviceAddress:DEVICEADDRESS,type:DEVICETYPE});
		//app.subscribe();
	},

	gotFS:function(fileSystem){
        newFile = fileSystem.root.getDirectory("bcsphere", {create : true,exclusive : false}, app.writerFile, app.fail);
    },


    writerFile : function(newFile){
    	var fileName = 'DA14580-01_';
    	var date = new Date();
    	fileName+=date.getFullYear();
		fileName+=parseInt(date.getMonth()+1)>9?parseInt(date.getMonth()+1).toString():'0' + parseInt(date.getMonth()+1);
		fileName+=date.getDate()>9?date.getDate().toString():'0' + date.getDate();
		fileName+=date.getHours()>9?date.getHours().toString():'0' + date.getHours();
		fileName+=date.getMinutes()>9?date.getMinutes().toString():'0' + date.getMinutes();
		fileName+=date.getSeconds()>9?date.getSeconds().toString():'0' + date.getSeconds();
		fileName+='.txt';
        newFile.getFile(fileName, {create : true,exclusive : false}, app.gotFileEntry, app.fail);  
    },

    gotFileEntry : function(fileEntry){
        fileEntry.createWriter(app.gotFileWriter, app.fail);
    },

    gotFileWriter: function(writer) {  
        writer.onwrite = function(evt) {  
            console.log("write success");  
        };
        app.writer = writer;
    },

    write : function(mes){
        app.writer.seek(app.writer.length);
        app.writer.write(new Date()+"   "+mes+"\r\n");
    },

    fail : function(error){
        console.log("Failed to retrieve file:" + error.code);  
    },
	stop : function(){
		if(app.timer!=null){
			clearInterval(app.timer);
			app.timer=null;
			app.numID=1;
		}
	},

	send : function(){
		if(app.timer!=null){
			clearInterval(timer);
			app.timer=null;
			app.numID=1;
		}
		//var device = new BC.Device({deviceAddress:"78:C5:E5:99:26:37",type:"BLE"});
		app.device.connect(function(){
			var tag1=false;
			var tag2=false;		
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("ffa0")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("ffa1")[0];
					var dataType="ASCII";
					tag1=document.getElementById("Hex2").checked;
					tag2=document.getElementById("cycleSend").checked;
					var text1=document.getElementById("youWrite").value;
					text1=text1.replace(/\s*/g,"");
					var num=text1.length;
					var check=0;
					var length=Math.floor((num+1)/2);
					if(num%2!=0){
						text1="0"+text1;
					}
					var sum = 0;
					for(var j=0;j<text1.length;j=j+1){
						var str = text1.substring(j,j+1);
						sum=sum+str.charCodeAt();
					}
					var checkNum=(sum%256);
					if(checkNum<16){
						check="0"+checkNum.toString(16);
					}else{
						check=checkNum.toString(16);
					}
					if(tag1){
						dataType="HEX";
						if(length<16){
							length="0"+length.toString(16);
							
						}else{
							length=length.toString(16);
						}
					}
					if(!tag2){
						app.stopSend();
						text1=length+text1+check;
						character.write(dataType,text1,function(data){

						},function(){
							alert("write error!");
						});
					}else{
						app.startSend(character);
					}
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connnect error!");
		});
	},

	startSend: function(character){
		var interval=document.getElementById("interval").value;
		if(interval==""){
			interval = 1000;
		}
		else{
			interval = parseInt(interval);
		}					
		app.timer=setInterval(function(){
			var text=document.getElementById("youWrite").value;
			var tag1=document.getElementById("Hex2").checked;
			var check=0;
			text=text.replace(/\s*/g,"");
			var dataType="ASCII";
			if(tag1){
				dataType="HEX";
			}
			var textLength=text.length;
			var length=Math.floor((textLength+1)/2);
			if(textLength %2!=0){
				text="0"+text;
			}

			var sum = 0;
			for(var j=0;j<text.length;j=j+1){
				var str = text.substring(j,j+1);
				sum=sum+str.charCodeAt();
			}
			var checkNum=(sum%256);
			if(checkNum<16){
				check="0"+checkNum.toString(16);
			}else{
				check=checkNum.toString(16);
			}

			var j=app.numID;
			if(j<16){
				j=j.toString(16);
				j="0"+j;
			}else{
				j=j.toString(16);
			}
			text=j+length+text+check;
			
			character.write(dataType,text,function(data){
			},function(){
				alert("write error!");
			});
			app.numID=app.numID+1;
		},interval);
	},

	stopSend: function(){
		if(app.timer!=null){
			clearInterval(app.timer);
		}
	},

	subscribe : function(){
		var tag=false;
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("ffa0")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("ffa1")[0];					
					character.subscribe(function(data){
						tag=document.getElementById("Hex1").checked;
						var text=document.getElementById("showData").value;
						if(tag){
							document.getElementById("showData").innerHTML=text+data.value.getHexString()+"\n";
							app.write(data.value.getHexString());
						}else{
							document.getElementById("showData").innerHTML=text+data.value.getASCIIString()+"\n";
							app.write(data.value.getASCIIString());
						}
						var tag2=document.getElementById("cycleSend").checked;
						if(tag2){
							if(data.value.getHexString() == '01'){
								app.startSend(character);
							}else if(data.value.getHexString() == '02'){
								app.stopSend();
							}
						}
					});

					var character1 = service.getCharacteristicByUUID('ffa2')[0];
					character1.subscribe(function(data){
						if(data.value.getHexString() == '01'){
								app.startSend(character);
							}else if(data.value.getHexString() == '02'){
								app.stopSend();
							}
					});
					character1.write('Hex','01',function(data){
						alert("write success");					
					},function(){
						alert("write error");
					});
			},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connnect error!");
		});
	},
	
	unsubscribe : function(){
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("ffa0")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("ffa1")[0];					
					character.unsubscribe(function(data){
						alert("unsubscribe success");					
					},function(){
						alert("unsubscribe error");
					});

					var character1 = service.getCharacteristicByUUID('ffa2')[0];
					character1.write('Hex','02',function(data){
						alert("write success");					
					},function(){
						alert("write error");
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connnect error!");
		});
	},

	clear : function(){
		document.getElementById("showData").innerHTML="";
	},
};
