requirejs.config({
    baseUrl: "/js",
    paths: {
        "async": "libs/async/async",
        "text": "libs/require/plugins/text",
        "domReady": "libs/require/plugins/domReady",
        "jquery": "libs/jquery/jquery-1.8.2.min",
        "backbone": "libs/backbone/backbone-min",
        "underscore": "libs/underscore/underscore-min",
        "jquery.ui": "libs/jquery/plugins/jquery-ui-1.8.23.custom.min",
        "jquery.ui.hintfield": "libs/jquery/plugins/jquery-ui-hintfield.1.0",
        "jquery.rotate": "libs/jquery/plugins/jQueryRotate.2.2",
        "md5": "libs/crypto/md5"
    },
    shim: {
        "underscore": {
            exports: function(){
                //return _;
                return _.noConflict();
            }
        },
        "backbone": {
            deps: ["jquery", "underscore"],
            exports: function(){
                //return Backbone;
                return Backbone.noConflict();
            }
        },
        "md5": {
            exports: function(){
                return CryptoJS.MD5;
            }
        },
        "jquery.ui": {
            deps: ["jquery"]
        },
        "jquery.rotate": {
            deps: ["jquery"]
        },
        "jquery.ui.hintfield": {
            deps: ["jquery", "jquery.ui"]
        }
    }
});

require([
    "jquery",
    "underscore",
    "backbone",
    "models/game",
    "collections/event",
    "views/game",
    "views/contact",
    "views/event_tracker",
    "views/stream_manager",
    "async",
    "domReady!",
    "jquery.ui",
    "jquery.ui.hintfield",
    "jquery.rotate"], function($, _, Backbone, GameModel, EventCollection, GameView, ContactView, TrackerView, UserMediaStreamManager, Async){

    jQuery.noConflict();

    pop = function(status, message){
        $('.top-stripe')
            .stop(true)
            .delay(100)
            .queue(function(){ $(this).addClass('alert').addClass(status).text(message); $(this).dequeue(); })
            .delay(10000)
            .queue(function(){ $(this).removeClass('alert good bad').text(''); })
    }

    var GameCollection = Backbone.Collection.extend({ model: GameModel });
    var games = new GameCollection([
        { question: "The 5th revision of the most famous markup language used in web development", "word": "HTML5" },
        { question: "A language commonly used to apply style to HTML documents", "word": "CSS" },
        { question: "A Programming language and a native browser companion since 1996", word: "JAVASCRIPT" },
        { question: "A very popular Javascript library for manipulating the document object model", word: "JQUERY" },
        { question: "One of the most popular Javascript frameworks used to apply MV architecture to your Javascript code", word: "BACKBONE" },
        { question: "A platform for running Javascript code outside the browser", word: "NODEJS" },
        { question: "A very well-known library implementing AMD for JS", word: "REQUIRE" },
        { question: "A framework made by Google for building complex MVC applications", word: "ANGULAR" },
        { question: "The answer to the ultimate Question of Life, the Universe, and Everything", word: "42" },
        { question: "A famous artist, known by his all time hit 'Never gonna give you up'", word: "RICKASTLEY" }
    ]);

    $('.logo').css({ top: -150 })
        .delay(200)
        .animate({ top: 0 }, { duration: 600 })
        .delay(100)
        .queue(function(){ $('.slogan').animate({ opacity: 1, left: 145 }, { duration: 500 }); $(this).dequeue(); })
        .click(function(){
            $('body').trigger('track_event', { "category": "information_blurb", "action": "open" });
            $('.introduction').fadeIn(100).find('a#start').click(
                function(){
                    $('body').trigger('track_event', { "category": "information_blurb", "action": "close" });
                    $('.introduction').fadeOut(100);
                }
            );
        });

    var startGame = function(){
        Async.forEachSeries(games.models, function(gameData, next){
            $('body').trigger('track_event', { "category": "game", "action": "level_start", "label": gameData.get('word') });
            var gameView = new GameView({ el: $('.scrabble'), model: gameData }).render();
            gameData.on('change:game_over', function(){
                gameData.off().set({ "game_over": false });
                $('body').trigger('track_event', { "category": "game", "action": "level_end", "label": gameData.get('word') });
                gameView.destroy();
                next();
            });
        }, function(){
            $('body').trigger('track_event', { "category": "game", "action": "end", "label": "" });
            $('.scrabble').html('<iframe width="420" height="315" src="//www.youtube.com/embed/oHg5SJYRHA0?autoplay=1" frameborder="0" allowfullscreen></iframe>');
            _.delay(function(){ pop('bad', 'Ha! Didn\'t see that one coming, did you? Enjoy..'); }, 3000);
        });
    }



    var openContact = function(){
        $('.masker').fadeIn(200);
        var close =  function(){
            contactForm.destroy();
            $('.masker').fadeOut(200);
        };

        var streamManager = new UserMediaStreamManager({ el: $('body') }).render();
        var contactForm = (new ContactView({ streamManager: streamManager, el: $('.contact-card') })).render();
        contactForm.on('closed', close);
        contactForm.on('sent', function(data){
            close();

            $.ajax({
                type: "POST",
                data: data,
                url: "lead",
                success: function(){ pop('good', 'Your message was sent successfully!'); close(); },
                error: function(){ pop('bad', 'We were unable to send your message, please try again later'); close(); }
            });

        });
    }

    $('body').on('click', 'footer a', function(e){
        $('body').trigger('track_event', { "category": "site", "action": "link_click", label: $(e.target).text() });
    });

    $('body').on('click','#email_link', function(e){
        e.preventDefault();
        openContact();
    });

    $(function(){
        var events = new EventCollection;
        events.on('add', function(eventModel){
            _gaq && _gaq.push(['_trackEvent'].concat(_(["category", "action", "label"]).map(function(fieldName){ return eventModel.get(fieldName); })));
        });

        var trackerView = new TrackerView({ el: $('body')[0] });
        trackerView.on('track_event', function(eventProperties){
            events.add(eventProperties);
        });

        $('body').trigger('track_event', { "category": "game", "action": "start", label: "" });
        startGame();
        $('.hire-us').click(function(){
            $('body').trigger('track_event', { "category": "site", "action": "hire_us_click" });
            openContact();
        });
    });

});

