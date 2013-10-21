define(['backbone'], function(Backbone){
    return Backbone.Model.extend({
        defaults: {
            value: "A",
            y_offset: 0,
            rotation: 0,
            top: 240,
            left: 0
        }
    });
});
