
$.fn.JPGitHubButton = function (settings) {

    var options = $.extend({

        user: '',
        repo: '',
        buttonType: 'fork', //follow, watch, fork

    }, settings);


    $_this = this;


    var template = '<span><span class="jp-gh-button"><span class="jp-gh-ico"></span><a href="#" target="_blank" class="jp-gh-caption"></a></span><a href="#" target="_blank" class="jpcallout hidden"></a></span>';

    function _init() {

        var $_content = $_this.append(template);

        var $_caption = $_content.find('.jp-gh-caption');
        var $_count = $_content.find('.jpcallout');

        switch (options.buttonType)
        {
            case 'fork':
                getGitRepo(function (data) {
                    $_caption.text('Fork Me');
                    $_count.text(data.data.forks).removeClass('hidden')
                    $_caption.attr('href', 'https://github.com/' + options.user + '/' + options.repo + '/network');
                    $_count.attr('href','https://github.com/' + options.user + '/' + options.repo + '/network');
                });

                break;
            case 'follow':
                getGitUser(function (data) {
                    $_caption.text('Follow ' + options.user);
                    $_count.text(data.data.followers).removeClass('hidden')
                    $_caption.attr('href','https://github.com/' + options.user + '/followers');
                    $_count.attr('href','https://github.com/' + options.user + '/followers');
                });

                break;
            case 'watch':
                getGitRepo(function (data) {
                    $_caption.text('Watch');
                    $_count.text(data.data.watchers).removeClass('hidden')
                    $_caption.attr('href','https://github.com/' + options.user + '/' + options.repo + '/stargazers');
                    $_count.attr('href','https://github.com/' + options.user + '/' + options.repo + '/stargazers');
                });

                break;
        };

    }

    function getGitRepo(callback)
    {
        $.ajax({

            url: 'https://api.github.com/repos/' + options.user + '/' + options.repo
            ,dataType: 'jsonp'
            ,success: function(data, status, jqXHR) {
                callback(data);
            }
        });
    }

    function getGitUser(callback)
    {

        $.ajax({

            url: 'https://api.github.com/users/' + options.user
            , dataType: 'jsonp'
            , success: function (data, status, jqXHR) {
                callback(data);
            }
        });
    }

    _init();

};
