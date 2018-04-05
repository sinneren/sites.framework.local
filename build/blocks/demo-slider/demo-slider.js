var slides = (function() {
  /*Private*/
  var elements = {
    progressbar: '.demo-slider__progress',
    progressbarPlane: '.demo-slider__progress-plane',
    slide: '.demo-slider__slide',
    container: '.demo-slider__container',
    texts: '.demo-slider__texts',
    prevButton: '.demo-slider__prev',
    nextButton: '.demo-slider__next',
    activeClass: 'demo-slider__slide--active'
  };
  var globalOptions = {
    drag: false,
    dragRatio: 30
  };
  jQuery.fn.outerHTML = function() {
    return jQuery('<div />').append(this.eq(0).clone()).html();
  };
  var changeSlide = function (options) {
    $(elements.container).css({
      'transform' : 'translate3d(' + options.currentIndex * $(elements.container).width() * -1 + 'px, 0, 0)'
    });
    $(elements.container).find(elements.slide).removeClass(elements.activeClass);
    $(elements.container).find(elements.slide).eq(options.currentIndex).toggleClass(elements.activeClass);
  };
  var progress = function (options) {
    $(elements.progressbarPlane).stop(true, true).width(0).animate({
      'width' : '+=' + $(elements.progressbar).width()
    }, options.speed)
  };
  var autoplay = function (options) {
    progress(options);
    globalOptions.autoplayTimer = setTimeout(function autoplay() {
      if (options.autoplay) {
        progress(options);
      }
      if (parseInt(options.currentIndex * -1) === parseInt($(elements.slide).length - 1)) {
        options.currentIndex = 0;
        changeSlide(options);
      } else {
        options.currentIndex -=1;
        changeSlide(options);
      }
      setTimeout(autoplay, options.speed);
    }, options.speed);
  };
  var load = function (options) {
    globalOptions.baseSlides = $(elements.slide).clone();
    if (options.autoplay) {
      $(elements.progressbar).append('<div class="demo-slider__progress-plane"></div>');
    }
    $(elements.progressbarPlane).stop(true, true).width(0);
    $(elements.slide)
      .eq(options.currentIndex)
      .toggleClass(elements.activeClass)
    if (options.currentIndex === 0) {
      $(elements.prevButton).toggleClass('is-disabled');
    }
    $(elements.container).css({
        'transition-duration' : options.duration + 'ms',
        'transform' : 'translate3d(' + options.currentIndex * $(elements.slide).width() + ', 0, 0)'
    });
    $(elements.progressbar).css({
      'top' : $(elements.slide).eq(options.currentIndex).find(elements.texts).outerHeight()
    });
  };
  var eventsListener = function (options) {
    $(elements.prevButton).on('click', function () {
      if (options.autoplay) {
        clearInterval(globalOptions.autoplayTimer)
      }
      $(elements.nextButton).removeClass('is-disabled');
      if (parseInt(options.currentIndex) === 0) {
        return false;
      } else {
        options.currentIndex += 1;
        changeSlide(options);
        if (parseInt(options.currentIndex) === 0) {
          $(this).toggleClass('is-disabled');
        }
      }
    });
    $(elements.nextButton).on('click', function () {
      if (options.autoplay) {
        clearInterval(globalOptions.autoplayTimer)
      }
      $(elements.prevButton).removeClass('is-disabled');
      if (parseInt($(elements.container).find(elements.slide).length * -1) === parseInt(options.currentIndex - 1)) {
        return false;
      } else {
        if (parseInt($(elements.container).find(elements.slide).length * -1) === parseInt(options.currentIndex - 2)) {
          $(this).toggleClass('is-disabled');
        }
        options.currentIndex -= 1;
        changeSlide(options);
      }
    });
    $('body').on('mousedown', elements.slide, function (e) {
      globalOptions.drag = true;
      globalOptions.dragStart = e.clientX;
    });
    $('body').on('mouseup', elements.slide, function (e) {
      if (globalOptions.drag) {
        globalOptions.dragFinish = e.clientX;
        if ( (globalOptions.dragFinish > globalOptions.dragStart) && ((globalOptions.dragFinish - globalOptions.dragStart) > globalOptions.dragRatio) ) {
          if (parseInt(options.currentIndex * -1) === 0) {
            if (options.loop) {
              globalOptions.baseSlides.each(function(indx, element) {
                $(elements.container).append($(element).outerHTML());
              });
              options.currentIndex = globalOptions.baseSlides.length - 2;
              console.log(options.currentIndex);
              changeSlide(options);
            } else {
              options.currentIndex = parseInt($(elements.container).find(elements.slide).length * -1 + 1);
              changeSlide(options);
            }
          } else {
            options.currentIndex +=1;
            changeSlide(options);
          }
        } else if ( (globalOptions.dragFinish < globalOptions.dragStart) && ((globalOptions.dragStart - globalOptions.dragFinish) > globalOptions.dragRatio) ) {
          if (parseInt(options.currentIndex * -1) === parseInt($(elements.container).find(elements.slide).length - 1)) {
            options.currentIndex = 0;
            changeSlide(options);
          } else {
            options.currentIndex -=1;
            changeSlide(options);
            if (options.loop) {
              if ((options.currentIndex * -1) === ($(elements.container).find(elements.slide).length - 1)) {
                globalOptions.baseSlides.each(function(indx, element) {
                  $(elements.container).append($(element).outerHTML());
                });
              }
            }
          }
        }
      }
      globalOptions.drag = false;
    });
    // $(elements.slide).on('mousemove', function (e) {
    //
    // });
  };
  /*Public*/
  var init = function (options) {
    var options = $.extend({
      selector: '.demo-slider',
      duration: 300,
      speed: 3600,
      progressStep: 200,
      currentIndex: 0,
      autoplay: false,
      loop: true
    }, options);

    load(options);
    eventsListener(options);
    if (options.autoplay) {
      autoplay(options);
    }
  };
  return {
    init: init
  }
})();
