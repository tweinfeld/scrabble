define(["jquery", "underscore", "backbone"], function ($, _, Backbone) {
    return Backbone.View.extend({
        className: "letter",
        options: {
            view: null
        },
        render: function(){
            var _this = this;
            this.$el.addClass(this.className).draggable({
                addClasses: false,
                helper: "original",
                start: function(event, ui){
                    var view = _this.options.view;
                    view && (function(){ view.$el.droppable('option', 'disabled', false); _this.options.view = null; })();
                    ui.helper.stop(true,true).css({ zIndex: 20 }).rotate({ animateTo: 0 });
                },
                stop: function(event, ui){
                    var view = _this.options.view;
                    if(!view){
                        ui.helper.animate({ left: _this.model.get('left'), top: _this.model.get('top') + _this.model.get('y_offset') },{ duration: 500, complete: function(){ $(this).css({ zIndex: 1 }); }}).rotate({ animateTo: _this.model.get('rotation') });
                    } else {
                        var offset = view.$el.position();
                        ui.helper.animate({ left: offset.left + 4, top: offset.top + 5 }, { duration: 200, complete: function(){ $(this).css({ zIndex: 1 }); } });
                    }
                }
            }).data('view', _this);

            this.update();
            return this;
        },
        lock: function(state){
            this.$el.draggable('option', 'disabled', state);
        },
        drop: function(view){
            this.options.view = view;
            this.$el.hide().show();
            this.$el.trigger('track_event', { category: "game", action: "letter_drop", label: this.model.get('value') });
        },
        release: function(){
            this.options.view = null;
            this.$el.hide().show();
        },
        update: function(){
            this.$el
                .text(this.model.get('value').toUpperCase())
                .css({ left: this.model.get('left'), top: this.model.get('top') + this.model.get('y_offset') })
                .rotate(this.model.get('rotation'));
        },
        destroy: function(){
            this.remove();
        }
    });
});