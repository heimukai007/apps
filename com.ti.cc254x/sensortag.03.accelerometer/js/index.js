var app = {
	device: {},

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
				var service = app.device.getServiceByUUID("F000AA10-0451-4000-B000-000000000000")[0];
				service.discoverCharacteristics(function(){
					var character1 = service.getCharacteristicByUUID("F000AA11-0451-4000-B000-000000000000")[0];
					var character2 = service.getCharacteristicByUUID("F000AA12-0451-4000-B000-000000000000")[0];
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
			app.option.series[0].data[0].value = 0;
			app.option.series[1].data[0].value = 0;
			app.option.series[2].data[0].value = 0;
			app.myChart.setOption(app.option, true);
		},function(){
			console.log("disconnect error");
		});
	},

	onNotify:function(buffer){
		console.log("Notify");
		var temp=buffer.value.getHexString();
		var aX=app.str2val(temp,1,2);
		var aY=app.str2val(temp,3,4)/256;
		var aZ=app.str2val(temp,5,6);
		aX= 1*aX/64;
		aY= 1*aY/64;
		aZ= 1*aZ/64;	
		app.option.series[0].data[0].value = aX.toFixed(2);
        app.option.series[1].data[0].value = aY.toFixed(2);
        app.option.series[2].data[0].value = aZ.toFixed(2);
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
                    tooltip: {
                        show: true
                    },
                    legend: {
                        data:['x','y','z']
                    },
                    xAxis : [
                        {
                            type : 'category',
                            data : ["accelerometer"]
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value',
                            name : 'G m/s²'
                        }
                    ],
                   series : [
                        {
                            name:"x",
                            type:"bar",
                            itemStyle : { normal: {label : {show: true, position: 'top'}}},
                            data:[{value: 0}]

                        },
                        {
                            name:"y",
                            type:"bar",
                            itemStyle : { normal: {label : {show: true, position: 'top'}}},
                            data:[{value: 0}]
                        },
                        {
                            name:"z",
                            type:"bar",
                            itemStyle : { normal: {label : {show: true, position: 'top'}}},
                            data:[{value: 0}]
                        },
                    ] 
                };
				app.myChart.setOption(app.option, true);
        });

    },      
};


