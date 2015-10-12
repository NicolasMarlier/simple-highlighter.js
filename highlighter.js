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

	var redrawHighlights = function() {
		$backgroundContainer.html("");
		var currentIndex = 0;
		_.each(obj.highlights, function(highlight) {
			if(highlight.startOffset > currentIndex) {
				$backgroundContainer.append($("<span>").html(text.substring(currentIndex, highlight.startOffset)));		
			}
			$backgroundContainer.append($("<span>").html(text.substring(highlight.startOffset, highlight.endOffset)).css({background: obj.color}));
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
		var wsel = window.getSelection();
		addHighlight({
			startOffset: wsel.baseOffset,
			endOffset: wsel.extentOffset
		});
		window.getSelection().removeAllRanges()
	});
	

	redrawHighlights();
	return obj;
};