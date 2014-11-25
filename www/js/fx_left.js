/**
 * Created by yks on 23.11.14.
 */
;(function($) {
    var ROOT_SELECTOR = "#slideContainer";
    var LIST_ITEMS_SELECTOR = ROOT_SELECTOR + " li";
    var ELEMS_SELECTOR = ROOT_SELECTOR + " p";
    var ELEMS_COUNT = 3;
    var ANIM_SPEED = 2000;
    var SHOW_DELAY = 2000;
    var FADEIN_SPEED = 1000; // should be < SHOW_DELAY
    var ANIM_COMPLETE_FLAG = 0;
    var fontSize = {
        MIN: 0,
        MAX: 0
    };
    var height = 0;

    var queue = {
        _queuedFunc: null,
        nextCallback: null,

        add: function(func) {
            queue._queuedFunc = func;
        },

        start: function() {
            queue._queuedFunc();
        },
        next: function() {
            ANIM_COMPLETE_FLAG = (ANIM_COMPLETE_FLAG + 1) % ELEMS_COUNT;
            if (ANIM_COMPLETE_FLAG == 0) {
                queue.nextCallback && queue.nextCallback();
                setTimeout(queue._queuedFunc, SHOW_DELAY);
            }
        }
    };

    function animate($elems) {
        if ($elems.length != ELEMS_COUNT) {
            return;
        }
        // top-most elem goes out
        $($elems[0]).animate({
            top: -height
        }, ANIM_SPEED, queue.next);

        // middle elem goes to top and gets smaller font
        $($elems[1]).animate({
            top: -height,
            fontSize: fontSize.MIN
        }, ANIM_SPEED, queue.next);

        // lowest elem goes to the middle and gets larger font
        $($elems[2]).animate({
            top: -height,
            fontSize: fontSize.MAX
        }, ANIM_SPEED, queue.next);
    };

    $(document).ready(function() {
        var $root = $(ROOT_SELECTOR);
        $root.css({
//            position: "relative",
            overflow: "hidden",
            _: null
        })
        var $items = $(LIST_ITEMS_SELECTOR);
        // "global" var!
        height = $($items[0]).height();

        var width = $root.width();
        var $elems = $(ELEMS_SELECTOR);

        var i = 0;
        $elems.each(function() {
            var top = i * height;
            var $this = $(this);
            $this.parent().css({
                position: "relative",
                _: null
            })
            $this.css({
                position: "relative",
                top: 0,
//                width: width,
                _: null
            })
                .removeClass("active")
            ;
            i ++;
        });
        // assume equal height for all elems
        fontSize.MIN = $($elems[0]).css("font-size");
        fontSize.MAX = $($elems[1]).css("font-size");

        queue.add(function() {
            // need to re-evaluate selector to ensure correct animation order
            animate($(ELEMS_SELECTOR));
        });
        queue.nextCallback = function() {
            var elems = [];
            $items.each(function() {
                var $this = $(this);
                elems.push($this.find("p").remove());
            });
            var _elem0 = elems.shift();
            elems.push(_elem0);
            $items.each(function() {
                var elem = elems.shift();
                elem.css({top: 0});
                $(this).append(elem);
            });
            _elem0.hide().fadeIn(FADEIN_SPEED);
        };
        queue.start();
    });

})(jQuery);
