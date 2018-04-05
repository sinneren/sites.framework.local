var sliderPro = (function() {
  var init = function(options) {
    var options = $.extend({
      selector: 'slider'
    }, options);

    $(options.selector).sliderPro({
      width: '100%',
      height: 800,
      autoplay: false,
      arrows: true,
      buttons: false,
      waitForLayers: true,
      autoScaleLayers: false
    });
  };
  return {
    init: init
  };
})();
