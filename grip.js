define(['jQuery'], function(){
	var grip = function(view, model, populatedHTML) {
		var grips = {root: $(populatedHTML)};
		//also exclude grips that belong to a group, they'll get gripped later.
		grips.root.find('[data-grip],[data-group]').andSelf().not('[data-group] [data-grip]').each(function() {
			var gripName = $(this).attr('data-grip');
			//exclude the root element if it doesn't have data-grip attribute
			if ($(this).attr('data-grip')) {
				//if grips item already exists, add it to collection of grips
				if (grips[$(this).attr('data-grip')]) {
					grips[$(this).attr('data-grip')] = grips[$(this).attr('data-grip')].add($(this));
				}
				//otherwise set it to the single grip
				else {
					grips[$(this).attr('data-grip')] = $(this);
				}
			}
			//add group to the grips
			else if ($(this).attr('data-group')) {
				grips[$(this).attr('data-group')] = $(this);
			}

			//databinding from the grips (input elements) to the model
			if ($(this).is('input, textarea, select')) {
				var inputEvent = 'change'; //todo add others?
				//var inputEvent = options.inputEvents[key] || 'change';
				$(this).bind(inputEvent, function(){
					//call the custom input function if it exists
					if (typeof view[gripName + 'Input'] === 'function'){
						//use custom input function
						view[gripName + 'Input']($(this).val());
					}
					else{
						//set the model object directly
						var obj = {};
						obj[gripName] = $(this).val();
						model.set(obj);
					}
				});
			}

			//databinding from the model to the grips
			(function(gripElem){
				model.bind('change:' + gripName, function() {
					var updatedFunc = gripName + "Updated";
					//call the custom updater if there is one
					if (typeof view[gripName + "Updated"] === 'function') {
						//custom view updater
						view[updatedFunc]();
					}
					else {
						//set the value based on the element type
						_setGrip(gripElem, model.get(gripName));
					}
				});
			}($(this)));
		});
		return grips;
	};

	function _setGrip(grip, value, as) {
		//todo if grip points to multiple DOM elements, they may need to be updated separatly if different element types
		//todo support setting attributes like css, class, etc
		if (grip.is('input, textarea')) {
			//input fields
			grip.val(value);
		}
		else {
			//everything else (divs, spans, headers, etc)
			var attributeToChange = as || 'text';
			grip[attributeToChange](value);
		}
	}

	return grip;
});