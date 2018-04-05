var mapYandex = (function() {
  /*Private methods*/
  var placemarks = {
    "type": "FeatureCollection",
    "features": []
  };
  Array.prototype.inArray = function(comparer) {
    for(var i=0; i < this.length; i++) {
        if(comparer(this[i])) return true;
    }
    return false;
  };
  Array.prototype.pushIfNotExist = function(element, comparer) {
    if (!this.inArray(comparer)) {
        this.push(element);
    }
  };

  /*Public methods*/
  var init = function(options) {
    var options = $.extend({
      selector: 'map',
      coords: [55.76, 37.64],
      zoom: 10,
      addedIds: [],
      data: [],
      controls: ['zoomControl','fullscreenControl','rulerControl']
    }, options);

    function ymapInit() {
      /*Initializations*/
      var map = new ymaps.Map(options.selector, {
        center: options.coords,
        zoom: options.zoom,
        controls: options.controls,
        margin: 200
      });
      var bounder = ymaps.util.bounds;
      /*Templates*/
      var clusterIcons = [
        {
          href: '/img/cluster.svg',
          size: [48, 48],
          offset: [-24, -24]
        }
      ];
      var customClusterIconLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="cluster-icon">$[properties.geoObjects.length]</div>'
      );
      var customPlacemarkLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="placemark-icon"></div>'
      );
      var customBalloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="balloon-wrapper">$[[options.contentLayout observeSize ]]</div>', {
          build: function() {
            this.constructor.superclass.build.call(this);
            this._$element = $('.balloon-wrapper', this.getParentElement());
            this.applyElementOffset();
            this._$element
              .find('.balloon__close')
              .on('click', $.proxy(this.onCloseClick, this));
          },
          clear: function() {
            this._$element.find('.balloon__close').off('click');
            this.constructor.superclass.clear.call(this);
          },
          onSublayoutSizeChange: function() {
            customBalloonLayout.superclass.onSublayoutSizeChange
              .apply(this, arguments);
            if (!this._isElement(this._$element)) {
              return;
            }
            this.applyElementOffset();
            this.events.fire('shapechange');
          },
          applyElementOffset: function() {
            this._$element.css({
              left: 0,
              top: 0
            });
          },
          onCloseClick: function(e) {
            e.preventDefault();
            this.events.fire('userclose');
          },
          getShape: function() {
            if (!this._isElement(this._$element)) {
              return customBalloonLayout.superclass.getShape.call(this);
            }
            var position = this._$element.position();

            return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
              [position.left, position.top],
                [
                  position.left + this._$element[0].offsetWidth,
                  position.top + this._$element[0].offsetHeight
                ]
              ]
            ));
          },
          _isElement: function(element) {
            return element && element[0];
          }
        }
      );
      var customBalloonContentLayout = ymaps.templateLayoutFactory.createClass([
          '<div class="balloon"> \
            <div class="balloon__close"></div> \
            <a href="{{ properties.link }}" style="background-image: url({{ properties.pic }})" class="balloon__pic"> \
              <div class="balloon__overlay"></div> \
            </a> \
            <div class="balloon__property"> \
              <div class="balloon__property-item balloon__price">{{ properties.cost }}<span class="roub-sign">&nbsp;{{ properties.currency }}</span></div> \
              <div class="balloon__property-item">Общая площадь, &mdash; {{ properties.square }} м²</div> \
              <div class="balloon__property-item">Количество комнат, &mdash; {{ properties.rooms }}</div> \
              <div class="balloon__property-item balloon__address">{{ properties.address }}</div> \
            </div> \
          </div>'
        ].join('')
      );
      var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
       // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
       '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>'
      );

      /*Map controls and events*/
      map.behaviors.disable('scrollZoom');
      map.behaviors.disable('multiTouch');

      /*Object manager and clusterization*/
      var objectManager = new ymaps.ObjectManager({
        clusterize: true,
        clusterDisableClickZoom: false,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: customBalloonContentLayout,
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 280,
        clusterBalloonContentLayoutHeight: 360,
        clusterBalloonPagerSize: 5,
      });
      objectManager.objects.options.set({
        iconLayout: customPlacemarkLayout,
        iconShape: {
          type: 'Rectangle',
          coordinates: [
            [0, 0], [50, 50]
          ],
        },
        iconOffset: [-25, -25],
        balloonLayout: customBalloonLayout,
        balloonContentLayout: customBalloonContentLayout,
        balloonPanelMaxMapArea: 0,
        balloonOffset: [-224, -25],
      });
      objectManager.clusters.options.set({
        clusterIcons: clusterIcons,
        clusterIconContentLayout: customClusterIconLayout,
      });

      var jqxhr = $.getJSON( options.objectsUrl + map.getBounds().join(), {
        format: 'json'
      })
        .done(function( json ) {
          $.each(json.items, function ( i, item ) {
            var placemark = {
              type: 'Feature',
              id: i,
              geometry: {
                type: 'Point',
                coordinates: item,
              },
              properties: {
                placemarkId: i
              }
            };

            placemarks.features.pushIfNotExist(placemark, function (e) {
              return e.id === placemark.id;
            });
          });

          objectManager.add(placemarks);
          map.geoObjects.add(objectManager);
          $(options.container).prepend('<div id="map-counter" class="map-counter"></div>');
          $(options.counterContainer).text('Показано ' + placemarks.features.length + ' из ' + json.total);
        });
      // Moving map
      map.events.add('boundschange', function () {
        var jqxhr = $.getJSON( options.objectsUrl + map.getBounds().join(), {
          format: 'json'
        })
          .done(function( json ) {
            $.each(json.items, function ( i, item ) {
              var placemark = {
                type: 'Feature',
                id: i,
                geometry: {
                  type: 'Point',
                  coordinates: item,
                },
                properties: {
                  placemarkId: i
                }
              };

              placemarks.features.pushIfNotExist(placemark, function (e) {
                return e.id === placemark.id;
              });
            });
            objectManager.add(placemarks);
            //map.geoObjects.add(objectManager);
            $(options.counterContainer).text('Показано ' + placemarks.features.length + ' из ' + json.total);
          });
      });
      // Check data
  		function hasBalloonData(objectId) {
  			return objectManager.objects.getById(objectId).properties.balloonContent;
  		}
      // Get object by id and set to collection
      function setBalloonData(objectId) {
        if (!hasBalloonData(objectId)) {
          var jqxhrObjectData = $.getJSON( options.detailsUrl + objectId, {
            format: 'json'
          })
            .done(function( json ) {
              var object = objectManager.objects.getById(objectId);
              object.properties = {
                address: json[objectId].name,
                pic: json[objectId].photo,
                balloonContentBody: json[objectId].name
              }
              var objectState = objectManager.getObjectState(objectId);
              if (!objectState.isClustered) {
                objectManager.objects.balloon.open(objectId);
              } else {
                objectManager.clusters.balloon.open(objectState.cluster.id);
              }
            });
        }
      };
      objectManager.objects.events.add('click', function (e) {
        var objectId = e.get('objectId');
        setBalloonData(objectId);
      });
      objectManager.clusters.events.add('click', function (e) {
        var objectId = e.get('objectId');
      });
      //Monitor cluster changes
      var activeObjectMonitor = new ymaps.Monitor(objectManager.clusters.state);
      activeObjectMonitor.add('activeObject', function () {
  			var objectId = activeObjectMonitor.get('activeObject').id;
  			setBalloonData(objectId);
  		});
    };
    ymaps.ready(ymapInit);
  };
  return {
    init: init
  };
})();
