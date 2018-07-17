![QUIQQER Slider](bin/images/Readme.jpg)

QUIQQER Slider
========

The package provides multiple slider for QUIQQER.

Package name:

    quiqqer/slider


Features
--------

- Single pictures can be put in the slider
- A hyperlink can be set for each picture
- Different slider types and effects:
 
     
    - Standard Slider
    - Nivo Slider
        - Fade
        - Fold
        - Zufällig
        - sliceLeftDown
        - sliceLeftUp
        - sliceLeftRightDown
        - sliceLeftRightUp
        - sliceRightDown
        - sliceRightUp
        - wipeDown
        - wipeUp
        - sliceDownLeft
        - sliceDownRight
        - sliceUpDownLeft
        - sliceUpDownRight
        - sliceUpLeft
        - sliceUpRight
        - wipeLeft
        - wipeRight


Installation
------------

The package name is: quiqqer/slider


Contribute
----------

- Issue Tracker: https://dev.quiqqer.com/quiqqer/package-slider/issues
- Source Code: https://dev.quiqqer.com/quiqqer/package-slider
- Wiki: https://dev.quiqqer.com/quiqqer/package-slider/wikis/home


Support
-------

If you found any flaws, have any wishes or suggestions you can send an email
to [support@pcsg.de](mailto:support@pcsg.de) to inform us about your concerns. 
We will try to respond to your request and forward it to the responsible developer.


License
-------


Usage
--------

The package provides a slider-control and -brick.

JavaScript:
```javascript
require(['package/quiqqer/slider/bin/Slider'], function(Slider) {

    new Slider({
        type      : 'nivo',
        autostart : true
    }).inject(Container);

});
```

PHP:
```php
<?php

$Slider = new QUI\Slider\Controls\Slider();
$Nivo = new QUI\Slider\Controls\SliderNivo();

?>
```
