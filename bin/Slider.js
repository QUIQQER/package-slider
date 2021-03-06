/**
 * Slider
 *
 * @author www.pcsg.de (Henning Leutz)
 * @module package/quiqqer/slider/bin/Slider
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/loader/Loader
 * @require qui/utils/Functions
 * @require qui/utils/Math
 * @require css!package/quiqqer/slider/bin/Slider.css
 */
define('package/quiqqer/slider/bin/Slider', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/utils/Functions',
    'qui/utils/Math',

    'css!package/quiqqer/slider/bin/Slider.css'

], function (QUI, QUIControl, QUILoader, QUIFunctionsUtils, QUIMathUtils) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/slider/bin/Slider',

        Binds: [
            '$__onImport',
            '$__onInject',
            '$animateInBegin'
        ],

        options: {
            type              : 'standard', // standard / nivo
            period            : 5000,
            shadow            : false,
            showcontrolsalways: false,
            showtitlealways   : false,
            autostart         : false
        },

        initialize: function (options) {
            this.parent(options);

            this.Loader = new QUILoader();

            this.$images = [];

            this.addEvents({
                onImport: this.$__onImport,
                onInject: this.$__onInject
            });
        },

        /**
         * event : on import
         */
        $__onImport: function () {
            this.$__onInject();
        },

        /**
         * event : on inject
         */
        $__onInject: function () {
            if (!this.$Elm.hasClass('quiqqer-slider')) {
                this.$Elm.addClass('quiqqer-slider');
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            this.Loader.inject(this.$Elm);

            // settings
            if (this.$Elm.get('data-period')) {
                this.setAttribute('period', this.$Elm.get('data-period'));
            }

            if (this.$Elm.get('data-shadow')) {
                this.setAttribute('shadow', this.$Elm.get('data-shadow'));
            }

            if (this.$Elm.get('data-showcontrolsalways')) {
                this.setAttribute('showcontrolsalways', this.$Elm.get('data-showcontrolsalways'));
            }

            if (this.$Elm.get('data-showtitlealways')) {
                this.setAttribute('showtitlealways', this.$Elm.get('data-showtitlealways'));
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
        getImageData: function () {
            var i, len, Entry;

            var result  = [];
            var entries = this.getElm().getElements('.quiqqer-slider-image');

            for (i = 0, len = entries.length; i < len; i++) {
                Entry = entries[i];

                if (Entry.get('data-src') === '') {
                    continue;
                }

                result.push({
                    image : Entry.get('data-src'),
                    title : Entry.getElement('.title').get('html'),
                    text  : Entry.getElement('.text').get('html'),
                    target: Entry.get('data-target'),
                    href  : Entry.get('data-href')
                });
            }

            result = Object.merge(this.$images, result);

            return result;
        },

        /**
         * Add an image via javascript
         *
         * @param {String} imageSrc - source of the image
         * @param {String} title - title to show
         * @param {String} text - text to show
         * @param {String} href - link
         * @param {String} target - target of the link
         */
        addImage: function (imageSrc, title, text, href, target) {
            this.$images.push({
                image : imageSrc,
                title : title || '',
                text  : text || '',
                target: target || '',
                href  : href || ''
            });
        },

        /**
         * Standard slider
         */
        $loadStandard: function () {
            require(['package/quiqqer/gallery/bin/controls/Slider'], function (Slider) {
                var images = this.getImageData();

                this.$Slider = new Slider({
                    period                : this.getAttribute('period'),
                    shadow                : this.getAttribute('shadow'),
                    'show-controls-always': this.getAttribute('showcontrolsalways'),
                    'show-title-always'   : this.getAttribute('showtitlealways'),

                    styles: {
                        height: this.getElm().getSize().y
                    },
                    events: {
                        onAnimateInBegin: function (self, Elm) {
                            var no = Elm.get('data-no');

                            if (typeof images[no] === 'undefined') {
                                return;
                            }

                            if (images[no].href === '') {
                                return;
                            }

                            new Element('a', {
                                href  : images[no].href,
                                target: images[no].target
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

                    this.$Slider.showFirst().then(function () {
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
        $loadNivoSlider: function () {
            this.Loader.show();

            require(['package/quiqqer/slider/bin/NivoSlider'], function (Slider) {
                var files  = [],
                    images = this.getImageData();

                // create the html
                var Container = new Element('div', {
                    styles: {
                        height  : '100%',
                        left    : 0,
                        position: 'absolute',
                        top     : 0,
                        width   : '100%'
                    }
                }).inject(this.getElm());


                for (var i = 0, len = images.length; i < len; i++) {
                    files.push('image!' + images[i].image);
                }

                require(files, function () {
                    var Img, Entry;

                    for (i = 0, len = images.length; i < len; i++) {
                        Entry = images[i];

                        Img = new Element('img', {
                            src: Entry.image
                        });

                        Img.inject(Container);

                        if (images[i].href && images[i].href.trim() !== '') {
                            new Element('a', {
                                href  : Entry.href,
                                target: Entry.target
                            }).wraps(Img);
                        }
                    }

                    var maxHeight = this.$getMaxHeightOfImages(
                        Container.getElements('img')
                    );

                    if (!maxHeight) {
                        maxHeight = '100%';
                    }

                    this.getElm().setStyles({
                        height: maxHeight
                    });

                    var orientation = {
                        fade              : 'vertical',
                        fold              : 'vertical',
                        random            : 'vertical',
                        sliceLeftDown     : 'horizontal',
                        sliceLeftUp       : 'horizontal',
                        sliceLeftRightDown: 'horizontal',
                        sliceLeftRightUp  : 'horizontal',
                        sliceRightDown    : 'horizontal',
                        sliceRightUp      : 'horizontal',
                        wipeDown          : 'horizontal',
                        wipeUp            : 'horizontal',
                        sliceDownLeft     : 'vertical',
                        sliceDownRight    : 'vertical',
                        sliceUpDownLeft   : 'vertical',
                        sliceUpDownRight  : 'vertical',
                        sliceUpLeft       : 'vertical',
                        sliceUpRight      : 'vertical',
                        wipeLeft          : 'vertical',
                        wipeRight         : 'vertical'
                    };

                    this.$Slider = new Slider(Container, {
                        autoPlay            : this.$Elm.get('data-autostart') || false,
                        animSpeed           : this.$Elm.get('data-animspeed') || 500,
                        effect              : this.$Elm.get('data-effect') || 'fade',
                        interval            : this.getAttribute('period'),
                        orientation         : orientation[this.$Elm.get('data-effect')] || 'vertical',
                        slices              : this.$Elm.get('data-slices') || 10,
                        directionNav        : this.getAttribute('showControlsAlways'),
                        directionNavHide    : false,
                        directionNavPosition: this.$Elm.get('data-controlsposition') || 'outside'
                    });

                    this.Loader.hide();


                    window.addEvents({
                        resize: QUIFunctionsUtils.debounce(function () {
                            //var maxHeight = this.$getMaxHeightOfImages(
                            //    Container.getElements('img')
                            //);
                            //
                            //this.getElm().setStyles({
                            //    height: maxHeight
                            //});
                            this.$Slider.refresh();

                        }.bind(this))
                    });


                }.bind(this));

            }.bind(this));
        },

        /**
         * Return the max height of all images
         *
         * @param nodeList
         * @returns {number}
         */
        $getMaxHeightOfImages: function (nodeList) {
            var maxHeight        = 0,
                holderSize       = this.getElm().getSize(),
                holderSizeHeight = holderSize.y;

            if (holderSizeHeight === 0) {
                holderSizeHeight = 300;
            }

            nodeList.each(function (Img) {

                var imgSize = Img.getSize();

                var result = QUIMathUtils.resizeVar(
                    imgSize.y,
                    imgSize.x,
                    holderSizeHeight
                );

                if (maxHeight < result.var2) {
                    maxHeight = result.var2;
                }
            });

            return maxHeight;
        }
    });
});
