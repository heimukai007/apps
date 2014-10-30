var app = {
	device: {},
	realHumidity: [] ,

    initialize: function() {
        app.bindCordovaEvents();
        app.loadHumidity();
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
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("F000AA20-0451-4000-B000-000000000000")[0];
				service.discoverCharacteristics(function(){
					var character1 = service.getCharacteristicByUUID("F000AA21-0451-4000-B000-000000000000")[0];
					var character2 = service.getCharacteristicByUUID("F000AA22-0451-4000-B000-000000000000")[0];
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
	},	

	disconnect : function(){
		app.device.disconnect(function(){
			var curValue=document.getElementById("curValue");
			curValue.innerHTML="0";
			app.option.series[0].data[0].value = 0;
			app.myChart.setOption(app.option, true);
		},function(){
			console.log("disconnect error");
		});
	},

	onNotify:function(buffer){
		console.log("111111111111111111");
		var temp=buffer.value.getHexString();					
		var humidity=app.str2val(temp,5,8);
		var humidity_new=125*humidity/65536-6;
		var curValue=document.getElementById("curValue");
		curValue.innerHTML=humidity_new;

		app.option.series[0].data[0].value = humidity_new.toString().slice(0,6);
		app.myChart.setOption(app.option, true);
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

	loadHumidity:function(){
		require([
	                'echarts',
	                'echarts/chart/bar'
	            ],
  					
            function (ec) {
                app.myChart = ec.init(document.getElementById('main'));
                app.option = {
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
                            max:100,
				            detail : {formatter:'{value}'},
				            data:[{value: 0, name: 'RH%'}]
				        }
				    ]
				};
				app.myChart.setOption(app.option, true);
        });

    },      
};


