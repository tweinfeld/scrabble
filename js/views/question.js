define(["backbone"], function(Backbone){
    return Backbone.View.extend({
        render: function(){
            this.update();
            this.hookEvents();
            return this;
        },
        hookEvents: function(){
            this.model.on('change:question', this.update, this);
        },
        update: function(){
            this.$el.text(this.model.get('question').toUpperCase());
        }
    });
});
