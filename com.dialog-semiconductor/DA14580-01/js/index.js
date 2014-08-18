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
		//navigator.camera = cordova.require("org.apache.cordova.camera.camera");
		
	},
	
	onBCReady : function(){
		//document.addEventListener("newDevice",app.newDevice,false)
		app.device = new BC.Device({deviceAddress:DEVICEADDRESS,type:DEVICETYPE});
		app.subscribe();
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
						dataType="Hex";
						if(length<16){
							length="0"+length.toString(16);
							
						}else{
							length=length.toString(16);
						}
					}
					if(!tag2){
						if(app.timer!=null){
							clearInterval(app.timer);
							return;
						}
						text1=length+text1+check;
						character.write(dataType,text1,function(data){

						},function(){
							alert("write error!");
						});
					}else{
						var interval=document.getElementById("interval").value;
						if(interval=="write time interval"){
							interval=1000;
						}						
						app.timer=setInterval(function(){
							var text=document.getElementById("youWrite").value;
							text=text.replace(/\s*/g,"");
							var textLength=text.length;
							if(textLength %2!=0){
								text="0"+text;
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
						}else{
							document.getElementById("showData").innerHTML=text+data.value.getASCIIString()+"\n";
						}
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