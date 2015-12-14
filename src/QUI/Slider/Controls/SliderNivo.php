<?php

/**
 * This file contains QUI\Slider\Controls\SliderNivo
 */
namespace QUI\Slider\Controls;

use QUI;

/**
 * Class SliderNivo
 *
 * @package QUI\Slider\Controls
 * @author  www.pcsg.de (Henning Leutz)
 */
class SliderNivo extends Slider
{
    /**
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        parent::__construct($attributes);

        $this->setAttribute('type', 'nivo');

        $this->settings = array(
            'effect',
            'group',
            'animspeed',
            'autostart',
            'shadow',
            'showControlsAlways',
            'showTitleAlways',
            'period',
            'type',
            'controlsPosition',
            'slices'
        );
    }
}
