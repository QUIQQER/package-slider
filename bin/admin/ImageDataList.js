
/**
 * Slider image list for the administration
 *
 * @author www.pcsg.de (Henning Leutz)
 * @module package/quiqqer/slider/bin/admin/ImageDataList
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/buttons/Button
 * @require qui/controls/windows/Confirm
 * @require controls/projects/project/media/Popup
 * @require css!package/quiqqer/slider/bin/admin/ImageDataList.css
 */
define('package/quiqqer/slider/bin/admin/ImageDataList', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'qui/controls/windows/Confirm',
    'controls/projects/project/media/Popup',
    'Locale',

    'css!package/quiqqer/slider/bin/admin/ImageDataList.css'

], function(QUI, QUIControl, QUIButton, QUIConfirm, MediaWindow, QUILocale)
{
    "use strict";

    var lg = 'quiqqer/slider';

    return new Class({

        Extends : QUIControl,
        Type : 'package/quiqqer/slider/bin/admin/ImageDataList',

        Binds : [
            'openAddWindow',
            '$onImport',
            '$onInject',
            '$removeData'
        ],

        initialize : function(options)
        {
            this.parent(options);

            this.$Input     = null;
            this.$Container = null;
            this.$Buttons   = null;
            this.$Project   = null;
            this.$Message   = null;

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
                               QUILocale.get(lg, 'imageDataList.text.no.images') +
                           '</div>'+
                       '</div>'+
                       '<div class="quiqqer-slider-imageDataList-buttons"></div>'
            });

            this.$Container = this.$Elm.getElement('.quiqqer-slider-imageDataList-container');
            this.$Buttons   = this.$Elm.getElement('.quiqqer-slider-imageDataList-buttons');
            this.$Message   = this.$Elm.getElement('.quiqqer-slider-imageDataList-container-message');

            this.$elements.AddButton = new QUIButton({
                text : QUILocale.get(lg, 'imageDataList.btn.add'),
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

            if (this.$Project) {
                this.$elements.AddButton.enable();
            }

            return this.$Elm;
        },

        /**
         * Set the project
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

            if (typeOf(Project) != 'object' && typeOf(Project) != 'string') {
                console.error('No classes/projects/Project or object given');
                return;
            }

            require(['Projects'], function(Projects) {
                this.$Project = Projects.get(Project);
                this.$elements.AddButton.enable();
            }.bind(this));
        },

        /**
         * Add an image - opens the dialog
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
         * Set the data to the input node
         */
        $refreshData : function()
        {
            var data = [],
                elements = this.$Container.getElements(
                    '.quiqqer-slider-imageDataList-entry'
                );

            for (var i = 0, len = elements.length; i < len; i++) {
                data.push(this.$getDataFromEntry(elements[i]));
            }

            this.$Input.value = JSON.encode(data);
        },

        /**
         * Add a new image
         *
         * @param {String} imageSrc
         * @param {String} [link]
         * @param {String} [text]
         */
        addData : function(imageSrc, link, text)
        {
            return new Promise(function(resolve, reject)
            {
                this.$Message.setStyle('display', 'none');

                var Entry = new Element('div', {
                    'class' : 'quiqqer-slider-imageDataList-entry',
                    html : '<div class="quiqqer-slider-imageDataList-entry-image"></div>' +
                           '<div class="quiqqer-slider-imageDataList-entry-text"></div>' +
                           '<div class="quiqqer-slider-imageDataList-entry-link"></div>' +
                           '<div class="quiqqer-slider-imageDataList-entry-edit"></div>'
                }).inject(this.$Container);

                var Edit = Entry.getElement('.quiqqer-slider-imageDataList-entry-edit');

                new QUIButton({
                    icon : 'fa fa-edit',
                    title : QUILocale.get(lg, 'imageDataList.btn.edit.title'),
                    events : {
                        onClick : function() {
                            this.$editData(Entry);
                        }.bind(this)
                    }
                }).inject(Edit);

                new QUIButton({
                    icon : 'fa fa-trash',
                    title : QUILocale.get(lg, 'imageDataList.btn.del.title'),
                    events : {
                        onClick : function() {
                            this.$removeData(Entry);
                        }.bind(this)
                    }
                }).inject(Edit);


                if (typeof text !== 'undefined')
                {
                    this.$setData(Entry, {
                        image : imageSrc,
                        text  : text,
                        link  : link
                    });

                    this.$refreshData();

                    resolve();

                    return;
                }


                require(['Ajax', 'qui/utils/String'], function(Ajax, QUIStringUtils)
                {
                    var data = QUIStringUtils.getUrlParams( imageSrc );

                    if ( "project" in data && "id" in data ) {

                        Ajax.get('ajax_media_get', function(imageData)
                        {
                            if (!imageData) {
                                reject();
                                return;
                            }

                            this.$setData(Entry, {
                                image : imageSrc,
                                text  : imageData.file.short,
                                link  : link || ''
                            });

                            this.$refreshData();

                            resolve();

                        }.bind(this), {
                            fileid  : data.id,
                            project : data.project,
                            onError : reject
                        });

                        return;
                    }

                    reject();

                }.bind(this));

            }.bind(this));
        },

        /**
         * edit an image data entry
         * opens the edit dialog
         *
         * @param {HTMLElement} Entry
         */
        $editData : function(Entry)
        {
            new QUIConfirm({
                title     : 'Bilddaten bearbeiten',
                maxWidth  : 750,
                maxHeight : 500,
                autoclose : false,
                events :
                {
                    onOpen : function(Win)
                    {
                        Win.Loader.show();

                        var Content = Win.getContent();

                        require([
                            'text!package/quiqqer/slider/bin/admin/ImageDataListEdit.html',
                            'utils/Controls',
                            'qui/utils/Form'
                        ], function(result, UtilsControls, QUIUtilsForm)
                        {
                            Content.set('html', result);

                            var data    = this.$getDataFromEntry(Entry),
                                Preview = Content.getElement('.imageDataList-edit-preview');

                            QUIUtilsForm.setDataToForm(
                                data,
                                Content.getElement('form')
                            );

                            Preview.set({
                                html : '<img src="'+ URL_DIR + data.image +'&quiadmin=1&maxwidth=340&maxheight=150" />'
                            });

                            UtilsControls.parse(Content).then(function()
                            {
                                var Control = QUI.Controls.getById(
                                    Content.getElement('.qui-controls-project-media-input')
                                           .get('data-quiid')
                                );

                                Control.addEvent('onChange', function(Input, value) {
                                    Preview.set({
                                        html : '<img src="'+ URL_DIR + value +'&quiadmin=1&maxwidth=340&maxheight=150" />'
                                    });
                                });

                                Win.Loader.hide();
                            });

                        }.bind(this));

                    }.bind(this),

                    onSubmit : function(Win)
                    {
                        Win.Loader.show();

                        require(['qui/utils/Form'], function(QUIUtilsForm)
                        {
                            var data = QUIUtilsForm.getFormData(
                                Win.getContent().getElement('form')
                            );

                            this.$setData(Entry, data);
                            this.$refreshData();

                            Win.close();

                        }.bind(this));

                    }.bind(this)
                }
            }).open();
        },

        /**
         * Remove an image data node
         *
         * @param {HTMLElement} Entry
         */
        $removeData : function(Entry)
        {
            new QUIConfirm({
                title : QUILocale.get(lg, 'imageDataList.window.remove.title'),
                text  : QUILocale.get(lg, 'imageDataList.window.remove.text'),
                information  : QUILocale.get(lg, 'imageDataList.window.remove.information'),
                maxWidth  : 450,
                maxHeight : 300,
                Entry : Entry,
                events :
                {
                    onSubmit : function(Win) {
                        Win.getAttribute('Entry').destroy();
                        this.$refreshData();
                    }.bind(this)
                }
            }).open();
        },

        /**
         * Set the data for an image entry
         *
         * @param {HTMLDivElement} Entry
         * @param {Object} data
         */
        $setData : function(Entry, data)
        {
            var Img  = Entry.getElement('.quiqqer-slider-imageDataList-entry-image');
            var Text = Entry.getElement('.quiqqer-slider-imageDataList-entry-text');
            var Link = Entry.getElement('.quiqqer-slider-imageDataList-entry-link');

            // image
            Img.set('html', '');

            var imageSrc = data.image;
            var originalSrc = imageSrc;

            if (imageSrc.match('image.php')) {
                imageSrc = imageSrc +'&quiadmin=1&maxwidth=40&maxheight=40';
            }

            new Element('img', {
                src             : URL_DIR + imageSrc,
                'data-original' : originalSrc
            }).inject( Img );


            // text
            Text.set('html', data.text || '&nbsp;');


            // link
            Link.set('html', data.link || '');
        },

        /**
         * Return the data from an image entry
         *
         * @param Entry
         * @returns {{image: *, text: *, link: *}}
         */
        $getDataFromEntry : function(Entry)
        {
            var Text  = Entry.getElement('.quiqqer-slider-imageDataList-entry-text');
            var Link  = Entry.getElement('.quiqqer-slider-imageDataList-entry-link');

            return {
                image : Entry.getElement('img').get('data-original'),
                text  : Text.get('html').trim(),
                link  : Link.get('html').trim()
            };
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

            var data = [];

            if (this.$Input.value !== '') {
                data = JSON.decode(this.$Input.value);
            }

            for (var i = 0, len = data.length; i < len; i++) {
                this.addData(
                    data[i].image,
                    data[i].link,
                    data[i].text
                );
            }
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