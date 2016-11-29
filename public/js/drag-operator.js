var dragOperator = (function($, window, document){
	var wrappers, handles;

	var CursorCtrl = {
		x: 0,
		y: 0,
		getPos: function(e) {
			if (!e) {
	      e = window.event;
	    }

			if (e.type == 'mousemove' || e.type == 'mousedown') {
				this.setData(e);
			} else if (e.touches) {
				this.setData(e.touches[0]);
			}
		},
		setData: function(e) {
			var prevX = this.x;
			var prevY = this.y;

			if(e.clientX || e.clientY) {
				this.x = e.clientX;
				this.y = e.clientY;
			} else if (e.pageX || e.pageY) {
				this.x = e.pageX - document.body.scrollLeft - document.documentElement.scrollLeft;
				this.y = e.pageY - document.body.scrollTop - document.documentElement.scrollTop;
			}

			this.disX = Math.abs(this.x - prevX);
			this.disY = Math.abs(this.y - prevY);
		}
	}

	var DragCtrl = {

		init: function() {
			this.isDrag = false;
			this.currentTarget = null;
			this.rangeX = 90; // max distance
			this.targetDraggingPosX = 0;
		},

		setElements: function(wrapper_name, handle_name) {
			this.wrappers = $(wrapper_name);
			this.handles = $(wrapper_name + ' ' +  handle_name);
			
			/*
			this.wrappers = document.getElementsByClassName('drag-wrapper');
			this.handles = [];

			for(var i=0; i < a.length; i++) {
				this.handles.push(a[i].getElementsByClassName('grid-tiles'));
			}*/

			if(this.wrappers.length != 0){
				this.bindEventListeners();
			}
		},

		bindEventListeners: function() {
			/*
			// Start dragging
			this.handles.bind('mousedown', this.onMouseDown.bind(this));
			this.handles.bind('touchstart', this.onMouseDown.bind(this));
			// While dragging
			$(document).bind('mousemove', this.onMouseMove.bind(this));
			this.wrappers.bind('touchmove', this.onMouseMove.bind(this));
			// End dragging
			$(document).bind('mouseup', this.onMouseUp.bind(this));
			$(document).bind('touchend', this.onMouseUp.bind(this));*/

			for(var i = 0; i < this.handles.length; i ++) {
				this.handles[i].addEventListener('mousedown', this.onMouseDown.bind(this));
				this.handles[i].addEventListener('touchstart', this.onMouseDown.bind(this));
			}

			$(document)[0].addEventListener('mousemove', this.onMouseMove.bind(this));

			for(i = 0; i < this.wrappers.length; i ++) {
				this.wrappers[i].addEventListener('touchmove', this.onMouseMove.bind(this));
			}

			$(document)[0].addEventListener('mouseup', this.onMouseUp.bind(this));
			$(document)[0].addEventListener('touchend', this.onMouseUp.bind(this));
		},

		unbindEventListeners: function() {
			this.handles.unbind('mousedown', this.onMouseDown.bind(this));
			this.handles.unbind('touchstart', this.onMouseDown.bind(this));
			$(document).unbind('mousemove', this.onMouseMove.bind(this));
			this.wrappers.unbind('touchmove', this.onMouseMove.bind(this));
			$(document).unbind('mouseup', this.onMouseUp.bind(this));
			$(document).unbind('touchend', this.onMouseUp.bind(this));
		},

		onMouseDown: function(e) {
			CursorCtrl.getPos(e);

			this.currentTarget = e.currentTarget;

			if($(this.currentTarget).parent().hasClass('command-both')) {
				this.targetDirection = 'both';
			} else if($(this.currentTarget).parent().hasClass('command-left')) {
				this.targetDirection = 'left'
			} else if($(this.currentTarget).parent().hasClass('command-right')) {
				this.targetDirection = 'right'
			}
			
			this.startDrag();
		},

		onMouseMove: function(e) {
			if(this.isDrag) {
				CursorCtrl.getPos(e);
				this.updateTargetPos();
			}
		},

		onMouseUp: function(e) {
			this.stopDrag();
		},

		startDrag: function() {

			this.startPos = {x:CursorCtrl.x, y:CursorCtrl.y};
			this.isDrag = true;
		},

		stopDrag: function() {
			this.isDrag = false;

			if(this.targetDraggingPosX >= this.rangeX) {
				id = $(this.currentTarget).attr('data-id');
				this.callbackFunc('right', id);
			}else if(this.targetDraggingPosX <= -this.rangeX) {
				id = $(this.currentTarget).attr('data-id');
				this.callbackFunc('left', id);
			}

			this.setTargetPos(0);
			this.currentTarget = null;
		},

		updateTargetPos: function() {

			var posX = CursorCtrl.x - this.startPos.x;

			if(posX < 0 && this.targetDirection == 'left') {
				posX = 0;
			}else if(posX > 0 && this.targetDirection == 'right') {
				posX = 0;
			}else if(posX < -this.rangeX && (this.targetDirection == 'both' || this.targetDirection == 'right')) {
				posX = -this.rangeX;
			}else if(posX > this.rangeX) {
				posX = this.rangeX;
			}

			this.setTargetPos(posX);
		},

		setTargetPos: function(posX) {
			this.targetDraggingPosX = posX;

			$(this.currentTarget).css({
				'-ms-transform'	: 'translateX(' + posX +'px)',
				'-webkit-transform': 'translateX(' + posX +'px)',
				'transform': 'translateX(' + posX +'px)',
			});

			

			if(this.targetDraggingPosX > 0) {
				var svg = $(this.currentTarget).parent().find('.song-add-symbol svg');

				if(svg.length == 0) {
					svg = $(this.currentTarget).parent().find('.song-next-symbol svg');
				}

				var scale = (this.targetDraggingPosX / this.rangeX / 3) + 1;

				$(svg).css({
					'-ms-transform'	: 'scale(' + scale +')',
					'-webkit-transform': 'scale(' + scale +')',
					'transform': 'scale(' + scale +')',
				});
			} else if (this.targetDraggingPosX < 0) {
				var svg = $(this.currentTarget).parent().find('.song-delete-symbol svg');

				var scale = (this.targetDraggingPosX / this.rangeX / 3 * -1) + 1;

				$(svg).css({
					'-ms-transform'	: 'scale(' + scale +')',
					'-webkit-transform': 'scale(' + scale +')',
					'transform': 'scale(' + scale +')',
				});
			}
		},

		setCallbackFunc: function(func) {
			this.callbackFunc = func;
		}
	}

	DragCtrl.init();

	return {
		updateElements: function(wrapper_name, handle_name) {
			DragCtrl.setElements(wrapper_name, handle_name);
		},

		setCallbackFunc: function(func) {
			DragCtrl.setCallbackFunc(func);
		}
	}
})(jQuery, window, document);