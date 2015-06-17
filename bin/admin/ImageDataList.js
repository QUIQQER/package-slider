

define('package/quiqqer/slider/bin/admin/ImageDataList', [

    'qui/QUI',
    'qui/controls/Control'

], function(QUI, QUIControl)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type : 'package/quiqqer/slider/bin/admin/ImageDataList',

        Binds : [
            '$onImport',
            '$onInject'
        ],

        initialize : function(options)
        {
            this.parent(options);

            this.$Input = null;

            this.addEvents({
                onImport : this.$onImport,
                onInject : this.$onInject
            });
        },

        /**
         * Return a HTMLNode Element
         *
         * @return {HTMLDivElement}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'quiqqer-slider-imageDataList',
                html : '<div class="quiqqer-slider-imageDataList-buttons"></div>'+
                       '<div class="quiqqer-slider-imageDataList-container"></div>'

            });

            return this.$Elm;
        },

        /**
         * event : on import
         */
        $onImport : function()
        {
            if (this.$Elm.nodeName == 'INPUT') {

                this.$Input = this.$Elm;
                this.create().wraps(this.$Input);
            } else {
                this.inject(this.$Elm);
            }

            this.$Input.type = 'hidden';
        },

        /**
         * event : on inject
         */
        $onInject : function()
        {
            if (!this.$Input) {
                this.$Input = new Element('input', {
                    type : 'hidden'
                }).inject(this.$Elm);
            }
        },

        /**
         * Return a image entry
         *
         * @return {HTMLDivElement}
         */
        $createEntry : function()
        {
            var Container = new Element('div', {
                html : '<label></label>'
            });


            return Container;
        }



    });
});