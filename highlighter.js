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
			
				if(obj.onlyWords) {
					while(newHighlight.startOffset > 0 && /\S/m.test(text[newHighlight.startOffset - 1])) {
						newHighlight.startOffset -= 1;
					}
					while(newHighlight.endOffset < text.length && /\S/m.test(text[newHighlight.endOffset])) {
						newHighlight.endOffset += 1;
					}
				}
				if(obj.singleHighlight) {
					obj.highlights = [];
				}
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

				obj.onChange();
				obj.onAfterHighlight(newHighlight);
			}
		}
		else {
			obj.highlights = _.filter(obj.highlights, function(highlight) {
				return highlight.startOffset > newHighlight.startOffset || highlight.endOffset < newHighlight.startOffset;
			});
			obj.onChange();
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
		onWords: false,
		singleHighlight: false,
		onBeforeHighlight: function(range) {
			return true;
		},
		onAfterHighlight: function(range) {
			
		},
		onChange: function() {

		},
		getHighLights: function() {
			return obj.highlights;
		},
		getData: function() {
			return _.map(obj.highlights, function(highlight) {
				return {
					startOffset: highlight.startOffset,
					endOffset: highlight.endOffset,
					text: text.substring(highlight.startOffset, highlight.endOffset)
				};
			});
		},
		color: "red",
		text: text

	};
	if(params.onlyWords)  obj.onlyWords = params.onlyWords;
	if(params.singleHighlight)  obj.singleHighlight = params.singleHighlight;
	if(params.onBeforeHighlight)  obj.onBeforeHighlight = params.onBeforeHighlight;
	if(params.onAfterHighlight)  obj.onAfterHighlight = params.onAfterHighlight;
	if(params.onChange)  obj.onChange = params.onChange;
	if(params.color)  obj.color = params.color;
	if(params.highlights) {
		_.each(params.highlights, function(highlight) {
			addHighlight(highlight);
		});
		obj.onChange();
	}
	

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
	});
	

	redrawHighlights();
	return obj;
};