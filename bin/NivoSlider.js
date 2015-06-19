/*
 ---

 script: NivooSlider.js

 description: A nice image slider for MooTools.

 license: MIT-style license

 authors:
 - Johannes Fischer
 - Henning Leutz

 requires:
 - core/1.4: '*'

 provides:
 - NivooSlider

 ...
 */

define('package/quiqqer/slider/bin/NivoSlider', [

    'qui/utils/Functions',

    'css!package/quiqqer/slider/bin/NivoSlider.css'

], function(QUIFunctionsUtils)
{
    "use strict";

    return new Class({

        Implements: [Events, Options],

        caption: null,
        children: null,
        containerSize: 0,
        count: 0,
        currentSlide: 0,
        currentImage: '',
        effects: {
            // used for random effects
            common: ['fade'],
            horizontal: [
                'foldDown', 'foldUp',
                'sliceLeftUp', 'sliceLeftDown', 'sliceLeftRightDown',
                'sliceLeftRightUp', 'sliceRightDown', 'sliceRightUp',
                'wipeDown', 'wipeUp'
            ],
            vertical: [
                'foldLeft', 'foldRight',
                'sliceDownLeft', 'sliceDownRight', 'sliceUpDownLeft', 'sliceUpDownRight',
                'sliceUpLeft', 'sliceUpRight', 'wipeLeft', 'wipeRight'
            ]
        },
        holder: null,
        hover: false,
        interval: null,
        isActive: true,
        orientation: '',
        paused: false,
        running: false,
        slices: null,
        sliceSize: false,
        totalSlides: 0,

        options: {
            animSpeed: 500,
            autoPlay: true,
            controlNav: true,
            controlNavItem: 'disc',
            directionNav: true,
            directionNavHide: false,
            directionNavPosition: 'inside',
            directionNavWidth: '20%',
            effect: 'sliceDown', // TODO allow to pass an array with multiple effects
            interval: 3000,
            orientation: 'vertical',
            pauseOnBlur: false,
            pauseOnHover: true,
            slices: 15,

            // not implemented yet
            preLoadImages: false

            //onFinish: function () {}
            //onLastSlide: function () {}
            //onStart: function () {}
        },

        initialize: function (container, options) {
            this.container = document.id(container);

            this.setOptions(options);
            this.orientation = this.getOrientation();

            this.effects.horizontal.combine(this.effects.common);
            this.effects.vertical.combine(this.effects.common);

            this.initSlider();
            this.createSlices();
            this.setBackgroundImage();

            window.addEvents({
                resize : QUIFunctionsUtils.debounce(this.refresh.bind(this))
            });

            if (this.options.autoPlay) {
                this.play();

                if (this.options.pauseOnBlur) {
                    window.addEvents({
                        blur: function () {
                            this.isActive = false;
                            this.pause();
                        }.bind(this),
                        focus: function () {
                            this.isActive = true;
                            this.play();
                        }.bind(this)
                    });
                }
            }
        },

        refresh : function()
        {
            var wasrunning = this.interval ? true : false;

            if (wasrunning) {
                this.pause();
            }

            if (this.slices) {
                this.slices.destroy();
                this.containerSize = this.holder.getSize();

                this.createSlices();
                this.setBackgroundImage();
            }

            if (wasrunning) {
                this.play();
            }
        },

        animate: function (slice, fxStyles, last)
        {
            var fx = slice.retrieve('fxInstance'),
                isLast = last !== undefined && last === true;

            fx.start(fxStyles).chain(function () {
                this.count += 1;

                if (this.count === this.options.slices || isLast) {
                    this.running = false;

                    // fire onFinish function
                    this.finish();
                    this.setBackgroundImage();

                    this.count = 0;

                    if (this.currentSlide === (this.totalSlides - 1)) {
                        this.lastSlide();
                    }
                }
            }.bind(this));
        },

        arrangeSlices: function () {
            var height,
                position,
                width;

            var optionSlices   = this.options.slices,
                orientation    = this.orientation,
                sliceSizeX     = this.sliceSize.x,
                sliceSizeY     = this.sliceSize.y,
                containerSizeX = this.containerSize.x,
                containerSizeY = this.containerSize.y;


            this.slices.each(function (el, i) {

                position = {
                    left : orientation === 'vertical' ? sliceSizeX * i : 0,
                    top  : orientation === 'horizontal' ? sliceSizeY * i : 0
                };

                // set size & position
                if (orientation === 'horizontal') {
                    height = i === optionSlices - 1 ? containerSizeY - (sliceSizeY * i) : sliceSizeY;
                    width  = '100%';

                    el.setStyles({
                        height : height,
                        top    : position.top,
                        width  : width
                    });
                } else { // if vertical
                    height = 0;
                    width  = i === optionSlices - 1 ? containerSizeX - (sliceSizeX * i) : sliceSizeX;

                    el.setStyles({
                        height : height,
                        left   : position.left,
                        top    : '',
                        width  : width
                    });
                }

                el.store('fxInstance', new Fx.Morph(el, {
                    duration: this.options.animSpeed
                })).store('coordinates', Object.merge(position, {
                    height : height,
                    width  : width
                }));

            }, this);
        },

        createCaption: function () {
            this.caption = new Element('p', {
                styles: {
                    opacity: 0
                }
            }).inject(this.holder);

            this.caption.store('fxInstance', new Fx.Morph(this.caption, {
                duration : 200,
                wait     : false
            }));
        },

        createControlNav: function () {
            var cssClass = '',
                html,
                i = 1;

            this.container.addClass('got-control-nav');

            var Nav = new Element('div.control-nav').inject(this.container);

            if (this.options.directionNavPosition === 'inside') {
                Nav.setStyles({
                    height     : 46,
                    lineHeight : 40
                });
            }

            this.totalSlides.each(function (el) {
                if (this.options.controlNavItem === 'decimal') {
                    html = i;
                    i++;
                } else if (this.options.controlNavItem === 'disc') {
                    cssClass = 'decimal';
                    html = '&bull;';
                } else {
                    html = this.options.controlNavItem;
                }

                new Element('a', {
                    'class': cssClass,
                    events: {
                        'click': function (e) {
                            e.stop();
                            this.slide(el);
                        }.bind(this)
                    },
                    href: '#',
                    html: html
                }).inject(this.container.getElement('div.control-nav'));
            }, this);

            this.setCurrentControlItem();
        },

        createDirectionNav: function () {
            var directionNavStyles,
                leftContainer,
                rightContainer,
                target;

            target = this.options.directionNavPosition === 'inside' ? this.holder : this.container;

            directionNavStyles = {};

            if (this.options.directionNavPosition === 'inside' &&
                this.options.directionNavWidth.toInt() !== 0)
            {
                directionNavStyles.width = this.options.directionNavWidth;
            }

            // create container
            leftContainer = new Element('div.direction-nav-left', {
                styles: directionNavStyles
            }).inject(target);

            rightContainer = new Element('div.direction-nav-right', {
                styles: directionNavStyles
            }).inject(target);

            // create controls
            this.leftNav = new Element('a', {
                html : '<span class="fa fa-chevron-left"></span>',
                events: {
                    'click': function (e) {
                        e.stop();
                        if (this.options.autoPlay)
                        {
                            this.pause();
                            if (!this.options.pauseOnHover)
                            {
                                this.play();
                            }
                        }
                        this.previous();
                    }.bind(this)
                },
                href: '#'
            }).inject(leftContainer);

            this.rightNav = new Element('a', {
                html : '<span class="fa fa-chevron-right"></span>',
                events: {
                    'click': function (e) {
                        e.stop();
                        if (this.options.autoPlay) {
                            this.pause();
                            if (!this.options.pauseOnHover)
                            {
                                this.play();
                            }
                        }
                        this.next();
                    }.bind(this)
                },
                href: '#'
            }).inject(rightContainer);

            if (this.options.directionNavHide && this.options.directionNav) {
                this.leftNav.addClass('direction-nav-hide');
                this.rightNav.addClass('direction-nav-hide');
            }
        },

        createLinkHolder: function ()
        {
            this.linkHolder = new Element('a.nivoo-link', {
                href: '#'
            }).inject(this.holder);
        },

        createSlices: function ()
        {
            var slices = this.options.slices;

            this.sliceSize = {
                x: (this.containerSize.x / slices).round(),
                y: (this.containerSize.y / slices).round()
            };

            // effects that need one slice only
            if (['fade', 'wipeLeft', 'wipeRight'].contains(this.options.effect)) {
                slices = 1;
            }

            for (var i = 0, len = slices; i < len; i++) {
                new Element('div.nivoo-slice').inject(this.holder);
            }

            this.slices = this.getSlices();

            this.arrangeSlices();
        },

        getImages: function () {
            return this.holder.getElements('img');
        },

        getOrientation: function () {
            if (this.effects.horizontal.indexOf(this.options.effect) > -1) {
                return 'horizontal';
            }

            if (this.effects.vertical.indexOf(this.options.effect) > -1) {
                return 'vertical';
            }

            return this.options.orientation;
        },

        getSlices: function () {
            return this.holder.getElements('.nivoo-slice');
        },

        initSlider: function () {
            if (this.options.directionNavPosition === 'outside') {
                this.container.addClass('direction-nav-outside');
            }

            if (this.options.slices) {
                this.options.slices = parseInt(this.options.slices);

                if (!this.options.slices) {
                    this.options.slices = 10;
                }
            }

            // wrap child elements
            this.holder = new Element('div.nivoo-slider-holder').adopt(
                this.container.getChildren()
            ).inject(this.container);

            if (this.options.directionNavPosition == 'inside') {
                this.holder.setStyle('width', '100%');
                this.holder.setStyle('height', '100%');

            } else {
                this.holder.setStyle('width', 'calc(100% - 120px)');
                this.holder.setStyle('height', 'calc(100% - 20px)');
            }

            this.children = this.getImages();

            this.holderImage = new Element('img', {
                src     : this.children[0].get('src'),
                'class' : 'nivoo-slider-holder-image',
                styles  : {
                    maxWidth  : '100%',
                    maxHeight : '100%'
                }
            }).inject(this.holder);

            this.containerSize = this.holderImage.getSize();
            this.totalSlides = this.children.length;
            this.children.setStyle('display', 'none');

            this.currentImage = this.children[0];

            // init LinkHolderand set link
            this.createLinkHolder();
            this.setLink();

            this.setBackgroundImage();
            this.createCaption();
            this.showCaption();

            // attach pauseOnHover
            if (this.options.pauseOnHover && this.options.autoPlay) {
                this.holder.addEvents({
                    'mouseenter': function () {
                        this.pause();
                    }.bind(this),
                    'mouseleave': function () {
                        this.play();
                    }.bind(this)
                });
            }

            // create directional navigation
            if (this.options.directionNav)
            {
                this.createDirectionNav();

            } else {
                this.holder.setStyles({
                    margin: 0,
                    width: '100%'
                });
            }

            // create control navigation
            if (this.options.controlNav) {
                this.createControlNav();
            }

            this.holderImage.setStyle('display', null);
        },

        hideCaption: function ()
        {
            this.caption.retrieve('fxInstance').start({
                bottom: this.caption.getHeight() * -1,
                opacity: 0.5
            });
        },

        next: function ()
        {
            this.currentSlide += 1;

            if (this.currentSlide === this.totalSlides) {
                this.currentSlide = 0;
            }

            this.slide();
        },

        pause: function ()
        {
            window.clearInterval(this.interval);
            this.interval = null;
        },

        play: function ()
        {
            if (this.interval === null && this.isActive === true) {
                this.interval = this.next.periodical(this.options.interval, this);
            }
        },

        previous: function ()
        {
            if (this.options.autoPlay) {
                this.pause();
                if (!this.options.pauseOnHover) {
                    this.play();
                }
            }

            this.currentSlide -= 1;

            if (this.currentSlide < 0) {
                this.currentSlide = (this.totalSlides - 1);
            }

            this.slide();
        },

        setCurrentControlItem: function ()
        {
            var active = this.container.getElement('div.control-nav a.current');

            if (active) {
                active.removeClass('current');
            }

            this.container.getElements('div.control-nav a')[this.currentSlide].addClass('current');
        },

        showCaption: function ()
        {
            var title = this.currentImage.get('title');

            if (!title) {
                this.hideCaption();
                return;
            }

            this.setCaptionText(title);

            this.caption.retrieve('fxInstance').start({
                bottom: 0,
                opacity: 1
            });
        },

        slide: function (slideNo) {
            var coordinates,
                effect,
                slice,
                slices,
                styles,
                timeBuff;

            if (this.running) {
                return;
            }

            if (this.orientation === 'random') {
                this.orientation = ['horizontal', 'vertical'].getRandom();
            }

            this.arrangeSlices();

            if (slideNo !== undefined) {
                this.currentSlide = slideNo;
            }

            // set currentImage
            this.currentImage = this.children[this.currentSlide];

            // set current control nav item
            if (this.options.controlNav) {
                this.setCurrentControlItem();
            }

            this.setLink();

            // Process caption
            this.showCaption();

            var holderSize = this.holder.getSize();
            var holderImageSize = this.holderImage.getSize();
            var holderImagePosition = this.holderImage.getPosition(this.holder);

            var holderTop = holderImagePosition.y;
            var holderLeft = holderImagePosition.x;

            var holderRight = holderSize.x - (holderImagePosition.x + holderImageSize.x);
            var holderBottom = holderSize.y - (holderImagePosition.y + holderImageSize.y);

            slices = this.slices;
            timeBuff = 0;

            // reset slices
            this.slices.each(function (slice) {

                coordinates =  slice.retrieve('coordinates');

                slice.set('html', '');

                new Element('img', {
                    src : this.currentImage.get('src'),
                    styles : {
                        position : 'absolute',
                        left     : coordinates.left * -1,
                        top      : coordinates.top * -1,
                        width    : holderImageSize.x,
                        height   : holderImageSize.y
                    }
                }).inject(slice);

                slice.setStyles({
                    bottom: '',
                    height: coordinates.height,
                    left: coordinates.left + holderImagePosition.x,
                    opacity: 0,
                    right: '',
                    top: coordinates.top + holderImagePosition.y,
                    width: coordinates.width,
                    overflow: 'hidden'
                });

                var property = this.orientation === 'horizontal' ? 'width' : 'height';

                slice.setStyle(property, 0);
            }, this);

            // fire onStart function
            this.start();

            // Run effects
            this.running = true;

            effect = this.options.effect;

            if (effect === 'random') {
                effect = this.effects[this.orientation].getRandom();
            }

            // vertical effects
            if (['sliceDownRight', 'sliceDownLeft'].contains(effect)) {

                if (effect === 'sliceDownLeft') {
                    slices = slices.reverse();
                }

                slices.each(function (slice) {

                    slice.setStyle('top', holderTop);

                    this.animate.delay(
                        100 + timeBuff,
                        this,
                        [slice, {height: holderSize.y, opacity: 1}]
                    );

                    timeBuff += 50;

                }, this);

            } else if (['sliceUpRight', 'sliceUpLeft'].contains(effect)) {

                if (effect === 'sliceUpLeft') {
                    slices = slices.reverse();
                }

                slices.each(function (slice) {
                    //var fx = slice.retrieve('fxInstance');

                    slice.setStyle('bottom', holderBottom);

                    this.animate.delay(
                        100 + timeBuff,
                        this,
                        [slice, {height: holderSize.y, opacity: 1}]
                    );

                    timeBuff += 50;
                }, this);

            } else if (['sliceUpDownRight', 'sliceUpDownLeft'].contains(effect)) {

                if (effect === 'sliceUpDownLeft') {
                    slices = slices.reverse();
                }

                slices.each(function (slice, i) {
                    if (i % 2 === 0) {

                        slice.setStyle('top', holderTop);

                    } else {

                        slice.setStyles({
                            bottom : holderBottom
                        });
                    }

                    this.animate.delay(
                        100 + timeBuff,
                        this,
                        [slice, {height: holderSize.y, opacity: 1}]
                    );

                    timeBuff += 50;
                }, this);

            } else if (['wipeLeft', 'wipeRight'].contains(effect)) {

                    styles = {
                        height  : holderSize.y,
                        opacity : 1,
                        width   : 0
                    };

                    if (effect === 'wipeRight')
                    {
                        Object.append(styles, {
                            right : holderRight
                        });
                    }

                    slice = slices[0];
                    slice.setStyles(styles);

                    this.animate(slice, {
                        width: holderSize.x
                    }, true);

            } else if (['sliceLeftUp', 'sliceLeftDown', 'sliceRightDown', 'sliceRightUp'].contains(effect))
            {
                if (effect === 'sliceLeftUp' || effect === 'sliceRightUp') {
                    slices = slices.reverse();
                }

                if (effect === 'sliceRightDown' || effect === 'sliceRightUp') {

                    slices.setStyles({
                        right : holderRight
                    });

                } else {

                    slices.setStyles({
                        left  : holderLeft
                    });
                }

                slices.each(function (slice) {
                    this.animate.delay(
                        100 + timeBuff,
                        this,
                        [slice, {opacity: 1, width: holderSize.x}]
                    );

                    timeBuff += 50;
                }, this);

            } else if (['sliceLeftRightDown', 'sliceLeftRightUp'].contains(effect)) {

                if (effect === 'sliceLeftRightUp') {
                    slices = slices.reverse();
                }

                slices.each(function (slice, i) {

                    if (i % 2 === 0) {

                        slice.setStyles({
                            left  : holderLeft
                        });

                    } else {

                        slice.setStyles({
                            right : holderRight
                        });
                    }

                    this.animate.delay(
                        100 + timeBuff,
                        this,
                        [slice, {opacity: 1, width: holderSize.x}]
                    );

                    timeBuff += 50;
                }, this);

            } else if (['wipeDown', 'wipeUp'].contains(effect)) {

                styles = {
                    height  : 0,
                    opacity : 1,
                    width   : holderSize.x
                };

                if (effect === 'wipeUp')
                {
                    Object.append(styles, {
                        bottom : holderBottom
                    });
                }

                slice = slices[0];
                slice.setStyles(styles);

                this.animate(slice, {
                    height: holderSize.y
                }, true);

            } else if (['foldDown', 'foldLeft', 'foldRight', 'foldUp'].contains(effect)) {

                if (effect === 'foldUp' || effect === 'foldLeft') {
                    slices.reverse();
                }

                slices.each(function (slice) {
                    var fxStyles = {
                        opacity: 1
                    };

                    if (this.orientation === 'horizontal') {

                        fxStyles.height = slice.getHeight();

                        slice.setStyles({
                            height : 0,
                            width  : holderSize.x
                        });

                    } else {

                        fxStyles.width= slice.getWidth();

                        slice.setStyles({
                            height : holderSize.y,
                            width  : 0
                        });
                    }

                    this.animate.delay(100 + timeBuff, this, [slice, fxStyles]);
                    timeBuff += 50;
                }, this);

            } else {

                slice = slices[0];

                slice.setStyles({
                    height : holderSize.y,
                    width  : holderSize.x
                });

                this.animate(slice, {opacity: 1}, true);
            }
        },

        setBackgroundImage: function () {
            this.holderImage.set('src', this.currentImage.get('src'));

            var holderSize = this.holder.getSize(),
                imageSize  = this.holderImage.getSize();

            var left = (holderSize.x - imageSize.x) / 2;
            var top = (holderSize.y - imageSize.y) / 2;

            if (left < 0) {
                left = 0;
            }

            if (top < 0) {
                top = 0;
            }

            this.holderImage.setStyles({
                left : left,
                top  : top
            });
        },

        setCaptionText: function (text)
        {
            this.caption.set('text', text);
        },

        setLink: function ()
        {
            //Set active link
            var clone,
                imageParent = this.currentImage.getParent();

            if (imageParent.get('tag') === 'a') {
                clone = imageParent.clone(false).cloneEvents(imageParent);
                clone.replaces(this.linkHolder);
                this.linkHolder = clone;
                this.linkHolder.addClass('nivoo-link').setStyle('display', 'block');
            } else {
                this.linkHolder.setStyle('display', 'none');
            }
        },

        /**
         * Events
         */

        finish: function () {
            this.fireEvent('finish');
        },

        lastSlide: function () {
            this.fireEvent('lastSlide');
        },

        start: function () {
            this.fireEvent('start');
        }

    });
});