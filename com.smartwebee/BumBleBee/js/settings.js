var storage=localStorage;
var arr=["defend","sda"];
$(function(){
	for(var i=0;i<arr.length;i++){
		if(storage[arr[i]]){
			var oP=$("span[item="+arr[i]+"]")
			oP.children(".ball").css("left","2.1375em");
			oP.children(".open").css({"opacity":1,"left":"0"});
		}
	}
})
//settings click bind event
$(".ball").click(function(){
	console.log($(this).is(":animated"));
	if(!$(this).is(":animated")){
		var oP=$(this).parent();
		var item=oP.attr("item");
		if(!localStorage[item]){
			localStorage.setItem(item,true);
			oP.children(".open").css("opacity",1).animate({left:0},100);
			$(this).animate({left:"2.1375em"},90);
		}else{
			localStorage.removeItem(item,false);
			oP.children(".open").animate({left:"-2.1375em"},100,function(){
				this.style.opacity=0;
			});
			$(this).animate({left:"0"},90);
		}
	}
})
$(".close").click(function(){
	var oP=$(this).parent();
	if(!oP.children(".ball").is(":animated")){
		localStorage.setItem($(this).parent().attr("item"),true);
		oP.children(".open").css("opacity",1).animate({left:0},100);
		oP.children(".ball").animate({left:"2.1375em"},90);
	}

})
$(".open").click(function(){
	var oP=$(this).parent();
	if(!oP.children(".ball").is(":animated")){
		localStorage.removeItem($(this).parent().attr("item"));
		oP.children(".open").animate({left:"-2.17em"},100,function(){
			this.style.opacity=0;
		});
		oP.children(".ball").animate({left:0},90);
	}
})
