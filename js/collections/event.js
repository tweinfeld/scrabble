define(["backbone", "models/event"], function(Backbone, EventModel){
    return Backbone.Collection.extend({
        model: EventModel
    });
});
