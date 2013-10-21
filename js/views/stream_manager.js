define(["jquery", "underscore", "backbone"], function($, _, Backbone){
    var options = {
        getUserMedia: function(stream, success, failure){ failure(); },
        URL: null,
        available: false,
        streams: []
    };

    var impl = window.navigator.webkitGetUserMedia;

    // Detect feature support (only implemented for webkit at this stage because of currently limited support on other browsers)
    if(impl){
        // Create handles
        _(options).extend({
            URL: window.webkitURL,
            available: true,
            getUserMedia: _.bind(window.navigator.webkitGetUserMedia, window.navigator)
        });
    }

    return Backbone.View.extend({
        options: options,
        initialize: function(){

        },
        render: function(){
            $('<div class="stream_alert"/>').appendTo(this.el);
            return this;
        },
        requestVideoStream: impl ? function(callback){

            var previousStream = _(this.options.streams).detect(function(o){ return o.type==="video"; });
            if(previousStream){
                callback(false, previousStream.url);
                return;
            }

            var _this = this;
            this.$('.stream_alert').slideDown();
            this.options.getUserMedia({ video: true }, function(stream){
                _this.hideAlert();
                var url = _this.options.URL.createObjectURL(stream);
                _this.options.streams.push({ type: "video", stream: stream, url: url });
                callback(false, url);
            }, function(){
                _this.hideAlert();
                callback(true, null);
            });
        } : function(callback){
            callback(true, null)
        },
        hideAlert: function(){
            this.$('.stream_alert').slideUp();
        },
        hasStreams: function(){
            return this.options.streams.length > 0;
        }
    });
});