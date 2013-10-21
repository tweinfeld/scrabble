/**
 * Created with JetBrains WebStorm.
 * User: Tal Weinfeld
 * Date: 23/10/12
 * Time: 16:48
 * To change this template use File | Settings | File Templates.
 */

var bind = function(func, context){
    return function(){
        func.apply(context, Array.prototype.slice.call(arguments));
    }
}

$.widget("ui.hintfield", {
    options: {
        "hint": "",
        "hinted": true
    },
    _init: function(){
        /*  Notice that the event delegations here are not facilitated by the Widget base. That's because this
            code is written for jQUI 1.8. On 1.9 there is a new ._on method which takes care of the event namespacing
            and destruction automatically */
        this._setHinted(true);
        this.element
            .val(this.options.hint)
            .on({   "focus.hintfield": bind(this._onFocus, this),
                    "blur.hintfield": bind(this._onBlur, this),
                    "keypress.hintfield": bind(this._onKeyPress, this) });
    },
    _onFocus: function(){
        if(this.options.hinted === true){
            this.element.val('');
            this._setHinted(false);
        }
    },
    _onBlur: function(){
        var hinted = this._setHinted(this.element.val() === "");
        if(hinted === true){
            this.element.val(this.options.hint);
        }

        this.element.trigger('hintfield_text_changed', this.options.hint ? "" : this.element.val());
    },
    _setHinted: function(val){
        this.element.toggleClass('hinted', val);
        return this.options.hinted = val;
    },
    _onKeyPress: function(e){
        if(e.keyCode === 13) this.element.trigger('hintfield_submitted');
    },
    getValue: function(){
        return this.options.hinted ? "" : this.element.val();
    },
    setValue: function(text){
        this.element.val(text);
        this._setHinted(text === "");
    },
    destroy: function(){
        this.element.off('.hintfield');
    }
});

