define(["backbone"], function(Backbone){
    return Backbone.View.extend({
        events: {
            "track_event": "onTrackEvent"
        },
        onTrackEvent: function(e, params){
            this.trigger('track_event', params);
        }
    });
});