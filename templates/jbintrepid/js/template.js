
jQuery(document).ready(function(){
	
	// --------------
	// Select Menu
	// --------------
	
	jQuery("<select />").appendTo("#mobilemenu");
	var mobileMenuTitle = jQuery("#mobilemenu").attr("title");
	// Create default option "Go to..."
	jQuery("<option />", {
	   "selected": "selected",
	   "value"   : "",
	   "text"    : mobileMenuTitle
	}).appendTo("#mobilemenu select");

	// Populate dropdown with menu items
	jQuery("#nav ul.menu>li>a, #nav ul.menu>li>span.mainlevel,#nav ul.menu>li>span.separator").each(function() {
	 var el = jQuery(this);
	 jQuery("<option />", {
	     "value"   : el.attr("href"),
	     "text"    : el.text()
	     
	 }).appendTo("#mobilemenu select");
	getSubMenu(el);
	});

	function getSubMenu(el){
		var subMenu = jQuery('~ ul>li>a',el);
		var tab = "- ";
		if (!(subMenu.length === 0)){
			subMenu.each(function(){
				var sel = jQuery(this);
				var nodeval = tab + sel.text();
				 jQuery("<option />", {
				     "value"   : sel.attr("href"),
				     "text"    : nodeval

				 }).appendTo("#mobilemenu select");
				getSubMenu(sel);
			});
		}
	}

	// To make dropdown actually work
	// To make more unobtrusive: http://css-tricks.com/4064-unobtrusive-page-changer/
	jQuery("#mobilemenu select").change(function() {
		window.location = jQuery(this).find("option:selected").val();
	});

	jQuery('ul li:first-child').addClass('firstchild');
	jQuery('ul li:last-child').addClass('lastchild');
		
	
	// --------------
	// Variables for search and equal heights
	// -------------
	
	var images = jQuery('#shadow').imagesLoaded();
	var searchtoggle = "#searchtoggle";
	var searchdiv = "#searchCol";
	
	
	// --------------
	// Breakpoints
	// --------------
	
	jQuery(window).setBreakpoints({
	// use only largest available vs use all available
	    distinct: true, 
	// array of widths in pixels where breakpoints
	// should be triggered
	    breakpoints: [
			550,
	        620,
			770,
	        800,
	        960
	    ] 
	});
	
	// --------------
	// 550px
	// --------------
	
	jQuery(window).bind('enterBreakpoint550',function() {
		jQuery("#left").css("height", "auto");
		jQuery("#right").css("height", "auto");
		jQuery("#search .button").show();
		if(jQuery("#jbtabbedArea").length == 1)  {
			jQuery("#search .button").fadeIn();
			jQuery("#mod_search_searchword").css({"width": "250px"});
		}

		jQuery(searchdiv).addClass('searchoverlay').fadeOut();
	});
	
	
	// --------------
	// 620px
	// --------------
	
	jQuery(window).bind('enterBreakpoint620',function() {
		jQuery("#left").css("height", "auto");
		jQuery("#right").css("height", "auto");
		jQuery("#search .button").show();
		if(jQuery("#jbtabbedArea").length == 1)  {
			jQuery("#search .button").fadeIn();
			jQuery("#mod_search_searchword").css({"width": "450px"});
		}
		
		if (!jQuery(searchdiv).hasClass("searchoverlay")) {		
			jQuery(searchdiv).addClass('searchoverlay');
		}
		
		jQuery(searchdiv).addClass('searchoverlay').fadeOut();
		
		jQuery("#grid1 img").css({"height": "auto"});
		
	});
	
	
	// --------------
	// 770
	// --------------
	
	jQuery(window).bind('enterBreakpoint770',function() {
		jQuery(searchdiv).addClass('searchoverlay').fadeOut();
	});
	
	
	// --------------
	// 800
	// --------------
	
	jQuery(window).bind('enterBreakpoint800',function() {
		jQuery("#mobilemodule").hide();
		jQuery(searchdiv).removeClass('searchoverlay').fadeIn();
		

		images.done( function( $images ){
			jQuery("#left").css("height", "auto");
			jQuery("#right").css("height", "auto");
			
			var left = jQuery("#left").height();
			var right = jQuery("#right").height();
			var midCol = jQuery("#midCol").height();

			if (left < midCol){
				jQuery("#left").css("height", midCol);
			}
			
			if (right < midCol){
				jQuery("#right").css("height", midCol);
			}
			
			if((jQuery("#grid1").length == 1) && (jQuery("#grid4").length == 1))  	{
				var grid4 = jQuery("#grid4").height();
				jQuery("#grid1 img").height(grid4);
			}
		});	
		
		if(jQuery("#jbtabbedArea").length == 1)  	{
			
			jQuery("#mod_search_searchword").css({"width": "150px"});
			
			if((jQuery("#left").length == 1) && (jQuery("#left").width() < 250)) {
				jQuery("#search .button").hide();
				jQuery("#mod_search_searchword").css({"width": "24%"})
			}
			
			if((jQuery("#right").length == 1) && (jQuery("#right").width() < 250)) {
				jQuery("#search .button").hide();
				jQuery("#mod_search_searchword").css({"width": "24%"})
			}
		}
		
		// Trigger equal heights on some link triggers
		jQuery("a,span").click(
			function() {
				jQuery("#left").css("height", "auto");
				jQuery("#right").css("height", "auto");

				var left = jQuery("#left").height();
				var right = jQuery("#right").height();
				var midCol = jQuery("#midCol").height();

				if (left < midCol){
					jQuery("#left").css("height", midCol);
				}

				if (right < midCol){
					jQuery("#right").css("height", midCol);
				}
			});
			
				if((jQuery("#left").width() < 240) && (jQuery("#jbtabbedArea").length == 1)) {
					jQuery("#search .button").hide();
				}
	});
	
	// --------------
	// 960
	// --------------
	
	jQuery(window).bind('enterBreakpoint960',function() {
		jQuery(searchdiv).fadeIn();
		
		
		jQuery("#mobilemodule").hide();
		
	
		images.done(function( $images ){
			jQuery("#left").css("height", "auto");
			jQuery("#right").css("height", "auto");
			
			var left = jQuery("#left").height();
			var right = jQuery("#right").height();
			var midCol = jQuery("#midCol").height();

			if (left < midCol){
				jQuery("#left").css("height", midCol);
			}
			
			if (right < midCol){
				jQuery("#right").css("height", midCol);
			}
			
			if((jQuery("#grid1").length == 1) && (jQuery("#grid4").length == 1))  	{
				var grid4 = jQuery("#grid4").height();
				jQuery("#grid1 img").height(grid4);
			}
		});
		
		if(jQuery("#jbtabbedArea").length == 1)  	{
			
			jQuery("#mod_search_searchword").css({"width": "150px"});
			
			if((jQuery("#left").length == 1) && (jQuery("#left").width() < 250)) {
				jQuery("#search .button").hide();
				jQuery("#mod_search_searchword").css({"width": "24%"})
			}
			
			if((jQuery("#right").length == 1) && (jQuery("#right").width() < 250)) {
				jQuery("#search .button").hide();
				jQuery("#mod_search_searchword").css({"width": "24%"})
			}
		}
		

		if((jQuery("#left").width() < 240) && (jQuery("#jbtabbedArea").length == 1)) {
			jQuery("#search .button").hide();
		}
		
		jQuery(searchdiv).removeClass('searchoverlay');
		
		// Trigger equal heights on some link triggers
		jQuery("a,span").click(
			function() {
				jQuery("#left").css("height", "auto");
				jQuery("#right").css("height", "auto");

				var left = jQuery("#left").height();
				var right = jQuery("#right").height();
				var midCol = jQuery("#midCol").height();

				if (left < midCol){
					jQuery("#left").css("height", midCol);
				}

				if (right < midCol){
					jQuery("#right").css("height", midCol);
				}
			});
	
	});
	
	// --------------
	// Search toggle
	// --------------
	
	jQuery(searchtoggle).click(
		function(event) {
			event.preventDefault();
			jQuery(searchdiv).fadeToggle().toggleClass('searchopen');
		}
	);
	
	
	
	// --------------
	// Mobile Search Toggle
	// --------------
	
	jQuery("#searchtogglemobile").click(
		function(event) {
			event.preventDefault();
			jQuery("#mobilemodule").fadeToggle();
		}
	);
	
	
	
});