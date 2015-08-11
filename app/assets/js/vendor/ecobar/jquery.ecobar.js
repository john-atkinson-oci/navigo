// NGA Ecosystem Bar - NGA Interactive Design Division (XDI)
// ecobar.js  Stand Alone Version: 3.7
// Instructions:  https://webcop.nga.mil


// Retrieve JSON file with settings and data

var randomNum = Math.ceil(Math.random() * 999999);
var jsContentFile = 'assets/js/vendor/ecobar/ecobar.content.js?v=' + randomNum;

jQuery.ajaxSetup({
    async: false
});

var ecobarContent;
jQuery.getJSON(jsContentFile, function(json) {
    ecobarContent = json;
});

jQuery.ajaxSetup({
    async: true
});



// Declare load Source Variables

	var ecobar_theme = "white"
	var	ecobar_files = "assets/js/vendor/ecobar/ecobar/"
	var	ecobar_feedback = "assets/js/vendor/ecobar/feedback/"
	var	ecobar_search = "assets/js/vendor/ecobar/search/"
	var	ecobar_location = "assets/js/vendor/ecobar/location/"
	var	ecobar_iae= "assets/js/vendor/ecobar/iae/"
	var	ecobar_messages= "assets/js/vendor/ecobar/messages/"


// Dynamically load required JS and CSS

function loadjscssfile(filename, filetype){
 if (filetype=="js"){ //if filename is a external JavaScript file
  var fileref=document.createElement('script')
  fileref.setAttribute("type","text/javascript")
  fileref.setAttribute("src", filename)
 }
 else if (filetype=="css"){ //if filename is an external CSS file
  var fileref=document.createElement("link")
  fileref.setAttribute("rel", "stylesheet")
  fileref.setAttribute("type", "text/css")
  fileref.setAttribute("href", filename)
 }
 if (typeof fileref!="undefined")
  document.getElementsByTagName("head")[0].appendChild(fileref)
}

loadjscssfile("" + ecobar_files + "js/modernizr.custom.js", "js") //dynamically load and add this .js file
loadjscssfile("" + ecobar_files + "css/ecobar.css", "css") ////dynamically load and add this .css file


// Based on TinyBox2 for javascript only modal and modified by XDI
TINY={};

TINY.box=function(){
	var j,m,b,g,v,p=0;
	return{
		show:function(o){
			v={opacity:70,close:1,animate:1,fixed:1,mask:1,maskid:'',boxid:'',topsplit:2,url:0,post:0,height:0,width:0,html:0,iframe:0};
			for(s in o){v[s]=o[s]}
			if(!p){
				j=document.createElement('div'); j.className='tbox';
				p=document.createElement('div'); p.className='tinner';
				b=document.createElement('div'); b.className='tcontent';
				m=document.createElement('div'); m.className='tmask';
				g=document.createElement('div'); g.className='tclose'; g.v=0;
				document.body.appendChild(m); document.body.appendChild(j); j.appendChild(p); p.appendChild(b);
				m.onclick=g.onclick=TINY.box.hide; window.onresize=TINY.box.resize
			}else{
				j.style.display='none'; clearTimeout(p.ah); if(g.v){p.removeChild(g); g.v=0}
			}
			p.id=v.boxid; m.id=v.maskid; j.style.position=v.fixed?'fixed':'absolute';
			if(v.html&&!v.animate){
				p.style.backgroundImage='none'; b.innerHTML=v.html; b.style.display='';
				p.style.width=v.width?v.width+'px':'auto'; p.style.height=v.height?v.height+'px':'auto'
			}else{
				b.style.display='none';
				if(!v.animate&&v.width&&v.height){
					p.style.width=v.width+'px'; p.style.height=v.height+'px'
				}else{
					p.style.width=p.style.height='100px'
				}
			}
			if(v.mask){this.mask(); this.alpha(m,1,v.opacity)}else{this.alpha(j,1,100)}
			if(v.autohide){p.ah=setTimeout(TINY.box.hide,1000*v.autohide)}else{document.onkeyup=TINY.box.esc}
		},
		fill:function(c,u,k,a,w,h){
			if(u){
				if(v.image){
					var i=new Image(); i.onload=function(){w=w||i.width; h=h||i.height; TINY.box.psh(i,a,w,h)}; i.src=v.image
				}else if(v.iframe){
					this.psh('<iframe src="'+v.iframe+'" width="'+v.width+'" scrolling="auto" frameborder="0" height="'+v.height+'"></iframe>',a,w,h)
				}else{
					var x=window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject('Microsoft.XMLHTTP');
					x.onreadystatechange=function(){
						if(x.readyState==4&&x.status==200){p.style.backgroundImage=''; TINY.box.psh(x.responseText,a,w,h)}
					};
					if(k){
    	            	x.open('POST',c,true); x.setRequestHeader('Content-type','application/x-www-form-urlencoded'); x.send(k)
					}else{
       	         		x.open('GET',c,true); x.send(null)
					}
				}
			}else{
				this.psh(c,a,w,h)
			}
		},
		psh:function(c,a,w,h){
			if(typeof c=='object'){b.appendChild(c)}else{b.innerHTML=c}
			var x=p.style.width, y=p.style.height;
			if(!w||!h){
				p.style.width=w?w+'px':''; p.style.height=h?h+'px':''; b.style.display='';
				if(!h){h=parseInt(b.offsetHeight)}
				if(!w){w=parseInt(b.offsetWidth)}
				b.style.display='none'
			}
			p.style.width=x; p.style.height=y;
			this.size(w,h,a)
		},
		esc:function(e){e=e||window.event; if(e.keyCode==27){TINY.box.hide()}},
		hide:function(){TINY.box.alpha(j,-1,0,3); document.onkeypress=null; if(v.closejs){v.closejs()}},
		resize:function(){TINY.box.pos(); TINY.box.mask()},
		mask:function(){m.style.height=this.total(1)+'px'; m.style.width=this.total(0)+'px'},
		pos:function(){
			var t;
			if(typeof v.top!='undefined'){t=v.top}else{t=(this.height()/v.topsplit)-(j.offsetHeight/2); t=t<20?20:t}
			if(!v.fixed&&!v.top){t+=this.top()}
			j.style.top=t+'px';
			j.style.left=typeof v.left!='undefined'?v.left+'px':(this.width()/2)-(j.offsetWidth/2)+'px'
		},
		alpha:function(e,d,a){
			clearInterval(e.ai);
			if(d){e.style.opacity=0; e.style.filter='alpha(opacity=0)'; e.style.display='block'; TINY.box.pos()}
			e.ai=setInterval(function(){TINY.box.ta(e,a,d)},20)
		},
		ta:function(e,a,d){
			var o=Math.round(e.style.opacity*100);
			if(o==a){
				clearInterval(e.ai);
				if(d==-1){
					e.style.display='none';
					e==j?TINY.box.alpha(m,-1,0,2):b.innerHTML=p.style.backgroundImage=''
				}else{
					if(e==m){
						this.alpha(j,1,100)
					}else{
						j.style.filter='';
						TINY.box.fill(v.html||v.url,v.url||v.iframe||v.image,v.post,v.animate,v.width,v.height)
					}
				}
			}else{
				var n=a-Math.floor(Math.abs(a-o)*.5)*d;
				e.style.opacity=n/100; e.style.filter='alpha(opacity='+n+')'
			}
		},
		size:function(w,h,a){
			if(a){
				clearInterval(p.si); var wd=parseInt(p.style.width)>w?-1:1, hd=parseInt(p.style.height)>h?-1:1;
				p.si=setInterval(function(){TINY.box.ts(w,wd,h,hd)},20)
			}else{
				p.style.backgroundImage='none'; if(v.close){p.appendChild(g); g.v=1}
				p.style.width=w+'px'; p.style.height=h+'px'; b.style.display=''; this.pos();
				if(v.openjs){v.openjs()}
			}
		},
		ts:function(w,wd,h,hd){
			var cw=parseInt(p.style.width), ch=parseInt(p.style.height);
			if(cw==w&&ch==h){
				clearInterval(p.si); p.style.backgroundImage='none'; b.style.display='block'; if(v.close){p.appendChild(g); g.v=1}
				if(v.openjs){v.openjs()}
			}else{
				if(cw!=w){p.style.width=(w-Math.floor(Math.abs(w-cw)*.6)*wd)+'px'}
				if(ch!=h){p.style.height=(h-Math.floor(Math.abs(h-ch)*.6)*hd)+'px'}
				this.pos()
			}
		},
		top:function(){return document.documentElement.scrollTop||document.body.scrollTop},
		width:function(){return self.innerWidth||document.documentElement.clientWidth||document.body.clientWidth},
		height:function(){return self.innerHeight||document.documentElement.clientHeight||document.body.clientHeight},
		total:function(d){
			var b=document.body, e=document.documentElement;
			return d?Math.max(Math.max(b.scrollHeight,e.scrollHeight),Math.max(b.clientHeight,e.clientHeight)):
			Math.max(Math.max(b.scrollWidth,e.scrollWidth),Math.max(b.clientWidth,e.clientWidth))
		}
	}
}();


//  Item name: Ecobar Accordion Left Menu
;(function ( $, window, document, undefined ) {

	var pluginName = "jqueryAccordionMenu";
	var defaults = {
			speed: 300,
			showDelay: 0,
			hideDelay: 0,
			singleOpen: true,
			clickEffect: true
		};

	function Plugin ( element, options ) {
		this.element = element;
		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	};

	$.extend(Plugin.prototype, {

		init: function () {
			this.openSubmenu();
			this.submenuIndicators();
			if(this.settings.clickEffect){
				this.addClickEffect();
			}
		},

		openSubmenu: function () {
			var opts = this.settings; //to differ from local variable "this"
			$(this.element).children("ul").find("li").bind("click touchstart", function(e){
				e.stopPropagation();
				e.preventDefault();
				if($(this).children(".submenu").length > 0){
					if($(this).children(".submenu").css("display") == "none"){
						$(this).children(".submenu").delay(opts.showDelay).slideDown(opts.speed);
						$(this).children(".submenu").siblings("a").addClass("submenu-indicator-minus");
						if(opts.singleOpen){
							$(this).siblings().children(".submenu").slideUp(opts.speed);
							$(this).siblings().children(".submenu").siblings("a").removeClass("submenu-indicator-minus");
						}
						return false;
					}
					else{
						$(this).children(".submenu").delay(opts.hideDelay).slideUp(opts.speed);
					}
					if($(this).children(".submenu").siblings("a").hasClass("submenu-indicator-minus")){
						$(this).children(".submenu").siblings("a").removeClass("submenu-indicator-minus");
					}
				}
				window.location.href = $(this).children("a").attr("href");
			});
		},

		submenuIndicators: function () {
			if($(this.element).find(".submenu").length > 0){
				$(this.element).find(".submenu").siblings("a").append("<span class='submenu-indicator'>+</span>");
			}
		},

		addClickEffect: function () {
			var ink, d, x, y;
			$(this.element).find("a").bind("click touchstart", function(e){

				$(".ink").remove();

				if($(this).children(".ink").length === 0){
					$(this).prepend("<span class='ink'></span>");
				}

				ink = $(this).find(".ink");
				ink.removeClass("animate-ink");

				if(!ink.height() && !ink.width()){
					d = Math.max($(this).outerWidth(), $(this).outerHeight());
					ink.css({height: d, width: d});
				}

				x = e.pageX - $(this).offset().left - ink.width()/2;
				y = e.pageY - $(this).offset().top - ink.height()/2;

				ink.css({top: y+'px', left: x+'px'}).addClass("animate-ink");
			});
		}

	});

	$.fn[ pluginName ] = function ( options ) {
		this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
		return this;
	};

})( jQuery, window, document );


var ecobar_header_string = [
'<div class="header--fixed">',
'<div class="NGA_Bar_Top_Classification"><span id="ecobar_classification_override"></span><span id="ecobar_classification_1">Dynamic content classififed up to UNCLASSIFIED<span>',
'<span id="ecobar_classification_2"> | WARNING: This content may be used as a source of derivitive classification</span>',
'<span id="ecobar_classification_3">; refer to the pertinent classification guide: NATIONAL GEOSPATIAL-INTELLIGENCE AGENCY</span></div>',
'<div class="ecobar_container">',
'<div class="ecobar_icons_menu" id="showLeft"></div>',
'<div class="ecobar_logo"></div>',
'<div class="ecobar_icon_container_large">',

// Write Feedback
'<a href="#" onclick="TINY.box.show({iframe:\''+ ecobar_feedback + '\',width:750,height:450,fixed:false,})"><div class="ecobar_icons_feedback"></div></a>',


// Write App Laucher
'<div class="ecobar_icons_apps" id="ecobar_icons_apps_button"></div>',
'<div class="ecobar_popover_container">',
'<div class="ecobar_popover bottom in" style="left: -187px; top: 49px; display: none;" id="ecobarlauchericons">',
'<div class="arrow" style="left: 225px;"></div>',
'<h3 class="ecobar_popover-title">NGA Enterprise Tools</h3>',
'<div class="ecobar_popover-content">',
'<div class="app_launcher_container">',

// Row 1
'<div id="app_launcher_row">',
'<a href="#"><div class = "app_launcher_left app_launcher_blocks"><div class="block1"></div><br/><span class="app_launcher_blocks_text">Explore Map</span></div></a>',
'<a href="#"><div class="app_launcher_middle app_launcher_blocks"><div class="block2"></div></i><br/><span class="app_launcher_blocks_text">Foundation GEOINT</span></div></a>',
'<a href="#" onclick="TINY.box.show({iframe:\'' + ecobar_iae + '\',width:600,height:420,fixed:true})"><div class="app_launcher_right app_launcher_blocks">',
'<div class="block3"></div><br/><span class="app_launcher_blocks_text">Find Imagery</span></div></a>',
'</div>',

// Row 2
'<div id="app_launcher_row">',
'<a href="#"><div class = "app_launcher_left app_launcher_blocks"><div class="block4"></div><br/><span class="app_launcher_blocks_text">Find Data</span></div></a>',
'<a href="#"><div class = "app_launcher_middle app_launcher_blocks"><div class="block5"></div><br/><span class="app_launcher_blocks_text">Discover Apps</span></div></a>',
'<a href="#"><div class = "app_launcher_right app_launcher_blocks"><div class="block6"></div><br/><span class="app_launcher_blocks_text">Create Map</span></div></a>',
'</div>',

// Row 3
'<div id="app_launcher_row">',
'<a href="#" onclick="TINY.box.show({iframe:\'' + ecobar_iae + '\',width:600,height:420,fixed:true})" title="Analytic Workspace (AW)">',
'<div class = "app_launcher_left app_launcher_blocks"><div class="block7"></div><br/><span class="app_launcher_blocks_text">Analytic Space</span></div><a>',
'<a href="https://portal.nga.ic.gov/pages/index.html" title="GEOINT Information Management Services (GIMS)"><div class = "app_launcher_middle app_launcher_blocks">',
'<div class="block8"></div><br/><span class="app_launcher_blocks_text">Collection Request</span></div></a>',
'<a href="http://app01.ozone.nga.ic.gov/rfi_gen/admin/new" title="Request For Information"><div class = "app_launcher_right app_launcher_blocks">',
'<div class="block9"></div><br/><span class="app_launcher_blocks_text">Submit RFI</span></div></a>',
'</div>',

// Close Launcher
'</div></div></div></div>',

// Write User Laucher
'<div class="ecobar_icons_profile" id="ecobar_icons_profile_button"><span class="ecobar_icons_profile_indicator"><span class=ecobar_icons_profile_indicator_text></span></span></div>',
'<div class="ecobar_popover_container">',
'<div class="ecobar_popover bottom in" style="left: -147px; top: 49px; display: none;" id="ecobarlaucheruser">',
'<div class="arrow" style="left: 188px;"></div>',
'<div class="ecobar_popover-content" style="width: 250px">',
'<div><div class="block0"></div></div>',
'<p class="ecobar_profile_name"><strong>First Last Name</strong></p><a href="#" onclick="TINY.box.show({iframe:\'' + ecobar_messages + '\',width:600,height:420,fixed:true})"><span class="ecobar_profile_messages">3 messages</span> <span class="ecobar_profile_alerts">1 alerts</span></a>',
'</div>',
'<h3 class="ecobar_popover-title">GeoAxis User Profile</h3>',
'</div></div>',

// Write Map Laucher
'<a href="#" Title="Map of the World"><div class="ecobar_icons_map"></div></a>',

// Write Search Laucher
'<a href="#" onclick="TINY.box.show({iframe:\''+ ecobar_search +'\',width:400,height:60,close:false,})"><div class="ecobar_icons_search"></div></a>',

// Write Closing Ecobar Icon Container Large
'</div>',

// Write Closing Ecobar
'</div>',
'<div class="ecobar_bottom_shadow"></div>',
'</div>',
].join('');
jQuery('body').append(ecobar_header_string);


// Begin writing NGA Ecosystem Bar
var ecobar_leftnav_string = [
'<div id="EcobarSlideReveal"  class="EcobarSlideReveal">',
'<div class="ecobar_left_nav_spacer"></div>',
'<div id="jquery-accordion-menu" class="jquery-accordion-menu white">',
'<div class="jquery-accordion-menu-header">Enterprise Navigation</div>',

// Write Menu
'<ul>',
'<li ><a href="#"><span class="eco-icon-home span_icon"></span>Home</a></li>',
'<li><a href="#" onclick="TINY.box.show({iframe:\'' + ecobar_location + '\',width:930,height:420,fixed:true})">',
'<span class="eco-icon-map-marker span_icon"></span>Location</a></li>',

// Write Services
'<li><a href="#"><span class="eco-icon-file span_icon"></span>Services</a>',
'<ul class="submenu">',
'<li><a href="https://globe.nga.ic.gov/search/pages/contentcatalog.aspx">Content Catalog</a></li>',
'<li><a href="#">Data Services</a></li>',
'<li><a href="#">Business Services</a></li>',
'</ul></li>',

// Write Missions
'<li><a href="#"><span class="eco-icon-folder-close span_icon"></span>Missions</a>',
'<ul class="submenu">',
'<li><a href="#">Intelligence</a></li>',
'<li><a href="#">Air</a></li>',
'<li><a href="#">Land</a></li>',
'<li><a href="#">Sea</a></li>',
'<li><a href="#">Imagery</a></li>',
'<li><a href="#">Targeting Support</a></li>',
'<li><a href="#">Geodetics</a></li>',
'<li><a href="#">Human Geography</a></li>',
'<li><a href="#">Maps & Charts</a></li>',
'</ul></li>',

// Write Information
'<li><a href="#"><span class="eco-icon-info-sign span_icon"></span>Information</a>',
'<ul class="submenu">',
'<li><a href="https://globe.nga.ic.gov/Info/Pages/ContactUs.aspx">Contact Us</a></li>',
'<li><a href="https://globe.nga.ic.gov/Info/Pages/AboutNGA.aspx">About NGA</a></li>',
'<li><a href="https://betaglobe.nga.ic.gov/Info/Pages/AboutGlobe.aspx">About The Globe</a></li>',
'</ul></li>',

// Write Employee
'<li><a href="#"><span class="eco-icon-inbox span_icon"></span>Employee Resources</a>',
'<ul class="submenu">',
'<li><a href="http://home.nga.ic.gov/">NGA Intranet</a></li>',
'<li><a href="http://news.nga.ic.gov/">Peoplesoft</a></li>',
'<li><a href="http://home.nga.ic.gov/orgchart.cfm">NGA Organizations</a></li>',
'<li><a href="https://globe.nga.ic.gov/Info/Pages/ClassificationManagement.aspx">Classification Mgmt</a></li>',
'<li><a href="http://college.nga.ic.gov/htbin/td/dbman/ngc.cgi?db=ngc">NGA Training</a></li>',
'</ul></li>',

// Write Cytrix
'<li><a href="https://mydesktop.nga.ic.gov/vpn/index.html"><span class="eco-icon-briefcase span_icon"></span>Citrix Login</a></li>',

//Close Menu
'</ul>',
'</div>',
'</div>',
].join('');
jQuery('body').append(ecobar_leftnav_string);

// Write Padding for Fixed Header
jQuery('body')
        .prepend("<div class='content-header-padding'></div>");

// Initiate Left Navigation
jQuery(document).ready(function(){
			jQuery("#jquery-accordion-menu").jqueryAccordionMenu();
			});

// Initiate Hamburger Menu and dropdowns
$(document).ready(function(){
    $("#showLeft").click(function(){
        $("#EcobarSlideReveal").animate({width: 'toggle'});
        $(this).toggleClass("active"); //return false;

		$("#ecobarlaucheruser").fadeOut("fast");
		$("#ecobarlauchericons").fadeOut("fast");
    });

	 $("#ecobar_icons_apps_button").click(function(){
        $("#ecobarlauchericons").fadeToggle("fast");
		$("#ecobarlaucheruser").fadeOut("fast");
    });

	 $("#ecobar_icons_profile_button").click(function(){
        $("#ecobarlaucheruser").fadeToggle("fast");
		$("#ecobarlauchericons").fadeOut("fast");
    });

// Indicator

	$(".ecobar_icons_profile_indicator_text").replaceWith(" 4 ");
});