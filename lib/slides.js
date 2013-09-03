/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 9/1/13
 * Time: 9:54 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    function changeIFrame(el) {
        var me = changeIFrame;

        // ********* iFrame *********
        // remove old frames' src
        me.old && me.old.each(function (index, iframe) {
            iframe.src = "";
        });

        // check if the element has iframes
        me.current = el.find('iframe.demo-iframe');
        me.current.each(function (index, iframe) {
            iframe.src = $(iframe).data('src');
            iframe.width = window.innerWidth;
            iframe.height = window.innerHeight;
        });

        me.old = me.current;
    }

    $(window).on('hashchange', function () {
        var id = window.location.hash.substr(2);
        var el = $('#' + id);

        // iframe
        changeIFrame(el);
    });
    $(window).trigger('hashchange');

    // keys
    function getWindowIFrame() {
        var iFrame = changeIFrame.current && changeIFrame.current[0] &&
            changeIFrame.current[0].contentWindow;
        return iFrame || null;
    }

    document.addEventListener('keydown', function (e) {
        var w = getWindowIFrame(),
            key = e.keyCode;
        w && w.T3 && (w.T3.Keyboard.keys[key] = true);
    }, false);

    document.addEventListener('keyup', function (e) {
        var w = getWindowIFrame(),
            key = e.keyCode;
        w && w.T3 && (w.T3.Keyboard.keys[key] = false);
    }, false);

    // data-x next
    (function () {
        var x = 0, y = 0, z = 0,
            mx = 1000, my = 1000, mz = 1000,
            options = {
                px: function () { x += mx; },
                nx: function () { x -= mx; },
                py: function () { y += my; },
                ny: function () { y -= my; },
                pz: function () { z += mz; },
                nz: function () { z -= mz; },

                // reset
                rx: function () {x = 0;},
                ry: function () {y = 0;},
                rz: function () {z = 0;}
            },
            slides = $('.step');

        slides.each(function (index, slide) {
            if (!slides[index + 1]) {
                return;
            }

            var next = $(slide).data('next').split(' ');
            next.length && next.forEach(function (option) {
                options[option]();
            });

            // apply data
            $(slides[index + 1]).attr({
                'data-x': x,
                'data-y': y,
                'data-z': z
            });
        });
    })();

    // buttons
    $('.slideButton').on('click', function () {
        var $slide = $(this);
        impress()[$slide.data('action')]();
    });
})();