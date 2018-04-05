var filterBlock = (function() {
  /*Private*/

  var toggleSelectDropdown = function (select) {
    select.toggleClass('select-dropdown--active');
  };
  var selectItemDropdown = function (item) {
    var parent = item.parents('.select-dropdown');

    parent
      .find('.select-dropdown__checkin')
      .removeClass('select-dropdown__checkin--active');
    item.addClass('select-dropdown__checkin--active');
    parent
      .removeClass('select-dropdown--active')
      .find('.select-dropdown__text').text(item.text());
    parent
      .find('[data-sd="subparam"]')
      .val(item.data('subparam'));
  };
  var togglerItemDropdownfunction = function (item) {
    var parent = item.parents('.select-dropdown');

    item.siblings().removeClass('select-dropdown__toggler--active');
    item.addClass('select-dropdown__toggler--active');
    parent
      .find('[data-sd="mainparam"]')
      .val(item.data('mainparam'));
  };
  var toggleMobileSelect = function (item) {
    var parent = item.parents('.select-dropdown');

    parent
      .find('[data-select]')
      .removeClass('select-dropdown__row--active');
    parent
      .find('[data-select="' + item.val() + '"]')
      .addClass('select-dropdown__row--active');
  };
  var toggleFilter = function (options) {
    if ($('#navigation').attr('checked') && ($('#navigation').attr('checked') != 'undefined')) {
      $(options.selector).addClass('is-active');
    } else {
      $(options.selector).removeClass('is-active');
    }
  };
  var eventsListener = function (options) {
    $('.select-dropdown').on('click', function (e) {
      if($(e.target).hasClass('select-dropdown') || $(e.target).hasClass('select-dropdown__text') || $(e.target).hasClass('select-dropdown__select')) {
        toggleSelectDropdown($(this));
      }
      e.preventDefault();
    });
    $('.select-dropdown__checkin').on('click', function (e) {
      e.preventDefault();
      selectItemDropdown($(this));
    });
    $('.select-dropdown__toggler').on('click', function (e) {
      e.preventDefault();
      togglerItemDropdown($(this));
    });
    $('.select-dropdown__select').on('change', function (e) {
      toggleMobileSelect($(this));
    });
    $('#navigation').on('change', function (e) {
      $(options.selector).slideToggle();
    });
    $(window).on('load', function () {
      toggleFilter(options);
    });
  };
  /*Public*/
  var init = function(options) {
    var options = $.extend({
      selector: '.filter',
    }, options);

    toggleMobileSelect($('.select-dropdown__select'));
    eventsListener(options);
  };

  return {
    init: init
  };
})();
