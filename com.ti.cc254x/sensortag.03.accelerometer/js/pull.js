	var myScroll,
		pullDownEl, pullDownOffset,
		generatedCount = 0;

	var count=0;

	function pullDownAction () {
		count++;
		if(count%2==0){
			app.disconnect();
			myScroll.refresh();	
		}else{
			app.connect();
			myScroll.refresh();	
		}
			
	}

	function loaded() {
		pullDownEl = document.getElementById('pullDown');
		pullDownOffset = pullDownEl.offsetHeight;	
		
		myScroll = new iScroll('wrapper', {
			useTransition: true,
			topOffset: 0,
			onRefresh: function () {
				if (pullDownEl.className.match('loading')) {
					pullDownEl.className = '';
					pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down...';
				} 
			},
			onScrollMove: function () {
				if (this.y > 5 && !pullDownEl.className.match('flip')) {
					pullDownEl.className = 'flip';
					if(count%2==0){
						pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to connect...';
					}
					if(count%2==1){
						pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to disconnect...';
					}
					this.minScrollY = 0;
				} else if (this.y < 5 && pullDownEl.className.match('flip')) {
					pullDownEl.className = '';
					if(count%2==0){
						pullDownEl.querySelector('.pullDownLabel').innerHTML = ' Pull down to connect...';
					}
					if(count%2==1){
						pullDownEl.querySelector('.pullDownLabel').innerHTML = ' Pull down to disconnect...';
					}
					this.minScrollY = 0//-pullDownOffset;
				} 
			},
			onScrollEnd: function () {
				if (pullDownEl.className.match('flip')) {
					pullDownEl.className = 'loading';
					if(count%2==0){
						pullDownEl.querySelector('.pullDownLabel').innerHTML = 'be connecting...';	
					}
					if(count%2==1){
						pullDownEl.querySelector('.pullDownLabel').innerHTML = 'be disconnecting...';	
					}
								
					pullDownAction();	
				}
			}
		});
		
		setTimeout(function () { document.getElementById('wrapper').style.left = '0'; }, 800);
	}

	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

	document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);