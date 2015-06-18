<?php

/**
 * This file contains QUI\Slider\Controls\Slider
 */
namespace QUI\Slider\Controls;

use QUI;
use QUI\Projects\Media\Utils;
use QUI\Projects\Site\Utils as SiteUtils;

/**
 * Class Slider
 *
 * @package QUI\Slider\Controls
 * @author  www.pcsg.de (Henning Leutz)
 */
class Slider extends QUI\Control
{
    /**
     * Image data list
     *
     * @var array
     */
    protected $_data = array();

    /**
     * internal image parsing flag
     *
     * @var bool
     */
    protected $_imagesParsing = false;

    /**
     * @var array
     */
    protected $_settings = array();

    /**
     * constructor
     *
     * @param Array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'title'     => '',
            'text'      => '',
            'class'     => 'quiqqer-slider',
            'nodeName'  => 'section',
            'qui-class' => 'package/quiqqer/slider/bin/Slider'
        ));

        $this->addCSSFile(
            dirname(__FILE__).'/Slider.css'
        );

        $this->addCSSFile(
            OPT_DIR.'quiqqer/gallery/lib/QUI/Gallery/Controls/Slider.css'
        );

        $this->_settings = array(
            'autostart',
            'shadow',
            'showControlsAlways',
            'showTitleAlways',
            'period',
            'type'
        );


        parent::setAttributes($attributes);

        $this->setAttribute('type', 'standard');
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        if (!$this->_imagesParsing && $this->getAttribute('images')) {

            $images = json_decode($this->getAttribute('images'), true);

            foreach ($images as $image) {

                $this->addImage(
                    $image['image'],
                    $image['link'],
                    $image['text']
                );
            }
        }

        foreach ($this->_settings as $setting) {
            $this->setAttribute('data-'.$setting, $this->getAttribute($setting));
        }

        $Engine->assign(array(
            'this'  => $this
        ));


        return $Engine->fetch(dirname(__FILE__).'/Slider.html');
    }

    /**
     * Add an image to the slider
     *
     * @param string      $imagePath
     * @param string|bool $link
     * @param string|bool $text
     */
    public function addImage($imagePath, $link = false, $text = false)
    {
        try {
            $Image = Utils::getImageByUrl($imagePath);
        } catch (QUI\Exception $Exception) {
            return;
        }

        if (!$Image->isActive()) {
            return;
        }

        try {

            if (SiteUtils::isSiteLink($link)) {
                $link = SiteUtils::rewriteSiteLink($link);
            }

        } catch (QUI\Exception $Exception) {

            QUI\System\Log::addDebug('##################');
            QUI\System\Log::addDebug($link);
            QUI\System\Log::addDebug($Exception->getMessage());

            if (!is_string($link)) {
                $link = false;
            }
        }

        $this->_data[] = array(
            'link'  => $link,
            'text'  => $text,
            'image' => $Image
        );
    }

    /**
     * Return the slider image data entries
     *
     * @return array
     */
    public function getList()
    {
        return $this->_data;
    }

    /**
     * Return only the slider images
     *
     * @return array
     */
    public function getImages()
    {
        $images = array();

        foreach ($this->_data as $data) {
            $images[] = $data['image'];
        }

        return $images;
    }
}
