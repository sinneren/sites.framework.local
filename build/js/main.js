const AppConfig = {
    breakPointTable: 900,
    breakPointPhone: 600,
    modalWidth: 900,
    imagePath: '/img/'
};

$(function() {
    $('.select, .select-helper').select2({
        minimumResultsForSearch: Infinity
    });

    $('body').on('click', '[data-modal]', function (e) {
        $(this).modal({
            closeExisting: true,
            escapeClose: true,
            clickClose: true,
            closeText: 'Close',
            closeClass: '',
            showClose: true,
            modalClass: "modal",
            blockerClass: "modal",
            spinnerHtml: null,
            showSpinner: true,
            fadeDuration: null,
            fadeDelay: 1.0
        });
        return false;
    });

    $('.header__menu-btn, .header__close').on('click', function (e) {
       $('.header').toggleClass('header--mobile');
    });
    $('.header__filter-btn').on('click', function (e) {
       $('.filter').toggleClass('filter--mobile');
    });
});
