define(["backbone"], function(Backbone){
    return Backbone.Model.extend({
        defaults: {
            "category": "",
            "action": "",
            "label": ""
        }
    });
});
