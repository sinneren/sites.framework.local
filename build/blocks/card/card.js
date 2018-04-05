var card = (function() {
  /*Private methods*/
  var compareCard = function (self) {
    var stateObject = $(self).find('.card__compare-state');
    $.each( stateObject, function(key, object) {
      $(object).toggleClass('is-visible').toggleClass('is-hidden');
    });
  };
  var eventListener = function () {
    $(document).on('click', '.card__compare', function (e) {
      compareCard(e.currentTarget);
    });
  };
  /*Public methods*/
  var init = function (options) {
    var options = $.extend({
      selector: '.card',
    }, options);
    eventListener();
  };
  return {
    init: init
  };
})();
