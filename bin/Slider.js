
/**
 * Slider
 *
 * @author www.pcsg.de (Henning Leutz)
 * @module package/quiqqer/slider/bin/Slider
 *
 * @require qui/QUI
 * @require package/quiqqer/gallery/bin/controls/Slider
 * @require css!package/quiqqer/slider/bin/Slider.css
 */
define('package/quiqqer/slider/bin/Slider', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/utils/Functions',
    'qui/utils/Math',

    'css!package/quiqqer/slider/bin/Slider.css'

], function(QUI, QUIControl, QUILoader, QUIFunctionsUtils, QUIMathUtils)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type : 'package/quiqqer/slider/bin/Slider',

        Binds : [
            '$__onImport',
            '$__onInject',
            '$animateInBegin'
        ],

        options : {
            type   : 'standard', // standard / nivo
            period : 5000,
            shadow : false,
            showcontrolsalways : true,
            showtitlealways    : true,
            autostart : true
        },

        initialize : function(options)
        {
            this.parent(options);

            this.Loader = new QUILoader();

            this.addEvents({
                onImport : this.$__onImport,
                onInject : this.$__onInject
            });
        },

        /**
         * event : on import
         */
        $__onImport : function()
        {
            this.$__onInject();
        },

        /**
         * event : on inject
         */
        $__onInject : function()
        {
            if (!this.$Elm.hasClass('quiqqer-slider')) {
                this.$Elm.addClass('quiqqer-slider');
            }

            this.$Elm.setStyles(this.getAttribute('styles'));

            this.Loader.inject( this.$Elm );

            // settings
            if (this.$Elm.get('data-period')) {
                this.setAttribute('period', this.$Elm.get('data-period'));
            }

            if (this.$Elm.get('data-shadow')) {
                this.setAttribute('shadow', this.$Elm.get('data-shadow'));
            }

            if (this.$Elm.get('data-showcontrolsalways')) {
                this.setAttribute('showControlsAlways', this.$Elm.get('data-showcontrolsalways'));
            }

            if (this.$Elm.get('data-period')) {
                this.setAttribute('period', this.$Elm.get('data-period'));
            }

            if (this.$Elm.get('data-autostart')) {
                this.setAttribute('autostart', this.$Elm.get('data-autostart'));
            }

            if (this.$Elm.get('data-type')) {
                this.setAttribute('type', this.$Elm.get('data-type'));
            }

            this.getElm().setStyle('height', 300);

            switch (this.getAttribute('type')) {
                case 'nivo':
                    this.$loadNivoSlider();
                    break;

                default:
                    this.$loadStandard();
            }
        },

        /**
         * Return the image data
         *
         * @return {Array}
         */
        getImageData : function()
        {
            var i, len, Entry;

            var result = [];
            var entries = this.getElm().getElements('.quiqqer-slider-image');

            for (i = 0, len = entries.length; i < len; i++) {
                Entry = entries[i];

                if (Entry.get('data-src') === '') {
                    continue;
                }

                result.push({
                    image  : Entry.get('data-src'),
                    title  : Entry.getElement('.title').get('html'),
                    text   : Entry.getElement('.text').get('html'),
                    target : Entry.get('data-target'),
                    href   : Entry.get('data-href')
                });
            }

            return result;
        },

        /**
         * Standard slider
         */
        $loadStandard : function()
        {
            require(['package/quiqqer/gallery/bin/controls/Slider'], function(Slider)
            {
                var images = this.getImageData();

                this.$Slider = new Slider({
                    period : this.getAttribute('period'),
                    shadow : this.getAttribute('shadow'),
                    showControlsAlways : this.getAttribute('showcontrolsalways'),
                    showTitleAlways    : this.getAttribute('showtitlealways'),

                    styles : {
                        height : this.getElm().getSize().y
                    },
                    events : {
                        onAnimateInBegin : function(self, Elm) {
                            var no = Elm.get('data-no');

                            if (typeof images[no] === 'undefined') {
                                return;
                            }

                            new Element('a', {
                                href   : images[no].href,
                                target : images[no].target
                            }).wraps(Elm);
                        }.bind(this)
                    }
                });

                for (var i = 0, len = images.length; i < len; i++) {
                    this.$Slider.addImage(
                        images[i].image,
                        images[i].title,
                        images[i].text
                    );
                }

                this.$Slider.inject(this.getElm());


                if (this.getAttribute('autostart')) {

                    this.$Slider.showFirst().then(function() {
                        this.$Slider.autoplay();
                    }.bind(this));

                } else {
                    this.$Slider.showFirst();
                }

            }.bind(this));
        },

        /**
         * Load the Nivo Slider
         */
        $loadNivoSlider : function()
        {
            this.Loader.show();

            require([
                'package/quiqqer/slider/bin/NivoSlider',
                URL_BIN_DIR +'QUI/lib/Assets.js'
            ], function(Slider)
            {
                var files  = [],
                    images = this.getImageData();

                // create the html
                var Container = new Element('div', {
                    styles : {
                        height   : '100%',
                        left     : 0,
                        position : 'absolute',
                        top      : 0,
                        width    : '100%'
                    }
                }).inject(this.getElm());


                for (var i = 0, len = images.length; i < len; i++) {
                    files.push(images[i].image);
                }

                Asset.images(files, {
                    onComplete : function()
                    {
                        var Img, Entry;

                        for (i = 0, len = images.length; i < len; i++)
                        {
                            Entry = images[i];

                            Img = new Element('img', {
                                src : Entry.image
                            });

                            Img.inject(Container);

                            if (images[i].href && images[i].href.trim() !== '') {
                                new Element('a', {
                                    href   : Entry.href,
                                    target : Entry.target
                                }).wraps(Img);
                            }
                        }

                        var maxHeight = this.$getMaxHeightOfImages(
                            Container.getElements('img')
                        );

                        this.getElm().setStyles({
                            height: maxHeight
                        });

                        var orientation = {
                            fade               : 'vertical',
                            fold               : 'vertical',
                            random             : 'vertical',
                            sliceLeftDown      : 'horizontal',
                            sliceLeftUp        : 'horizontal',
                            sliceLeftRightDown : 'horizontal',
                            sliceLeftRightUp   : 'horizontal',
                            sliceRightDown     : 'horizontal',
                            sliceRightUp       : 'horizontal',
                            wipeDown           : 'horizontal',
                            wipeUp             : 'horizontal',
                            sliceDownLeft      : 'vertical',
                            sliceDownRight     : 'vertical',
                            sliceUpDownLeft    : 'vertical',
                            sliceUpDownRight   : 'vertical',
                            sliceUpLeft        : 'vertical',
                            sliceUpRight       : 'vertical',
                            wipeLeft           : 'vertical',
                            wipeRight          : 'vertical'
                        };

                        this.$Slider = new Slider(Container, {
                            autoPlay    : this.$Elm.get('data-autostart') || false,
                            animSpeed   : this.$Elm.get('data-animspeed') || 500,
                            effect      : this.$Elm.get('data-effect') || 'fade',
                            interval    : this.getAttribute('period'),
                            orientation : orientation[this.$Elm.get('data-effect')] || 'vertical',
                            slices      : this.$Elm.get('data-slices') || 10,
                            directionNav         : this.getAttribute('showControlsAlways'),
                            directionNavHide     : false,
                            directionNavPosition : this.$Elm.get('data-controlsposition') || 'outside',
                            directionNavWidth    : '20%'
                        });

                        this.Loader.hide();


                        window.addEvents({
                            resize : QUIFunctionsUtils.debounce(function()
                            {
                                var maxHeight = this.$getMaxHeightOfImages(
                                    Container.getElements('img')
                                );

                                this.getElm().setStyles({
                                    height: maxHeight
                                });

                                this.$Slider.refresh();

                            }.bind(this))
                        });


                    }.bind(this)
                });

            }.bind(this));
        },

        /**
         *
         * @param nodeList
         * @returns {number}
         */
        $getMaxHeightOfImages : function(nodeList)
        {
            var maxHeight = 0,
                holderSize = this.getElm().getSize();

            nodeList.each(function(Img) {

                var imgSize = Img.getSize();

                var result = QUIMathUtils.resizeVar(
                    imgSize.y,
                    imgSize.x,
                    holderSize.x
                );

                if (maxHeight < result.var2) {
                    maxHeight = result.var2;
                }
            });

            return maxHeight;
        }
    });
});
