define(["backbone"], function(Backbone){
    return Backbone.Model.extend({
        defaults: {
            question: "The longest word in the English language",
            word: "Antidisestablishmentarianism",
            hints: true,
            max_trials: 3,
            game_over: false
        }
    });
});
