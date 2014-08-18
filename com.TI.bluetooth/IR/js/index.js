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
	device : {},

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
	},
	
	onBCReady : function(){
		app.device = new BC.Device({deviceAddress:DEVICEADDRESS,type:DEVICETYPE});
		// app.serviceID = [{0:"1800",1:["2a00","2a01","2a02","2a03","2a04"]},
		// 			 {0:"1801",1:["2a05"]},
		// 			 {0:"180a",1:["2a23","2a24","2a25","2a26","2a27","2a28","2a29","2a2a","2a50"]},
		// 			 {0:"aa00",1:["aa01","aa02"]},
		// 			 {0:"aa10",1:["aa11","aa12","aa13"]},
		// 			 {0:"aa20",1:["aa21","aa22"]},
		// 			 {0:"aa30",1:["aa31","aa32","aa33"]},
		// 			 {0:"aa40",1:["aa41","aa42","aa43"]},
		// 			 {0:"aa50",1:["aa51","aa52"]},
		// 			 {0:"ffeo",1:["ffe1"]},
		// 			 {0:"aa60",1:["aa61","aa62"]},
		// 			 {0:"ccc0",1:["ccc1","ccc2","ccc3"]},
		// 			 {0:"ffc0",1:["ffc1","ffc2"]}];
	},
	
	write : function(){
		
		//var device = new BC.Device({deviceAddress:"78:C5:E5:99:26:54",type:"BLE"});
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID(address[0][0])[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID(address[0][1][3])[0];
					var text=document.getElementById("youWrite").value;
					character.write("Hex",text,function(data){
						alert(JSON.stringify(data));
					},function(){
						alert("write error!");
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
	read : function(){
		
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID(address[3][0])[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID(address[3][1][0])[0];
					character.read(function(data){
						alert(JSON.stringify(data));
						document.getElementById("charactisticArea").innerHTML=JSON.stringify(data);
					},function(){
						alert("read error!");
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
	subscribe : function(){
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID(address[1][0])[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID(address[1][1][0])[0];					
					character.subscribe(function(data){
						alert("subscribe success");
						document.getElementById("subscribeArea").innerHTML=JSON.stringify(data);
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
				var service = app.device.getServiceByUUID(address[1][0])[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID(address[1][1][0])[0];					
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
};