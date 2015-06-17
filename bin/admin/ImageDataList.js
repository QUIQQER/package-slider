
/**
 * Admin Slider image list
 *
 * @author www.pcsg.de (Henning Leutz)
 * @module package/quiqqer/slider/bin/admin/ImageDataList
 */
define('package/quiqqer/slider/bin/admin/ImageDataList', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'controls/projects/project/media/Popup',

    'css!package/quiqqer/slider/bin/admin/ImageDataList.css'

], function(QUI, QUIControl, QUIButton, MediaWindow)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type : 'package/quiqqer/slider/bin/admin/ImageDataList',

        Binds : [
            'openAddWindow',
            '$onImport',
            '$onInject'
        ],

        initialize : function(options)
        {
            this.parent(options);

            this.$Input     = null;
            this.$Container = null;
            this.$Buttons   = null;
            this.$Project   = null;

            this.$elements = {};

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
                html : '<div class="quiqqer-slider-imageDataList-container">'+
                           '<div class="quiqqer-slider-imageDataList-container-message">'+
                               'Keine Bilder eingetragen'+
                           '</div>'+
                       '</div>'+
                       '<div class="quiqqer-slider-imageDataList-buttons"></div>'
            });

            this.$Container = this.$Elm.getElement('.quiqqer-slider-imageDataList-container');
            this.$Buttons   = this.$Elm.getElement('.quiqqer-slider-imageDataList-buttons');

            this.$elements.AddButton = new QUIButton({
                text : 'Bild hinzufügen',
                disabled : true,
                events : {
                    onClick : this.openAddWindow
                },
                styles : {
                    width: '100%'
                }
            }).inject(this.$Buttons);

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            return this.$Elm;
        },

        /**
         *
         * @param {Object|String} Project - classes/projects/Project | Project name
         */
        setProject : function(Project)
        {
            if (typeOf(Project) == 'classes/projects/Project') {
                this.$Project = Project;
                this.$elements.AddButton.enable();
                return;
            }

            require(['Projects'], function(Projects) {
                this.$Project = Projects.get(Project);
                this.$elements.AddButton.enable();
            }.bind(this));
        },

        /**
         *
         */
        openAddWindow : function()
        {
            if (!this.$Project) {
                return;
            }

            new MediaWindow({
                project  : this.$Project.getName(),
                events : {
                    onSubmit : function(Win, data) {
                        this.addData(data.url);
                    }.bind(this)
                }
            }).open();
        },

        /**
         *
         * @param {String} imageSrc
         * @param {String} link
         * @param {String} text
         */
        addData : function(imageSrc, link, text)
        {
            this.getElm().getElement(
                '.quiqqer-slider-imageDataList-container-message'
            ).setStyle('display', 'none');

            var Entry = new Element('div', {
                'class' : 'quiqqer-slider-imageDataList-entry',
                html : '<div class="quiqqer-slider-imageDataList-entry-image"></div>' +
                       '<div class="quiqqer-slider-imageDataList-entry-text"></div>' +
                       '<div class="quiqqer-slider-imageDataList-entry-link"></div>' +
                       '<div class="quiqqer-slider-imageDataList-entry-edit"></div>'
            }).inject(this.$Container);

            var Img  = Entry.getElement('.quiqqer-slider-imageDataList-entry-image');
            var Text = Entry.getElement('.quiqqer-slider-imageDataList-entry-text');
            var Link = Entry.getElement('.quiqqer-slider-imageDataList-entry-link');
            var Edit = Entry.getElement('.quiqqer-slider-imageDataList-entry-edit');

            if (imageSrc.match('image.php')) {
                imageSrc = imageSrc +'&quiadmin=1&maxwidth=40&maxheight=40';
            }

            new Element('img', {
                src : URL_DIR + imageSrc
            }).inject( Img );

            Text.set('html', text || '&nbsp;');
            Link.set('html', link || '&nbsp;');

            new QUIButton({
                icon : 'icon-edit',
                events : {
                    onClick : function() {

                    }
                }
            }).inject(Edit);

            new QUIButton({
                icon : 'icon-trash',
                events : {
                    onClick : function() {

                    }
                }
            }).inject(Edit);
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
        }
    });
});