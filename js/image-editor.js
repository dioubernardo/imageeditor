var imageEditor = {
	canvas: null,
	context: null,
	data: null,
	history: [],
	limitUndo: 10,
	loadImagesOnCenter: true,
	jcropAPI: null,
	selecting: false,
	msgFileError: 'Formato de imagem não suportado',
	o: null,
	init: function(selector, allowDrop){
		this.o = $(selector).css({
			position: 'relative'
		});
		
		this.canvas = $('<canvas />').attr({
			width: this.o.innerWidth()+'px', 
			height: this.o.innerHeight()+'px' 
		}).appendTo(this.o).get(0);

		this.context = this.canvas.getContext('2d');
		
		var i = this;
		
		$('<div />').width(this.o.innerWidth()).height(this.o.innerHeight()).css({
			position: 'absolute',
			left:0,
			top:0
		}).appendTo(this.o).Jcrop({
			bgOpacity: 1,
			onRelease: function(){
				i.disableSelect();
			}
		}, function(){
			i.jcropAPI = this;
			i.jcropAPI.disable();
			i.o.find('.jcrop-holder').css({
				position: 'absolute',
				left: 0,
				top: 0,
				backgroundColor: 'transparent'
			}).hide();
		});

		if (allowDrop !== false){
			this.o.bind({
				dragover: function(e){
					e.preventDefault();
				},
				drop: function(e){
					e.preventDefault();
					i.o.removeClass('dropFile');
					if (e.originalEvent.dataTransfer.files.length > 0)
						i.load(e.originalEvent.dataTransfer.files[0]);
				},
				dragenter: function(){
					i.o.addClass('dropFile');
				},
				dragleave: function(){
					i.o.removeClass('dropFile');
				}
			});
		}
		
		$(document).keypress(function(e){
			if (!e.altKey && !e.shiftKey && e.ctrlKey && e.keyCode == 26){
				i.undo();
				e.stopPropagation();
			}
		}).keyup(function(e){
			if (i.selecting){
				var sel = i.jcropAPI.tellSelect();
				if (sel.w > 0 && sel.h > 0 && e.keyCode == 46){
					i.clear(sel.x, sel.y, sel.w, sel.h);
					e.stopPropagation();
				}
			}
		});
	},
	load: function(src){
		var i = this;
		if (typeof src == 'string'){
			this.clear();
			var imageObj = new Image();
			imageObj.onload = function(){
				var width, height;
				if (imageObj.width > i.canvas.width || imageObj.height > i.canvas.height){
					width = i.canvas.width;
					height = i.canvas.height;
					var ratio = imageObj.width / imageObj.height;
					if (width/height > ratio)
					   width = height*ratio;
					else
					   height = width/ratio;
				}else{
					width = imageObj.width;
					height = imageObj.height;
				}
				var dx = i.loadImagesOnCenter ? (i.canvas.width-width)/2 : 0;
				var dy = i.loadImagesOnCenter ? (i.canvas.height-height)/2 : 0;
				i.context.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height, dx, dy, width, height);
			};
			imageObj.onerror = function(){
				alert(i.msgFileError);
			};
			imageObj.src = src;
		}else{
			var reader = new FileReader();
			reader.onload = function (event){
				i.load(event.target.result);
			};
			reader.readAsDataURL(src);				
		}
	},
	clear: function(x, y, w ,h){
		this.putToUndo();
		if (typeof x == 'undefined')
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		else
			this.context.clearRect(x, y, w, h);
	},
	clearSelection: function(){
		if (this.selecting){
			var sel = this.jcropAPI.tellSelect();
			this.clear(sel.x, sel.y, sel.w, sel.h);
		}else{
			this.clear();
		}
	},
	undo: function(){
		if (this.history.length > 0)
			this.context.putImageData(this.history.pop(), 0, 0);
	},			
	putToUndo: function(){
		var imgd = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		this.history.push(imgd);
		if (this.history > this.limitUndo)
			this.history.shift();
	},
	_floodFillNotContinuo: function(x, y, t, color){
		/* Global vars */
		var imgd = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		var data = imgd.data;
		
		var p = ((y*this.canvas.width)+x)*4;
		var target = {r: data[p], g: data[p+1], b: data[p+2], a: data[p+3]};		
		var len = data.length;
		
		for(p=0;p<len; p=p+4){
			if(
				Math.abs(target.r-data[p]) > t || 
				Math.abs(target.g-data[p+1]) > t ||
				Math.abs(target.b-data[p+2]) > t ||
				Math.abs(target.b-data[p+3]) > t
			)
				continue;
			
			data[p] = color.r;
			data[p+1] = color.g;
			data[p+2] = color.b;
			data[p+3] = color.a;
		}
		this.context.putImageData(imgd, 0, 0);
		
	},
	floodFill: function(x, y, t, continuo, color){
		this.putToUndo();

		if (typeof color == 'undefined')
			color = {r:0, g:0, b:0, a:0};
		
		if (continuo === false)
			return this._floodFillNotContinuo(x, y, t, color);
		
		/* Global vars */
		var imgd = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		var data = imgd.data;
		var width = this.canvas.width;
		var maxX = width-1;
		var maxY = this.canvas.height-1;
		var visitados = [];
		var itens = [];

		/* Fill function */
		var fillPixel = function(d){
			var p = ((d.y*width)+d.x)*4; 
			if (visitados[p] === true)
				return;
			visitados[p] = true;

			if(
				Math.abs(d.r-data[p]) > t || 
				Math.abs(d.g-data[p+1]) > t ||
				Math.abs(d.b-data[p+2]) > t ||
				Math.abs(d.b-data[p+3]) > t
			)
				return;

			var r = data[p], g = data[p+1], b = data[p+2], a = data[p+3]; 
			
			data[p] = color.r;
			data[p+1] = color.g;
			data[p+2] = color.b;
			data[p+3] = color.a;

			if (d.x < maxX)
				itens.push({r: r, g: g, b: b, a: a, x: d.x+1, y: d.y});
			if (d.x > 0)
				itens.push({r: r, g: g, b: b, a: a, x: d.x-1, y: d.y});
			if (d.y < maxY)
				itens.push({r: r, g: g, b: b, a: a, x: d.x, y: d.y+1});
			if (d.y > 0)
				itens.push({r: r, g: g, b: b, a: a, x: d.x, y: d.y-1});
		};

		var p = ((y*this.canvas.width)+x)*4;
		fillPixel({r: data[p], g: data[p+1], b: data[p+2], a: data[p+3], x: x, y: y});
		while(itens.length > 0)
			fillPixel(itens.pop());
		this.context.putImageData(imgd, 0, 0);
	},
	getData: function(crop){
		if (crop === false)
			return this.canvas.toDataURL();
			
		var imgd = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		var data = imgd.data;
		var width = this.canvas.width;
		
		var emptyXY = function(x, y){
			var p = ((y*width)+x)*4;
			return data[p+3] == 0;
		};
		var emptyYX = function(y, x){
			return emptyXY(x, y);
		};
		
		var fx = function(xi, xm, ai, am, fx, fa, fe){
			for (var x=xi; x!=xm; x=x+fx){
				for(var a=ai;a!=am;a=a+fa){
					if (!fe(x, a))
						return x;
				}
			}
		};
		
		var maxX = width-1, maxY = this.canvas.height-1;
		var minX = fx(0, maxX, 0, maxY, 1, 1, emptyXY);
		var minY = fx(0, maxY, 0, maxX, 1, 1, emptyYX);
		maxX = fx(maxX, minX, maxY, minY, -1, -1, emptyXY)+1;
		maxY = fx(maxY, minY, maxX, minX, -1, -1, emptyYX)+1;
		
		var canvas = $('<canvas />').attr({
			width: (maxX-minX)+'px', 
			height: (maxY-minY)+'px'
		}).get(0);
		
		var imgcrop = this.context.getImageData(minX, minY, maxX, maxY);
		var context = canvas.getContext('2d');
		context.putImageData(imgcrop, 0, 0);
		return canvas.toDataURL();
	},
	enableSelect: function(){
		this.disableClickAndDelete();
		this.jcropAPI.enable();
		this.jcropAPI.release();
		this.o.find('.jcrop-holder').show();
		this.selecting = true;
	},
	disableSelect: function(){
		this.o.find('.jcrop-holder').hide();
		this.selecting = false;
	},
	enableClickAndDelete: function(options){
		var i = this;
		this.disableSelect();
		this.o.find('canvas').unbind('click').bind('click', function(e){
			i.disableClickAndDelete();
			var offset = i.o.offset(); 
			i.floodFill(parseInt(e.pageX - offset.left), parseInt(e.pageY - offset.top), $(options.selectorTolerance).val(), $(options.selectorContinuo).is(':checked'));
		}).css('cursor', 'crosshair');
	},
	disableClickAndDelete: function(){
		this.o.find('canvas').unbind('click').css('cursor', 'default');
	}
};