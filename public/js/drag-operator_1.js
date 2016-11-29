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
			this.rangeX = 80;
			this.targetDraggingPosX = 0;
			this.handles = null;
			this.wrappers = null;
		},

		setElements: function(wrapper_name, handle_name) {
			if(this.wrappers){
				this.unbindEventListeners();
			}

			this.handles = null;
			this.wrappers = null;

			this.wrappers = $(wrapper_name);
			this.handles = $(wrapper_name + ' ' +  handle_name);

			if(this.wrappers.length != 0){
				this.bindEventListeners();
			}
		},

		bindEventListeners: function() {
			for(var i = 0; i < this.handles.length; i ++) {
				$(this.handles[i]).bind('mousedown', this.onMouseDown.bind(this));
				$(this.handles[i]).bind('touchstart', this.onMouseDown.bind(this));
			}

			$(document).bind('mousemove', this.onMouseMove.bind(this));

			for(i = 0; i < this.wrappers.length; i ++) {
				$(this.wrappers[i]).bind('touchmove', this.onMouseMove.bind(this));
			}

			$(document).bind('mouseup', this.onMouseUp.bind(this));
			$(document).bind('touchend', this.onMouseUp.bind(this));
		},

		unbindEventListeners: function() {
			
			for(var i = 0; i < this.handles.length; i ++) {
				$(this.handles[i]).unbind('mousedown', this.onMouseDown.bind(this));
				$(this.handles[i]).unbind('touchstart', this.onMouseDown.bind(this));
			}

			$(document).unbind('mousemove', this.onMouseMove.bind(this));

			for(i = 0; i < this.wrappers.length; i ++) {
				$(this.wrappers[i]).unbind('touchmove', this.onMouseMove.bind(this));
			}

			$(document).unbind('mouseup', this.onMouseUp.bind(this));
			$(document).unbind('touchend', this.onMouseUp.bind(this));
		},

		onMouseDown: function(e) {
			CursorCtrl.getPos(e);

			this.currentTarget = e.currentTarget;

			if($(this.currentTarget).parent().hasClass('command-both')) {
				this.targetDirection = 'both';
			} else {
				this.targetDirection = 'left'
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
			}else if(posX < -this.rangeX && this.targetDirection == 'both') {
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