
var handlesSlider = (function() {
  function checkKey(key) {
    var keyCodes = [48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105,229]

    for(var i = 0, maxi = keyCodes.length; i < maxi; i++) {
      if(key == keyCodes[i]) return true;
    }
  }



  var init = function(options) {
    var options = $.extend({
      selector: 'range-slider',
      min: 2000,
      max: 10000,
      start: [4000, 8000],
      step: 100,
      snap: false,
      connect: true,
      inputs: [],
      format: {
        decimals: 0,
        thousand: ' ',
        postfix: ''
      }
    }, options);

    var Format = wNumb({
      decimals: options.format.decimals,
      thousand: options.format.thousand,
      postfix: options.format.postfix
    });
    var handlesSliderElm = document.getElementById(options.selector);

    noUiSlider.create(handlesSliderElm, {
      start: options.start,
      range: {
        'min': options.min,
        'max': options.max
      },
      step: options.step,
      snap: options.snap,
      connect: options.connect
    });

    if(options.inputs.length > 0) {
      handlesSliderElm.noUiSlider.on('update', function ( values, handle) {
        options.inputs[0].val(Format.to(Number(values[0])));
        options.inputs[1].val(Format.to(Number(values[1])));
      });

      $('[data-range]').on('keyup', function (e) {
        var keyVal = e.which || e.keyCode;
        var value = Number($(this).val());

        if (checkKey(keyVal)) {
          if(isNaN(value)) {
            value = Format.from($(this).val());
          }
          $(this).val(Format.to(value));
        }
      });

    }
  };
  return {
    init: init
  };
})();
