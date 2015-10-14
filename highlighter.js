$.highlighter = function($elt, params) {
	var $container = $("<div>").addClass("highlighter-container").css({position: "relative"});
	var $backgroundContainer = $("<div>").addClass("highlighter-background-container").css({position: "absolute", top: 0, left: 0, color: "rgba(0, 0, 0, 0)"});
	$elt.css({position: "relative", zIndex: 2});
	var $parent = $elt.parent();
	$elt.remove();
	$container.append($elt);
	$container.append($backgroundContainer);
	$parent.append($container);
	var text = $elt.text();

	$("body").append($("<div>").text(text));
	$elt.css({height: $elt.innerHeight()});
	//console.log($elt.innerHeight());

	var addHighlight = function(newHighlight) {
		if(newHighlight.endOffset - newHighlight.startOffset > 0) {
			if(obj.onBeforeHighlight(newHighlight)) {
			
				obj.highlights.push(newHighlight);
				obj.highlights = _.sortBy(obj.highlights, function(highlight) {
					return highlight.startOffset;
				});

				var currentIndex = 0;
				var tmp = [];
				_.each(obj.highlights, function(highlight) {
					if(highlight.startOffset >= currentIndex) {
						tmp.push(highlight);
						currentIndex = highlight.endOffset;
					};
				});
				obj.highlights = tmp;

				redrawHighlights();
			}
		}
		else {
			obj.highlights = _.filter(obj.highlights, function(highlight) {
				return highlight.startOffset > newHighlight.startOffset || highlight.endOffset < newHighlight.startOffset;
			});
			redrawHighlights();
		}
	};

	var nl2br = function(str, is_xhtml) {   
    	var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
    	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
	};

	var redrawHighlights = function() {
		$backgroundContainer.html("");
		var currentIndex = 0;
		_.each(obj.highlights, function(highlight) {
			if(highlight.startOffset > currentIndex) {
				$backgroundContainer.append($("<span>").html(nl2br(text.substring(currentIndex, highlight.startOffset))));		
			}
			$backgroundContainer.append($("<span>").html(nl2br(text.substring(highlight.startOffset, highlight.endOffset))).css({background: obj.color}));
			currentIndex = highlight.endOffset;
		});
	};

	


	var obj = {
		highlights: [],
		$elt: $elt,
		onBeforeHighlight: function(range) {
			return true;
		},
		getHighLights: function() {
			return obj.highlights;
		},
		color: "red"
	};
	if(params.highlights) {
		_.each(params.highlights, function(highlight) {
			addHighlight(highlight);
		});
	}
	if(params.onBeforeHighlight)  obj.onBeforeHighlight = params.onBeforeHighlight;
	if(params.color)  obj.color = params.color;

	$elt.mouseup(function(event) {
		/*var wsel = window.getSelection();
		addHighlight({
			startOffset: wsel.baseOffset,
			endOffset: wsel.extentOffset
		});*/
		addHighlight({
			startOffset: $elt[0].selectionStart,
			endOffset: $elt[0].selectionEnd
		});

		window.getSelection().removeAllRanges();

		console.log("ohhho");
	});
	

	redrawHighlights();
	return obj;
};