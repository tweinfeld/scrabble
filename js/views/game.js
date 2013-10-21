define(["jquery", "underscore", "backbone", "text!templates/game.html", "views/question", "models/letter", "views/letter", "models/letter", "views/target"], function($, _, Backbone, GameTemplate, QuestionView, LetterModel, LetterView, TargetModel, TargetView){
    return Backbone.View.extend({
        className: "scrabble",
        events: {
            "letterDropped": "onLetterDropped",
            "click .help": "onHintClicked",
            "drop .target": "onLetterClicked"
        },
        render: function(){
            this.$el.addClass(this.className).html(GameTemplate);
            this.options.question = new QuestionView({ el: this.$('h1')[0], model: this.model }).render();

            var _this = this,
                splitWord = this.model.get('word').split('');

            this.options.letters = _(splitWord).chain().shuffle().map(function(letter, i, arr){
                return new LetterView({ el: $('<div/>').appendTo(_this.$('.letters')), model: new LetterModel({ "value": letter, "left": _this.$el.width()/2-arr.length * 60 / 2 + i*60, "y_offset": -20 + Math.round(Math.random()*40), "rotation": -10 + Math.round(Math.random()*20) }) }).render();
            }).value();

            this.options.targets = _(splitWord).map(function(letter){
                return new TargetView({ el:$('<div/>').appendTo(_this.$('.targets')), model: new TargetModel({ "letter": letter }) }).render();
            });

            _.delay(function(){
                _this.$('.arrow').css({ left: _this.$('.targets').position().left - 80 });
            });

            /*_.delay(function(){
                if(!_this.model.get('game_over')) _this.$('.help').fadeIn(200);
            }, 6000);*/

            this.displayHintButton();

            //this.click = new Buzz.sound(['../sounds/click.mp3']);
            //this.electronic = new Buzz.sound(['../sounds/electronic.mp3']);

            this.delegateEvents();
            return this;
        },
        onLetterDropped: function(e, targetView){
            //this.click.stop().play();
            var pass = _(this.options.targets).reduce(function(acc, targetView){ return acc && targetView.check(); }, true);
            if(pass) {
                var _this = this;
                //this.electronic.play();
                this.lock(true).spin(function(){
                    _this.model.set({ "game_over": true });
                });
            }
            this.displayHintButton();
        },
        displayHintButton: _.debounce(function(){
            if(!this.model.get('game_over')) this.$('.help').fadeIn(200);
        }, 5000),
        lock: function(val){
            _([this.options.targets, this.options.letters]).chain().flatten().each(function(view){ view.lock(val); });
            return this;
        },
        hint: function(){
            _(this.options.targets).each(function(targetView){ targetView.hint(); });
            return this;
        },
        spin: function(callback){
            this.$('.shine')
                .delay(200)
                .fadeIn(200)
                .rotate({ angle: 0, animateTo: 360 * 2, duration: 2000 * 4, easing: function(x, t, b, c, d){ return t/d * c;} });

            this.$('.targets')
                .queue(function(){ $(this).addClass('correct').dequeue(); })
                .delay(2000)
                .queue(function(){ callback(); $(this).dequeue(); })

            this.$('.help').fadeOut(200);
        },
        onLetterClicked: function(){
            this.$('.arrow').fadeOut(500);
        },
        onHintClicked: function(){
            this.hint();
            this.$el.trigger('track_event', { "category": "game", "action": "hint_click" })
        },
        destroy: function(){
            _(this.options.letters, this.options.targets).chain().flatten().each(function(view){ view.destroy(); });
            this.undelegateEvents();
            this.$el.empty();
            this.setElement(null);
        }
    });
})
