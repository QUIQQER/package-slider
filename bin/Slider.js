
/**
 * Slider
 *
 * @author www.pcsg.de (Henning Leutz)
 * @module package/quiqqer/slider/bin/Slider
 */
define('package/quiqqer/slider/bin/Slider', [

    'qui/QUI',
    'package/quiqqer/gallery/bin/controls/Slider',

    'css!package/quiqqer/slider/bin/Slider.css'

], function(QUI, GallerySlider)
{
    "use strict";

    return new Class({

        Extends : GallerySlider,
        Type : 'package/quiqqer/slider/bin/Slider',

        Binds : [
            '$__onImport',
            '$__onInject',
            '$animateInBegin'
        ],

        initialize : function(options)
        {
            this.parent(options);

            this.addEvents({
                onImport : this.$__onImport,
                onInject : this.$__onInject,
                onAnimateInBegin : this.$animateInBegin
            });

            this.setAttributes({
                styles : {
                    height: 400
                }
            });
        },

        /**
         * event : on import
         */
        $__onImport : function()
        {
            if (!this.$Elm.hasClass('quiqqer-slider')) {
                this.$Elm.addClass('quiqqer-slider');
            }
        },

        /**
         * event : on inject
         */
        $__onInject : function()
        {
            if (!this.$Elm.hasClass('quiqqer-slider')) {
                this.$Elm.addClass('quiqqer-slider');
            }
        },

        /**
         * event : on animate begin
         * On animate in, wrap a link to the image
         *
         * @param {Object} self
         * @param {HTMLImageElement} Elm
         */
        $animateInBegin : function(self, Elm)
        {
            var no = Elm.get('data-no');
            var entries = this.$List.getElements('.entry');

            if (typeof entries[no] === 'undefined') {
                return;
            }

            new Element('a', {
                href   : entries[no].get('data-href'),
                target : entries[no].get('data-target')
            }).wraps(Elm);
        }
    });
});
