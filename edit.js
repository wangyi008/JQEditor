function JQTextEditor(divId,prop) {
	this.div = $("#" + divId);
	this.init();
	prop=prop||{};
	this.prop=prop;
	this.isGroup=this.prop.isGroup||false;
	if(this.isGroup){
		this.groupProp=prop.groupProp||"group";
	}
	this.fontSize=prop.fontSize||"22px";
	this.valueProp=prop.valueProp||"value";
	this.id=guid();
	$(this.div).append($("<div class='row'>" +
							"<div class='col-xs-1 line_number' style='font-size:"+this.fontSize+";width:150px;'>命令行：</div>" +
							"<div class='col-xs-11'>" +
								"<span id='"+this.id+"' style='font-size:"+this.fontSize+";'></span>" +
							"</div>" +
						"</div>"));
	// 模板
	this.rowDiv = $("<div class='row row_div'>" +
						"<div class='col-xs-1 line_number' style='font-size:"+this.fontSize+";width:80px;'></div>" +
						"<div class='col-xs-11'><input type='text' style='border:0;font-size:"+this.fontSize+";' class='form-control text_area'></div>" +
					"</div>");
	this.groupDiv=$("<div class='row group'></div>");
	this.deleteKeyCount=0;
}
JQTextEditor.prototype.type = "JQTextEditor";
JQTextEditor.prototype.init = function() {
	// 产生代码输入框
	//this.div.attr("contenteditable", "true");
	this.div.css("border", "1");
}
// 设置值
JQTextEditor.prototype.setValues = function(values) {
	var rowDiv = this.rowDiv;
	var div = this.div;
	var prop=this.prop;
	var thzz=this;
	var g_index=0;
	$(values).each(function(i, value) {
		if(thzz.isGroup){
			$(value[thzz.groupProp]).each(function(i,v){
				g_index++;
				var row = $(rowDiv).clone();
				$(row).find("div.line_number").html(g_index);
				$(row).find("input.text_area").val(v[thzz.valueProp]);
				for(var p in v){
					if(p!=thzz.valueProp){					
						$(row).find("input.text_area").attr(p,v[p]);
					}
				}
				$(div).append($(row));
			})
		}else{			
			var row = $(rowDiv).clone();
			$(row).find("div.line_number").html(i + 1);
			$(row).find("input.text_area").val(value[thzz.valueProp]);
			for(var p in value){
				if(p!=thzz.valueProp){					
					$(row).find("input.text_area").attr(p,value[p]);
				}
			}
			$(div).append($(row));
		}
	})
	$(div).on({
		keyup:function(e) {
			enter_pressed(e,this);
		},
		mouseup:function(e){
			if(typeof prop.textAreaMouseUp == 'function'){				
				prop.textAreaMouseUp(e,this);		
			}
		},
		mousedown:function(e){
			if(typeof prop.textAreaMouseDown == 'function'){				
				prop.textAreaMouseDown(e,this);		
			}
		},
		click:function(e){
			if(typeof prop.textAreaMouseClick == 'function'){	
				prop.textAreaMouseClick(e,this);		
			}
		},
		change:function(e){
			if(typeof prop.textAreaChange == 'function'){	
				prop.textAreaChange(e,this);		
			}
			changeTextAreaWidth(e,this);
		}
	}, "input.text_area", {thiz:this});
}
function changeTextAreaWidth(e,src){
	var hidden=$("#"+e.data.thiz.id);
	hidden.text($(src).val());
	//parseInt($(src).css("fontSize"))/parseInt(hidden.css("fontSize"))
	var wLen=parseInt(hidden[0].offsetWidth)*parseInt($(src).css("fontSize"))/parseInt(hidden.css("fontSize"));
	var ow=parseInt($(src).css("width"));
	if(wLen<(ow-40)){
		return;
	}
	var i=0;
	while(wLen>(ow-40)){
		i++;
		hidden.text($(src).val().substring(0,$(src).val().length-i));
		wLen=parseInt(hidden[0].offsetWidth)*parseInt($(src).css("fontSize"))/parseInt(hidden.css("fontSize"));
	}
	
	e.keyCode=13;
	src.selectionStart=$(src).val().length-i;
	src.selectionEnd=$(src).val().length-i;
	enter_pressed(e,src);
}
function enter_pressed(e,src) {
	var div=e.data.thiz.div;
	if (e.keyCode == 13) {
		var start=src.selectionStart
		var additem = $(src).parents("div.row_div").clone();
		$(additem).find("input.text_area").val($(src).val().substring(start));
		$(additem).insertAfter($(src).parents(".row_div"));
		$(src).val($(src).val().substring(0,start));
		// 重排序号
		$(div).find("div.row_div div.line_number").each(function(i, e) {
			$(e).html(i + 1);
		});
		$(additem).find("input.text_area").focus();
	}else if(e.keyCode == 38){//上
		$(div).find("div.row_div input:focus").parents("div.row_div").prev().find("input").focus();
	}else if(e.keyCode == 40){//下
		$(div).find("div.row_div input:focus").parents("div.row_div").next().find("input").focus();		
	}else if(e.keyCode == 37){//左
		if(src.selectionStart==0){			
			$(div).find("div.row_div input:focus").parents("div.row_div").prev().find("input").focus();
		}
	}else if(e.keyCode == 39){//右
		if(src.selectionStart==$(src).val().length){			
			$(div).find("div.row_div input:focus").parents("div.row_div").next().find("input").focus();
		}
	}else if(e.keyCode == 8){//右
		
		if(src.selectionStart==0){
			e.data.thiz.deleteKeyCount++;
			if(e.data.thiz.deleteKeyCount>1){
				var prev=$(div).find("div.row_div input:focus").parents("div.row_div").prev().find("input");
				$(prev).val($(prev).val()+$(src).val().substring(src.selectionStart)).focus();
				$(src).parents("div.row_div").remove();
				e.data.thiz.deleteKeyCount=0;
				// 重排序号
				$(div).find("div.row_div div.line_number").each(function(i, e) {
					$(e).html(i + 1);
				});
			}
		}
		changeTextAreaWidth(e,src);
	}else{
		changeTextAreaWidth(e,src);
	}
	console.log("keycode:"+e.keyCode);
}

function guid() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
