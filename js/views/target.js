define(["jquery", "backbone"], function($, Backbone){

    return Backbone.View.extend({
        className: "target",
        options: {
            view: null
        },
        initialize: function(){

        },
        render: function(){
            var _this = this;
            this.$el
                .addClass(this.className)
                .append($('<div class="hint"/>').text(this.model.get('letter')))
                .droppable({
                    accept: ".scrabble .letter",
                    hoverClass: "over",
                    drop: function(e,ui){
                        ui.draggable.data('view').drop(_this);
                        _this.$el.droppable('option', 'disabled', true);
                        _this.options.view = ui.draggable.data('view');
                        _this.$el.trigger('letterDropped', _this);
                    },
                    out: function(e, ui){
                        _this.options.view = null;
                    }
                });
            return this;
        },
        hint: function(){
            if(!this.check()){
                var view = this.options.view, _this = this;
                view && (function(){ view.$el.fadeOut(100).delay(900).fadeIn(100); })();

                this.$('.hint')
                    //.queue(function(){ _this.lock(true); $(this).dequeue(); })
                    .delay(100)
                    .fadeIn(200)
                    .delay(500)
                    .fadeOut(200);
                    //.queue(function(){ _this.lock(false); $(this).dequeue(); })
            }
        },
        lock: function(state){
            this.$el.droppable('option', 'disabled', state);
        },
        check: function(){
            return this.options.view ? this.model.get('letter') === this.options.view.model.get('value') : false;
        }

    });

});
