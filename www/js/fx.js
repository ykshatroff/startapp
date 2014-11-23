/**
 * Created by yks on 23.11.14.
 */
;(function($) {
    var SELECTOR = "#developer-column li";
    var ANIM_SPEED = 2000;
    var ON_ANIM_NEXT = "animation_next";
    var animQueue = [];


    function slideQueue($slider) {
        return function() {
            animQueue && $(document).one(ON_ANIM_NEXT, animQueue.shift());
            $slider.animate({
                left: 0
            }, ANIM_SPEED, function() {
                $(document).trigger(ON_ANIM_NEXT);
            });
        }
    };

    $(document).ready(function() {
        $(SELECTOR).each(function() {
            var $this = $(this);
            var width = $this.width();
            var height = $this.height();

            var text = $this.text();
            $this
                .css({
                    height: height,
                    position: "relative",
                    _: null
                })
                .html(""); // &nbsp;

            var $div = $("<div>").css({
                position: "absolute",
                top: 0,
                left: 0,
                height: height,
                width: width,
                overflowX: "hidden",
                _: null
            })
            ;
            $this.append($div);

            var $slider = $("<div>").css({
                position: "absolute",
                top: 0,
                left: width,
                height: height,
                width: width,
                _: null
            })
                .text(text)
            ;
            $div.append($slider);

            animQueue.push(slideQueue($slider));
        });
        animQueue && (animQueue.shift())();

    });
})(jQuery);
