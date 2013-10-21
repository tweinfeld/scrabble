/**
 * Created with JetBrains WebStorm.
 * User: Tal Weinfeld
 * Date: 21/10/12
 * Time: 11:41
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "underscore","backbone", "md5", "text!templates/contact.html"], function($, _, Backbone, MD5, ContactTemplate){

    return Backbone.View.extend({
        template: _.template(ContactTemplate),
        initialize: function(){
            this.$el.trigger('track_event', { "category": "contact_menu", "action": "open" });
        },
        events: {
          "hintfield_text_changed #email": "onEmailChanged",
          "click .close-button": "onClosed",
          "click .ok": "onSent",
          "keyup": "onFieldChanged",
          "keydown": "onFieldChanged",
          "click .camera": "onCameraClicked"
          //"hintfield_submitted #email": "onEmailChanged"
        },
        render: function(){
            var _this = this;

            this.$el.html(this.template());
            _([ { "element_name": "full_name", hint_text: "Name" },
                { "element_name": "email", hint_text: "Email address" },
                { "element_name": "message", hint_text: "Your message goes here.." }]).each(function(o){
                    _this.$(["#", o["element_name"]].join('')).hintfield({ "hint": o["hint_text"] });
                });


            this.delegateEvents();
            if(this.options.streamManager){
                if (this.options.streamManager.options.available){
                    this.$('.camera').show();
                    if(this.options.streamManager.hasStreams()){
                        this.$('.camera').click();
                    }
                }
            }

            return this;
        },

        onEmailChanged: function(e){
            var emailHash =_.reduce([
                function(v){ return v.toLowerCase(); },
                function(v){ return _.first(/[^\s]+/g.exec(v) || [""]); },
                function(v){ return /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z{|}~])*@[a-zA-Z](-?[a-zA-Z0-9])*(\.[a-zA-Z](-?[a-zA-Z0-9])*)+$/.test(v) ? v : "" },
                function(v){ return v && MD5(v).toString(); }
            ], function(a,f){ return f(a); }, this.$('#email').hintfield('getValue'));

            var imageSrc = emailHash !== "" ? "http://www.gravatar.com/avatar/"+emailHash+"?s=150&d=retro" : "images/mm.png";
            /*var _this = this;

            $('<img/>').prop({ "src": imageSrc }).load(function(){
                _this.$('.thumbnail')[0].getContext('2d').drawImage(this, 0, 0, 150, 150);
            });*/
            this.$('.thumbnail').css({ "backgroundImage": "url("+imageSrc+")" });
        },

        onClosed: function(e){
            this.trigger('closed');
        },
        onSent: function(e){
            if(this.validateFields()){
                this.$el.trigger('track_event', { "category": "contact_menu", "action": "form_send" });
                this.undelegateEvents();
                var _this = this;
                this.trigger('sent',
                    _([ "full_name", "email", "message"]).chain().reduce(function(a,v){ a[v] = _this.$(["#",v].join('')).hintfield('getValue'); return a;  },{}).extend({ thumbnail: this.$('.thumbnail')[0].toDataURL('image/png') }).value()
                );
            }
        },
        onFieldChanged: function(e){
            this.$('.ok').toggleClass('disabled', !this.validateFields());
        },
        validateFields: function(){
            var _this = this;
            return _([ "full_name", "email", "message"]).reduce(function(a,v){
                return a && !/^\s*$/.test(_this.$(['#',v].join('')).hintfield('getValue'));
            }, true);
        },
        onCameraClicked: function(){
            this.$el.trigger('track_event', { "category": "contact_menu", "action": "camera_activation_prompt" });
            var _this = this;

            _this.delegateEvents(_(_this.events).chain().clone().extend({
                "click .camera": function(){}
            }).value());

            this.options.streamManager.requestVideoStream(function(err,url){

                if(!err){
                    _this.$el.trigger('track_event', { "category": "contact_menu", "action": "camera_activated" });
                    _this.$('.camera').removeClass('inactive');
                    //_this.$('.thumbnail').css({ "background-image": "none", "background-color": "#fff" });
                    _this.options.videoStreamUrl = url;
                    var video = _this.options.video = $('<video autoplay="true"/>');
                    video[0].src = url;

                    _this.delegateEvents(_(_this.events).chain().clone().extend({
                        "click .camera": "onPictureTaken"
                    }).value());

                } else {
                    _this.delegateEvents();
                }
            });
        },
        onPictureTaken: function(){
            this.$el.trigger('track_event', { "category": "contact_menu", "action": "picture_taken" });
            var canvas = this.$('.thumbnail'),
                ctx = canvas[0].getContext('2d');

            var scaleRatio = Math.min(200 / this.options.video[0].videoHeight),
                width = this.options.video[0].videoWidth * scaleRatio,
                height = this.options.video[0].videoHeight * scaleRatio;

            ctx.globalAlpha = 1;
            ctx.drawImage(this.options.video[0], 75 + width/-2, 75 + height/-2, width, height);
            var imageData = ctx.getImageData(0,0, 150, 150);
            var i= 1, fade = function(){
            canvas
                .queue(function(){ ctx.putImageData(imageData,0,0); $(this).dequeue(); })
                .queue(function(){ ctx.fillStyle = "rgba(255, 255, 255, "+ (i-=0.1).toString()+")"; $(this).dequeue(); })
                .queue(function(){ ctx.fillRect(0,0,150,150);  $(this).dequeue(); })
                .delay(10)
                .promise()
                .done(function(){ if(i>0) fade(); })
            }

            fade();

        },
        destroy: function(){
            this.$el.trigger('track_event', { "category": "contact_menu", "action": "close" });
            this.undelegateEvents();
            this.$el.empty();
            this.options = {};
            this.setElement(null);
        }
    });

});
