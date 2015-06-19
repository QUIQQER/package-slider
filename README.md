
QUIQQER Slider
========

Das Paket stellt mehrere Slider für QUIQQER zur Verfügung.

Packetname:

    quiqqer/slider


Features
--------

- Einzelne Bilder können in die Slider gesetzt werden
- Für jedes Bild kann ein Link gesetzt werden
- Verschiedenen Slider Arten und Effekte
 
     
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

Der Paketname ist: quiqqer/slider


Mitwirken
----------

- Issue Tracker: https://dev.quiqqer.com/quiqqer/package-slider/issues
- Source Code: https://dev.quiqqer.com/quiqqer/package-slider


Support
-------

Falls Sie ein Fehler gefunden haben oder Verbesserungen wünschen,
Dann können Sie gerne an support@pcsg.de eine E-Mail schreiben.


License
-------


Entwickler
--------

Das Paket bringt ein Slider Control und Brick mit.

JavaScript

```javascript

require(['package/quiqqer/slider/bin/Slider'], function(Slider) {

    new Slider({
        type      : 'nivo'
        autostart : true
    }).inject(Container);

});

```

PHP

```php
<?php

$Slider = new QUI\Slider\Controls\Slider();
$Nivo = new QUI\Slider\Controls\SliderNivo();

?>
```
