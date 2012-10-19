function cancelEvent(e) {
    e = !e ? window.event : e;

    if (e.stopPropagation)
        e.stopPropagation();
    if (e.preventDefault)
        e.preventDefault();
    e.cancelBubble = true;
    e.cancel = true;
    e.returnValue = false;
    return false;
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var n = this;
        for (var i = 0; i < arguments.length; i++) {
            var e = new RegExp('\\{' + (i) + '\\}', 'gm');
            n = n.replace(e, arguments[i]);
        }
        return n;
    }
}

if (!String.format) {
    String.format = function () {
        for (var i = 1; i < arguments.length; i++) {
            var e = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            arguments[0] = arguments[0].replace(e, arguments[i]);
        }
        return arguments[0];
    }
}

$.fn.toEm = function (settings) {
    settings = jQuery.extend({
        scope: 'body'
    }, settings);
    var that = parseInt(this[0], 10),
		scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
		scopeVal = scopeTest.height();
    scopeTest.remove();
    return (that / scopeVal).toFixed(8);
};

$.fn.toPx = function (settings) {
    settings = jQuery.extend({
        scope: 'body'
    }, settings);
    var that = parseFloat(this[0]),
		scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
		scopeVal = scopeTest.height();
    scopeTest.remove();
    return Math.round(that * scopeVal);
};



/*
Converts an existing SELECT into a combo-box
*/
$.fn.JPComboBox = function () {

    var KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40,
        KEY_ESC = 27, KEY_RTRN = 13, KEY_BKSPC = 8, KEY_TAB = 9, KEY_F4 = 115;

    var ONEEM = $(1).toPx();

    var _items;

    //created by plugin to wrap original select box
    var $_jp_wrapper;
    var $_this = this;
    var $listbox, $button, $txtbox, $dbg;
    var hIdx = -1;
    var listVisible = false;
    var text = "";
    var selected = { value: null, text: null }
    var id = $_this[0].id;
    var width = $_this.width();



    function _init() {

        //wrap control so we control container
        $_jp_wrapper = $_this.wrap('<div id="' + id + '_wrapper" class="cbwrapper" style="width:' + width + 'px;">').parent();

        var buttonWidth = ONEEM + 6;
        //+ 1 xtra px 2 compns8 4 px2em rounding
        var textWidth = $_jp_wrapper.width() - (buttonWidth + 14);

        //create input box
        $txtbox = $('<input id="' + id + '_txt" type="text" class="inputbox" AutoCompleteType="Disabled" placeholder="Search" style="width:' + textWidth + 'px"/>');
        $_jp_wrapper.append($txtbox);

        //create button to invoke dropdown
        $button = $('<span id="' + id + '_dd" class="dropdown"><span class="arrow-S">&nbsp;</span></span>');
        $_jp_wrapper.append($button);

        //create container for list
        $listbox = $('<span id="' + id + '_list" class="dropdownlist" style="min-width:' + width + 'px"></span>');
        $_jp_wrapper.append($listbox);

        $dbg = $('<span id="' + id + '_dbg"></span>');
        $_jp_wrapper.append($dbg);

        //reset and hide original listbox
        $_this.css("margin", "0px").css('display', 'none');

        //copy items from original listbox
        proxySelect();

        //bind change event so we reflect any api calls against original dropdown
        $_this.change(function () {

            var $newVal = $_this.find('option:selected');

            if ($newVal != null) {
                var item = $listbox.find('li[data-id="' + $newVal.attr('value') + '"]').first();
                item.trigger('click');
            }
        });

        $_jp_wrapper.keyup(function (event) {

            switch (event.keyCode) {
                case KEY_DOWN:

                    if (!listVisible) {

                        showList();

                    } else {
                        //scroll down list
                        scroll('down');
                        if (hIdx < 0) hideList();

                    }
                    break;
                case KEY_UP:

                    if (listVisible) {

                        scroll('up');

                        if (hIdx < 0) hideList();

                    }
                    $txtbox.val($txtbox.val()); //force cursor back to end
                    break;
                case KEY_RTRN:
                    event.stopPropagation();
                    if (hIdx >= 0) $listbox.find('li:eq(' + hIdx + ')').trigger('select');

                    break;
                case KEY_RTRN:

                    cancelEvent(event);
                    //event.stopPropagation();
                    break;
                case KEY_F4:
                    if (!listVisible) showList();
                    event.stopPropagation();
                default: filter()
            }
        }).keydown(function (event) {
            switch (event.keyCode) {
                case KEY_RTRN:

                    cancelEvent(event);
                    //event.stopPropagation();
                    break;
                case KEY_TAB:

                    if (selected.value == null) {
                        $txtbox.val("");
                        text = "";
                        clearList();
                        defaultList();
                    }
                    hideList();
                    break;
                default: //do nothing
            }
        });

        $button.click(function (event) {
            event.stopPropagation();
            showList();
            $txtbox.focus();
        });
        /*  make sure to close drop-down when user
        clicks on something else
        */
        $('html').click(function () {
            hideList();

        });




    }

    /*
    direction: 'up' or 'down'
    */
    function scroll(direction) {
        var i = (direction == 'down') ? 1 : -1;
        var count = ($listbox.find('li').length);
        var idx = -1;

        //if nothing in list... nothing to do
        if (count > 0) {


            //find index of selected
            if (hIdx == -1) {
                var $selected = $listbox.find('li:selected').first();
                if ($selected != null) hIdx = $selected.index();
            }
            idx = hIdx;


            //calculate move
            idx += i;


            if (idx < 0) {
                hIdx = -1;
                var $selected = $listbox.find('li:eq(0)').first();
                $selected.trigger('off');

            } else if (idx < count) {


                var $selected = $listbox.find('li:eq(' + idx + ')').first();
                $selected.trigger('over');

            }

        }
        else return null;
    }

    //bound to each list item
    function over() {

        //redefine in scope
        var $this = $(this);
        //unhighlight all children
        if (hIdx >= 0) {
            $listbox.find('li:eq(' + hIdx + ')').trigger('off');
        }
        //if i'm not selected, highlight me
        if (!$this.prop('selected')) {
            $this.addClass('highlighted');
        }

        var vpTop = $listbox.scrollTop();
        var vpBottom = vpTop + $listbox.outerHeight(false);
        var elTop = $this.position().top;
        var elBottom = elTop + $this.outerHeight(true);

        //$dbg.html('vpTop: {0} vpBottom: {1} elTop: {2} elBottom: {3}'.format(vpTop, vpBottom, elTop, elBottom));


        if (elTop < 0) {
            $listbox.scrollTop(vpTop + elTop);
        } else if (elBottom > (vpBottom - vpTop)) {
            var newTop = vpTop + (elBottom - (vpBottom - vpTop));

            $listbox.scrollTop(newTop);

        }

        //global value to indicate that something is hovered
        hIdx = $this.index();



    };

    function off() {
        var $this = $(this);
        //if i'm not already selected, unhighlight
        //if (!$this.prop('selected')) {
        $this.removeClass('highlighted');
        //}
        //global value to indicate that nothing is hovered
        hIdx = -1;

    }

    function filter() {

        //get the value from the textbox
        var txtval = $txtbox.val();

        //if different from last value
        if (txtval != text) {
            //reset selected to null since were doing a new search
            $.extend(selected, { value: null, text: null });
            hIdx = -1;

            //set last text value
            text = txtval;
            //unbind all events to prevent memory leaks
            clearList();

            //get fresh copy of original list
            var arr = _items;

            //search through list
            if (txtval.length > 0) {
                arr = $.grep(_items, function (n, i) { return n.value.search(new RegExp(txtval, 'i')) > -1; });

            }

            //create and append new list
            $listbox.append(ULFromList(arr));
            //if not currently showing list... show it.
            if (!listVisible) showList();

        }




    }

    function clearList() {
        //unbind all events to prevent memory leaks
        $listbox.find('li').unbind();
        //remove existing search results
        $listbox.empty();
    }

    function showList() {
        if (!listVisible) {
            $listbox.slideDown('fast');
            scroll('down');
            $listbox.find('li:eq(' + hIdx + ')').trigger('off');
            listVisible = true;
            hIdx = -1;
        }
        else {
            hideList();
        }





    }

    function select() {
        var $selected = $(this);


        $listbox.find('li:selected').trigger('deselect');

        $selected.prop('selected', true);

        $.extend(selected, { value: $selected.attr('data-id'), text: $selected.text() });
        $_this.val($selected.attr('data-id'));
        $txtbox.val($selected.text());
        text = $selected.text();
        $txtbox.focus();
        //$selected.css('background-color', 'gray');
        //$selected.css('color', 'white');
        $selected.addClass('selected');
        hideList();
    }

    function deselect() {
        var $this = $(this);

        $this.prop('selected', false);
        //$this.css('background-color', 'white');
        //$this.css('color', 'black');
        $this.removeClass('selected');


    }

    function hideList() {
        if (listVisible) {

            $listbox.slideUp('fast');
            listVisible = false;
        }
    }

    function defaultList() {
        $listbox.append(ULFromList(_items));
    }

    function ULFromList(arr) {
        var ul = $('<ul></ul>');
        var newOption;
        if ((arr != null) && (arr.length > 0)) {
            for (i = 0; i < arr.length; i++) {
                newOption = $('<li class="dropdownitem" data-id="' + arr[i].id + '">' + arr[i].value + '</li>')
                ul.append(newOption);

                newOption.bind('over', over);
                newOption.bind('off', off);
                newOption.mouseover(over);

                newOption.bind('select', select);
                newOption.bind('deselect', deselect);
                newOption.click(select);
            }
        }
        return ul;
    }

    function CreateListItem(id, value) {
        return { id: id, value: value };
    }

    function proxySelect() {
        _items = [];
        var index = -1;



        for (i = 0; i < $_this.children().length; i++) {
            $item = $_this.find('option:eq(' + i + ')');
            _items[i] = CreateListItem($item.attr('value'), $item.text());
            if ($item.prop('selected')) index = i;
        }



        $listbox.append(ULFromList(_items));
        if (index > 0) $listbox.find('li:eq(' + index + ')').trigger('select');



    }

    _init();



};


