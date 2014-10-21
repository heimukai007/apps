var app = {
	device: {},
	realTemperature: [] ,

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
	},

	connect : function(){
		app.device.connect(function(){
			document.getElementById("Devices_state").innerHTML="connected";
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("F000AA00-0451-4000-B000-000000000000")[0];
				service.discoverCharacteristics(function(){
					var character1 = service.getCharacteristicByUUID("F000AA01-0451-4000-B000-000000000000")[0];
					var character2 = service.getCharacteristicByUUID("F000AA02-0451-4000-B000-000000000000")[0];
					character2.write("Hex","01",function(data){
					},function(){
						alert("write error!");
					});
					character1.subscribe(app.onNotify);
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connect error!");
		});

		app.loadTemperature();
	},	

	disconnect : function(){
		app.device.disconnect(function(){
			document.getElementById("Devices_state").innerHTML="disconnected";
		},function(){
			console.log("disconnect error");
		});
	},

	onNotify:function(buffer){
		var temp=buffer.value.getHexString();					
		var temperature=app.str2val(temp,5,8)/128;
		app.realTemperature.push(temperature);	
		console.log(JSON.stringify(app.realTemperature));
	},

	power : function(n){
		var x=1;
		for(var i=0;i<n;i++){
			 x=x*16;
		}
		return x;
	},

	str2val : function(str,x,y){
		var val;
		var buf;
		var j=0;
		var sum=0;
		var length=str.length;
		for(var i = x-1; i < y; i++){
			val = str.charCodeAt(i);
			if((val>=48)&&(val<=57)) buf=val-48;
			if((val>=97)&&(val<=102)) buf=val-87;
			switch(i)
			{
				case 0: j=1;break;
				case 1: j=0;break;
				case 2: j=3;break;
				case 3: j=2;break;
				case 4: j=1;break;
				case 5: j=0;break;
				case 6: j=3;break;
				case 7: j=2;break;
				case 8: j=1;break;
				case 9: j=0;break;
				case 10: j=3;break;
				case 11: j=2;break;
			}
			var xxx=app.power(j);
			sum=sum+buf*xxx;
		}
		return sum;
	},

	loadTemperature:function(){
		require([
	                'echarts',
	                'echarts/chart/bar'
	            ],

            	function (ec) {
                var myChart = ec.init(document.getElementById('main'));
                var option = {
				    tooltip : {
				        formatter: "{a} <br/>{b} : {c}"
				    },
				    toolbox: {
				        show : false,
				        feature : {
				            mark : {show: true},
				            restore : {show: true},
				            saveAsImage : {show: true}
				        }
				    },
				    series : [
				        {
				            name:'Current Temperature',
				            type:'gauge',
                            min:0,
                            max:50,
				            detail : {formatter:'{value}'},
				            data:[{value: 0, name: '°C'}]
				        }
				    ]
				};

				clearInterval(timeTicket);
				var timeTicket = setInterval(function (){
					if(app.realTemperature.length){
					    option.series[0].data[0].value =(eval(app.realTemperature.join("+"))/app.realTemperature.length).toFixed(2);
					    console.log(option.series[0].data[0].value);
					    myChart.setOption(option, true);
					    app.realTemperature=[];
				    }
				},2000);
        });
    },      
};


