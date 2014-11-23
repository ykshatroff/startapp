/**
 * Created by yks on 23.11.14.
 */
;(function($) {
    var SELECTOR = "#developer-column li";
    var ANIM_SPEED = 2000;
    var SHOW_DELAY = 2000;
    var FADEOUT_SPEED = 2000;
    var FADEOUT_COMPLETE_FLAG = 0;

    var queue = {
        EVENT_NEXT: "queue_event_next",
        _queue: [],
        _queueIndex: 0,
        infinite: true,
        timeout: 500,

        add: function(func) {
            queue._queue.push(func);
            return queue;
        },

        next: function() {
            console.log("queue.next(): " + queue._queueIndex);
            var queueLength = queue._queue.length;
            if (! queueLength) {
                return;
            }
            // exec a function under the current index
            queue._queue[queue._queueIndex]();

            // advance index
            queue._queueIndex ++;
            if (queue._queueIndex >= queueLength) {
                if (queue.infinite) {
                    queue._queueIndex = 0;
                } else {
                    queue.stop();
                }
            }
        },

        complete: function() {
            console.log("queue.complete(): " + queue._queueIndex);
            setTimeout(function() {
                $(document).trigger(queue.EVENT_NEXT);
            }, queue.timeout);

        },

        start: function() {
            $(document).on(queue.EVENT_NEXT, queue.next);
            $(document).trigger(queue.EVENT_NEXT);
        },

        stop: function () {
            $(document).off(queue.EVENT_NEXT);
        }
    };

    $(document).ready(function() {
        var width;
        $(SELECTOR).each(function() {
            var $this = $(this);
            width = width || $this.width();
            var height = $this.height();

            var text = $this.text();
            $this
                .css({
                    height: height,
                    position: "relative",
//                    visibility: "hidden",
                    _: null
                })
                .hide()
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

            var $slider = $("<div class='_slider'>").css({
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

            queue.add(function() {
                $this.show();
//                $this.css({visibility: "visible"});
                $slider.animate({
                    left: 0
                }, ANIM_SPEED, function() {
                    queue.complete();
                });
            });
        });
        // add show-delay and fadeout
        queue.add(function() {
            var $elems = $(SELECTOR);
            $elems
                .delay(SHOW_DELAY)
                .fadeOut(FADEOUT_SPEED, function() {
                    var $this = $(this);
//                    //
//                    $this.show().css({visibility:"hidden"});
                    $this.find("._slider").css({left: width});
                    FADEOUT_COMPLETE_FLAG = (FADEOUT_COMPLETE_FLAG + 1) % $elems.length;
                    if (FADEOUT_COMPLETE_FLAG == 0) {
                        queue.complete();
                    }
                })
            ;
        });
        queue.start();

    });
})(jQuery);
