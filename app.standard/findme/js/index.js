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

var position;
var app = {

  device: {},
  safety_value: -60,
  unsafety_value: -80,
  isFirstTime: true,
  antiLostIsOpen: true,
  safetyAlarmIsOpen: false,
  isFirstConnect: true,
  stateModel:0,
  reconnected:false,
  setPictureModel:true,

  initialize: function() {

    var H=window.innerHeight;
    document.body.style.height=H+"px";
    var containerH=document.getElementsByClassName("container")[0];
    var prophotoH=document.getElementsByClassName("prophoto")[0];
    var serviceH=document.getElementsByClassName("service")[0];

    var diff=H-containerH.offsetHeight-prophotoH.offsetHeight;
    containerH.style.marginTop=Math.abs(diff*1/100)+"px";
    prophotoH.style.marginTop=Math.abs(diff*6/100)+"px"
    serviceH.style.marginTop=Math.abs(diff*16/100)+"px";

    if (localStorage.getItem('isFirstTime')) {
      app.isFirstTime = localStorage.getItem('isFirstTime') == 'true' ? true : false;
    }
    if (localStorage.getItem('imageData')) {
      $('.photoImg').css("display", "block").children("img").attr('src', "data:image/jpeg;base64," + localStorage.getItem('imageData'));
      $('.activePic>img').attr('src', "data:image/jpeg;base64," + localStorage.getItem('imageData'));
      $(".activePic").css("display", "block");
    }
    if (localStorage.getItem('itemName')) {
      $('#proName').html(localStorage.getItem('itemName'));
      $('.name').html(localStorage.getItem('itemName'));
    }
    if (localStorage.getItem('antiLostIsOpen')) {
      app.antiLostIsOpen = localStorage.getItem('antiLostIsOpen') == 'true' ? true : false;
    }
    if (localStorage.getItem('safetyAlarmIsOpen')) {
      app.safetyAlarmIsOpen = localStorage['safetyAlarmIsOpen'] == 'true' ? true : false;
    }
    if (localStorage.getItem('position')) {
      position = JSON.parse(localStorage.getItem('position'));
    }

    if (localStorage.getItem('unsafety_value')) {
      $('.rangeText').html(localStorage.getItem('unsafety_value'));
      app.unsafety_value = parseInt(localStorage.getItem('unsafety_value'));
      app.safety_value = app.unsafety_value > -20 ? -1 : app.unsafety_value + 20;
    }

    if (app.isFirstTime) {
      $('#homeDiv').css({
        'display': 'none'
      });
      $('#setPhotoDiv').css({
        'display': 'block'
      });
      localStorage.setItem('antiLostIsOpen', app.antiLostIsOpen);
      localStorage.setItem('safetyAlarmIsOpen', app.safetyAlarmIsOpen);
    } else {
      $('#setPhotoDiv').css({
        'display': 'none'
      });
      $('#homeDiv').css({
        'display': 'block'
      });
    }
    if (app.antiLostIsOpen) {
      $('#antiLost').attr('src', 'img/antiLost_on.png');
      $('#antiLost').siblings('span').html('Anti Lost On');
    } else {
      $('#antiLost').attr('src', 'img/antiLost_off.png');
      $('#antiLost').siblings('span').html('Anti Lost Off');
    }
    app.bindCordovaEvents();
    app.bindUIEvents();
  },

  bindCordovaEvents: function() {
    document.addEventListener('deviceready', app.onDeviceReady, false);
    document.addEventListener('bcready', app.onBCReady, false);
  },

  onDeviceReady: function() {
    var BC = window.BC = cordova.require("org.bluetooth.profile.proximity");
    var BC = window.BC = cordova.require("org.bluetooth.profile.find_me");
    var BCCamera = window.BCCamera = cordova.require("org.bcsphere.camera.camera");
    var Camera = window.Camera = cordova.require("org.apache.cordova.camera.camera");
    var CameraPopoverOptions = window.CameraPopoverOptions = cordova.require("org.apache.cordova.camera.CameraPopoverOptions");
    var Geolocation = window.Geolocation = cordova.require("org.apache.cordova.geolocation.geolocation");
    var Telephony = window.Telephony = cordova.require("org.bcsphere.telephony.telephony");
    navigator.notification = cordova.require('org.apache.cordova.dialogs.notification');

    app.proximityProfile = new BC.ProximityProfile();
    app.findmeProfile = new BC.FindMeProfile();

    BCCamera.onCameraClose(function(){
        app.stateModel = 0;
    });
  },

  onBCReady: function() {
    app.device = new BC.Device({
      deviceAddress: DEVICEADDRESS,
      isConnected: false,
      type: DEVICETYPE
    });
    app.device.addEventListener("deviceconnected", app.onDeviceConnected);
    app.device.addEventListener("devicedisconnected", app.onBluetoothDisconnect);
    if (!app.isFirstTime) {
      app.connect();
    }
  },


  bindUIEvents: function() {

    $('.rangeText').html(app.unsafety_value);
    $('#range').val(app.unsafety_value);

    $('#photoborder').click(function() {
      var options = {
        'quality': 75,
        'destinationType': Camera.DestinationType.DATA_URL,
        'sourceType': Camera.PictureSourceType.CAMERA,
        'allowEdit': true,
        'encodingType': Camera.EncodingType.JPEG,
        'popoverOptions': CameraPopoverOptions,
        'saveToPhotoAlbum': false
      };
      Camera.getPicture(function(imageData) {
        var image = $('#photoImg').css("display", "block").children("img");
        image.attr('src', "data:image/jpeg;base64," + imageData);
        localStorage.setItem('imageData', imageData);
      }, function(message) {
        console.log(JSON.stringify(message));
      }, options);
    });

    $('#photoNext').click(function() {
      $('#setPhotoDiv').css({
        'display': 'none'
      });
      $('#setNameDiv').css({
        'display': 'block'
      });
    });

    $('#photoSkip').click(function() {
      localStorage.removeItem('imageData');
      app.isFirstTime = false;
      localStorage.setItem('isFirstTime', app.isFirstTime);
      $('#homeDiv').css({
        'display': 'block'
      });
      $('#setPhotoDiv').css({
        'display': 'none'
      });
      $('#setNameDiv').css({
        'display': 'none'
      });
      app.connect();
    });

    $('#lastNext').click(function() {
      var itemName = $('#itemName').val();
      if (itemName == "") {
        return;
      } else {
        if(itemName.length>10){
          itemName = itemName.substring(0,10)+'...';
        }
        $('#proName').html(itemName);
        $('.name').html(itemName);
        localStorage.setItem('itemName', itemName);
      }
      if (localStorage.getItem('imageData')) {
        $('.photoImg').css("display", "block").children("img").attr('src', "data:image/jpeg;base64," + localStorage.getItem('imageData'));
        $('.activePic>img').attr('src', "data:image/jpeg;base64," + localStorage.getItem('imageData'));
        $(".activePic").css("display", "block");
      }
      app.isFirstTime = false;
      localStorage.setItem('isFirstTime', app.isFirstTime);
      app.connect();
      $('#setNameDiv').css({
        'display': 'none'
      });
      $('#homeDiv').css({
        'display': 'block'
      });
    });

    $('#getPosition').click(function(event) {
      $(this).attr('src', 'img/position.png');
      if (position) {
        if (position.latitude && position.longitude) {
          window.location.href = 'http://api.map.baidu.com/geocoder?location='+position.latitude+','+position.longitude+'&output=html&coord_type=wgs84';
          // window.location.href = 'http://mo.amap.com/?q=' + position.latitude + ',' + position.longitude + '&dev=1';
          // window.location.href = 'javascript:setInterval(function(){console.log(1);var fis_elm_pager__qk_1 = document.getElementById("fis_elm_pager__qk_1");if(fis_elm_pager__qk_1){fis_elm_pager__qk_1.style.display="none"}},1000);';
        }
      } else {
        Geolocation.getCurrentPosition(function(data) {
          localStorage.setItem('position',JSON.stringify(data.coords));
          position = data.coords;
          window.location.href = 'http://api.map.baidu.com/geocoder?location='+position.latitude+','+position.longitude+'&output=html&coord_type=wgs84';
          // window.location.href = 'javascript:setInterval(function(){console.log(1);var fis_elm_pager__qk_1 = document.getElementById("fis_elm_pager__qk_1");if(fis_elm_pager__qk_1){fis_elm_pager__qk_1.style.display="none"}},1000);';
        }, function(message) {
          console.log(JSON.stringify(message));
        });
      }
    });

    document.getElementById('getPosition').addEventListener('touchstart', function() {
      //var img = new Image();
      this.src = "img/position_active.png";
      // var that = this;
      // img.onload = function() {
      //   that.src = this.src;
      //   this.onload = null;
      // }
    }, false);

    document.getElementById('getPosition').addEventListener('touchend', function() {
      this.src = "img/position.png";
    }, false);


    $('#callIt').click(function(event) {
      $(this).attr('src', 'img/call_it.png');
      app.findmeProfile.high_alert(app.device);
    });

    document.getElementById('callIt').addEventListener('touchstart', function() {
      //var img = new Image();
      this.src = "img/call_it_active.png";
      // var that = this;
      // img.onload = function() {
      //   that.src = this.src;
      //   this.onload = null;
      // }
    }, false);

    document.getElementById('callIt').addEventListener('touchend', function() {
      this.src = "img/call_it.png";
    }, false);

    $('#take').click(function(event) {
      if(app.stateModel==1){
        navigator.notification.stopBeep();
      }
      BCCamera.takePicture(function() {
          app.stateModel = 2;
      },function(msg){
          console.log('openCamera  '+msg);
      },1);
    });

    // $('#antiLost').on('click',function(event) {
    //   event.stopPropagation();
    //   if ($(this).attr('src') == 'img/antiLost_off.png') {
    //     app.antiLostOn();
    //   } else {
    //     app.antiLostOff();
    //   }
    // });
  
    $('#antiLost').parent()[0].addEventListener('touchstart',function(event){
       event.preventDefault();
    },false);

    document.getElementById('antiLost').addEventListener('touchstart',function(event){
       event.stopPropagation();
       event.preventDefault();
    },false);

    document.getElementById('antiLost').addEventListener('touchend',function(event){
       if ($('#antiLost').attr('src') == 'img/antiLost_off.png') {
        app.antiLostOn();
      } else {
        app.antiLostOff();
      }
    },false);

    $('#settings').click(function(event) {
      var storage = localStorage;

      if (storage['antiLostIsOpen']) {
        if (storage['antiLostIsOpen'] == 'true') {
          localStorage.setItem('defend', true);
        } else {
          localStorage.removeItem('defend');
        }
      }

      if (storage['safetyAlarmIsOpen']) {
        if (storage['safetyAlarmIsOpen'] == 'true') {
          localStorage.setItem('sda', true);
          $('#range').removeAttr('disabled');
        } else {
          localStorage.removeItem('sda');
          $('#range').attr('disabled', 'disabled');
        }
      }

      var arr = ["defend", "sda"];
      for (var i = 0; i < arr.length; i++) {
        var oP = $("span[item=" + arr[i] + "]")
        if (storage[arr[i]]) {
          oP.children(".ball").css("left", "2.1375em");
          oP.children(".open").css({
            "opacity": 1,
            "left": "0"
          });
        } else {
          oP.children(".ball").css("left", "0");
          oP.children(".open").css({
            "opacity": 0,
            "left": "-2.17em"
          });
        }
      }
      $('#setNameDiv').css({
        'display': 'none'
      });
      $('#setPhotoDiv').css({
        'display': 'none'
      });
      $('#homeDiv').css({
        'display': 'none'
      });
      $("body").addClass("bodybackground");
      $('.settings')[0].style.display = "block";
    });

    $('.goback').click(function() {
      $('.settings')[0].style.display = "none";
      $("body").removeClass("bodybackground");
      $('#homeDiv').css({
        'display': 'block'
      });
    });

    $('#phopic').click(function() {
      app.setPictureModel = true;
      var options = {
        'quality': 75,
        'destinationType': Camera.DestinationType.DATA_URL,
        'sourceType': Camera.PictureSourceType.CAMERA,
        'allowEdit': true,
        'encodingType': Camera.EncodingType.JPEG,
        'popoverOptions': CameraPopoverOptions,
        'saveToPhotoAlbum': false
      };
      Camera.getPicture(function(imageData) {
        $('.activePic>img').attr('src', "data:image/jpeg;base64," + imageData);
        $(".activePic").css("display", "block");
        $('.photoImg').css("display", "block").children("img").attr('src', "data:image/jpeg;base64," + imageData);
        localStorage.setItem('imageData', imageData);
        app.setPictureModel = false;
      }, function(message) {
        app.setPictureModel = false;
        console.log(JSON.stringify(message));
      }, options);
    });

    $('#name').click(function() {
      if (localStorage.getItem('itemName')) {
        $('#item_name').attr('placeholder', localStorage.getItem('itemName'));
      }
      $('#editNameLayer').addClass('editNameLayerblock');
    });

    $('.cancel').click(function() {
      $('#editNameLayer').removeClass('editNameLayerblock');
    });

    $('.confirm').click(function() {
      var itemName = $('#item_name').val();
      if (itemName == "") {
        return;
      } else {
        if(itemName.length>10){
          itemName = itemName.substring(0,10)+'...';
        }
        $('.name').html(itemName);
        $('#proName').html(itemName);
        localStorage.setItem('itemName', itemName);
      }
      $('#editNameLayer').removeClass('editNameLayerblock');
    });

    $(".close").click(function() {
      var oP = $(this).parent();
      var item = oP.attr('item');
      if (item == 'defend') {
        app.antiLostOn();

      }
      if (item == 'sda') {
        app.safetyAlarmOn();
      }
      if (!oP.children(".ball").is(":animated")) {
        localStorage.setItem($(this).parent().attr("item"), true);
        oP.children(".open").css("opacity", 1).animate({
          left: 0
        }, 100);
        oP.children(".ball").animate({
          left: "2.1375em"
        }, 90);
      }
    })

    $(".open").click(function() {
      var oP = $(this).parent();
      var item = oP.attr('item');
      if (item == 'defend') {
        app.antiLostOff();
      }
      if (item == 'sda') {
        app.safetyAlarmOff();
      }
      if (!oP.children(".ball").is(":animated")) {
        localStorage.removeItem($(this).parent().attr("item"));
        oP.children(".open").animate({
          left: "-2.17em"
        }, 100, function() {
          this.style.opacity = 0;
        });
        oP.children(".ball").animate({
          left: 0
        }, 90);
      }
    })

    $(".ball").click(function() {
      if (!$(this).is(":animated")) {
        var oP = $(this).parent();
        var item = oP.attr("item");
        if (!localStorage[item]) {
          if (item == 'defend') {
            app.antiLostOn();
          }
          if (item == 'sda') {
            app.safetyAlarmOn();
          }
          localStorage.setItem(item, true);
          oP.children(".open").css("opacity", 1).animate({
            left: 0
          }, 100);
          $(this).animate({
            left: "2.1375em"
          }, 90);
        } else {
          if (item == 'defend') {
            app.antiLostOff();
          }
          if (item == 'sda') {
            app.safetyAlarmOff();
          }
          localStorage.removeItem(item);
          oP.children(".open").animate({
            left: "-2.1375em"
          }, 100, function() {
            this.style.opacity = 0;
          });
          $(this).animate({
            left: "0"
          }, 90);
        }
      }
    });

    var range = document.getElementById('range');
    range.addEventListener("touchmove", function() {
      $('.rangeText').html(this.value);
    }, false);
    range.addEventListener('touchend', function() {
      $('.rangeText').html(this.value);
      app.safety_value = parseInt(this.value) > -20 ? -1 : parseInt(this.value) + 20;
      app.unsafety_value = parseInt(this.value);
      localStorage.setItem('unsafety_value', this.value);
      app.proximityProfile.clearPathLoss();
      app.proximityProfile.onPathLoss(app.device, app.safety_value, app.unsafety_value, app.farAwayFunc, app.safetyZone_func, app.closeToFunc);
    }, false);
  },

  antiLostOn: function() {
    app.antiLostIsOpen = true;
    app.proximityProfile.onLinkLoss(app.device);
    $('#antiLost').attr('src', 'img/antiLost_on.png');
    $('#antiLost').siblings('span').html('Anti Lost On');
    localStorage.setItem('antiLostIsOpen', app.antiLostIsOpen);
  },

  antiLostOff: function() {
    app.antiLostIsOpen = false;
    app.proximityProfile.clearLinkLoss(app.device);
    $('#antiLost').attr('src', 'img/antiLost_off.png');
    $('#antiLost').siblings('span').html('Anti Lost Off');
    localStorage.setItem('antiLostIsOpen', app.antiLostIsOpen);
  },

  safetyAlarmOn: function() {
    app.safetyAlarmIsOpen = true;
    localStorage.setItem('safetyAlarmIsOpen', app.safetyAlarmIsOpen);
    $('#range').removeAttr('disabled');
  },

  safetyAlarmOff: function() {
    app.safetyAlarmIsOpen = false;
    navigator.notification.stopBeep();
    app.findmeProfile.no_alert(app.device);
    localStorage.setItem('safetyAlarmIsOpen', app.safetyAlarmIsOpen);
    $('#range').attr('disabled', 'disabled');
  },

  onBluetoothStateChange: function() {
    if (BC.bluetooth.isopen) {
      if (app.device != null && !app.device.isConnected) {
        app.connect();
      }
    } else {
      app.clearConnectInterVal();
    }
  },

  onBluetoothDisconnect: function(arg) {
    app.setDescription('lost connection', 'lost', 'Lost');
    app.proximityProfile.clearPathLoss();
    navigator.notification.stopBeep();
    app.reconnected = true;
    app.connect();
  },

  onDeviceConnected: function(arg) {
    var deviceAddress = arg.deviceAddress;
  },

  onDeviceDisconnected: function() {
    app.proximityProfile.clearPathLoss();
    navigator.notification.stopBeep();
  },

  connect: function() {
    var connectTimmer = 5000;
    if (app.isFirstConnect) {
      connectTimmer = 2000;
    } else {
      connectTimmer = 5000;
    }
    app.interval_connect = window.setInterval(function() {
      $('.connectStatus').css('display','block');
      app.device.connect(app.connectSuccess, function() {
        app.proximityProfile.clearPathLoss();
        navigator.notification.stopBeep();
      });
    }, connectTimmer);
    app.isFirstConnect = false;
  },

  clearConnectInterVal: function() {
    if (app.interval_connect) {
      window.clearInterval(app.interval_connect);
    }
  },

  connectSuccess: function() {
    app.clearConnectInterVal();
    $('.connectStatus').css('display','none');
    if(app.reconnected){
      // app.findmeProfile.high_alert(app.device);
      setTimeout(function(){
        app.findmeProfile.no_alert(app.device);
      },200);
      app.reconnected = false;
    }
    Telephony.callsReminding(function(data) {
      app.findmeProfile.high_alert(app.device);
    }, function() {
      console.log('callsReminding error');
    });
    app.device.discoverServices(function() {
      var service = app.device.getServiceByUUID("ffe0")[0];
      service.discoverCharacteristics(function() {
        var characteristic = service.characteristics[0];
        characteristic.subscribe(app.onNotify);
      }, function() {});
      if (app.antiLostIsOpen) {
        app.proximityProfile.onLinkLoss(app.device);
      }
      app.proximityProfile.onPathLoss(app.device, app.safety_value, app.unsafety_value, app.farAwayFunc, app.safetyZone_func, app.closeToFunc);
    });
  },

  farAwayFunc: function() {
    app.setDescription('away from safe area', 'warning', 'Warning');
    app.updateRSSI(arguments[0]);
    if (app.safetyAlarmIsOpen) {
      navigator.notification.beep();
      app.findmeProfile.high_alert(app.device);
      Geolocation.getCurrentPosition(function(data) {
        position = data.coords;
        localStorage.setItem('position', JSON.stringify(data.coords));
      });
    }
  },

  safetyZone_func: function() {
    app.setDescription('in safe area');
    app.updateRSSI(arguments[0]);
    if (app.safetyAlarmIsOpen) {
      navigator.notification.stopBeep();
      app.findmeProfile.no_alert(app.device);
    }
  },

  closeToFunc: function() {
    app.setDescription('in safe area');
    app.updateRSSI(arguments[0]);
    if (app.safetyAlarmIsOpen) {
      navigator.notification.stopBeep();
      app.findmeProfile.no_alert(app.device);
    }
  },

  updateRSSI: function(data) {
    //alert(data);
  },

  onNotify: function(data) {
    var value = data.value.getHexString();
    if(app.stateModel==1){
      app.stateModel = 0;
      navigator.notification.stopBeep();
      return;
    }
    if (value == "20") {
      if(app.stateModel==0 && !app.setPictureModel){
        app.stateModel = 2;
      }
    } else if (value == "01") {
      if(app.stateModel == 0){
        app.stateModel = 1;
        navigator.notification.beep();
      }
    }

    if(app.stateModel == 2){
      BCCamera.takePicture(function() {
        app.isCameraOpen = false;
      },null,1);
    }

  },



  setDescription: function(description, state, tip) {
    console.log(description + "    " + state + "    " + tip);
    $('#description').html(description);
    $('#photomask').removeClass().addClass('photomask').addClass('photoMaskZindex').addClass(state);
    $('#photomask').children('span').html(tip);
  },

};