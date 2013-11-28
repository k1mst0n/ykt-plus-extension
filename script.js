$(function () {
    startFeatures();
});

function startFeatures() {
    if (location.href.indexOf("news.ykt.ru") != -1) startNewsFeatures();
    if (location.href.indexOf("joker.ykt.ru") != -1) startJokerFeatures();
    addTopPanel();
}

function startNewsFeatures() {
    removeSocialWidgets();
    resizeImages();
    markBadComments();
}

function startJokerFeatures() {
    prepareNextPageLink();
    generateVideoLinks();
    showProfile();
}

function removeSocialWidgets() {
    $("#facebook-jssdk").remove();
    $(".fb_iframe_widget").remove();
    $("#vk_groups").remove();
}

function markBadComments() {
    $(".comment", $("#articleComments")).each(function () {
        if ($(".plusminus", $(this)).hasClass("negative")) {
            $(".body", $(this)).addClass("plus-bad");
        }
    });
}

function resizeImages() {
    $("img", $(".comment-img")).each(function () {
        if ($(this).width() > $(this).height())
            $(this).height("100%");
    });
}

function addTopPanel() {
    $("body").append("<div class='plus-top'><div class='plus-top-panel'><div class='plus-top-button' title='Наверх'>&uarr;</div></div></div>");
}

$(document).on("click", ".plus-top-panel", function () {
    $.scrollTo(0, 100, { axis: "y", onAfter: function () { lastPosition = 0; $(".plus-top").hide(); } });
});

function showProfile() {
    $("div.nav").each(function () {
        var parent = $(this);
        if (!parent.hasClass("plus-processed")) {
            var user = $("b", parent);
            var anchor = $("a", user);
            var name = anchor.attr("href");
            var index = name.indexOf("user/");
            if (index != -1) {
                name = name.substring(index + 5).replace("/", "");
                $.get("/engine/ajax/profile.php", { name: name, skin: "Default" }, function (data) {
                    $("img", data).each(function () {
                        if ($(this).attr("alt") == "rss")
                            return;
                        if ($(this).attr("src").indexOf("online") != -1 || $(this).attr("src").indexOf("offline") != -1)
                            return;
                        $(this).addClass("plus-avatar");
                        anchor.prepend($(this));
                        parent.addClass("plus-processed");
                    });
                });
            }
        }
    });
}

function appendLink(parent, href, width, position) {
    parent.append('<div class="plus-container" style="width:' + (position == "center" ? "100%" : width) + '"><a href="' + href + '" class="plus-link">Скачать</a></div>');
}

function generateVideoLinks() {
    var parent, position, src, width;
    $("embed").each(function () {
        parent = $(this).parent();
        if (!parent.hasClass("plus-processed")) {
            position = parent.css("text-align");
            width = $(this).attr("width");
            if (src = $(this).attr("flashvars")) {
                var startIndex = src.indexOf("file=");
                if (startIndex != -1) {
                    src = src.substring(5 + startIndex);
                    var endIndex = src.indexOf("&");
                    if (endIndex != -1) {
                        src = src.substring(0, endIndex);
                        appendLink(parent, src, width, position);
                        parent.addClass("plus-processed");
                    }
                }
            }
        }
    });
    $("video").each(function () {
        parent = $(this).parent();
        if (!parent.hasClass("plus-processed")) {
            position = parent.css("text-align");
            width = "640px";
            $("source", $(this)).each(function () {
                if (src = $(this).attr("src")) {
                    appendLink(parent, src, width, position);
                    parent.addClass("plus-processed");
                }
            });
        }
    });
}

function getNextPageLink() {
    var nextPageLink;
    $("a", $("div.style2")).each(function () {
        if ($(this).text() == "Следующая страница") {
            $(this).attr("id", "plus-next");
            nextPageLink = $(this);
        }
    });
    return nextPageLink;
}

$(document).on("click", "#plus-next", function () {
    var parent = $(this);
    $.jGrowl("Подождите, загружается следующая страница...", {
        open: function () {;
            parent.parent().remove();
            $(".plus-loader").show();
            var href = parent.attr("href");
            $.ajax({
                url: href,
                success: function (response) {
                    $("#dle-content").append($(response).find("#dle-content").html());
                    startJokerFeatures();
                    isNextPageLoading = false;
                    $.jGrowl("close");
                }
            });
        }
    });
});

function prepareNextPageLink() {
    var nextPageLink;
    if (nextPageLink = getNextPageLink()) {
        if (nextPageLink.attr("href")) {
            nextPageLink.parent().hide();
            $(".plus-loader").remove();
            $("#dle-content").append('<div class="plus-loader"><img src="' + chrome.extension.getURL('images/ajax-loader.gif') + '"/></div>');
        }
    }
}

var isNextPageLoading = false;

var lastPosition = 0;

$(window).scroll(function () {
    if (lastPosition < window.pageYOffset)
        $(".plus-top").show();
    lastPosition = window.pageYOffset;
    if (isNextPageLoading)
        return;
    if ($(window).scrollTop() + 10 >= ($(document).height() - ($(window).height()))) {
        isNextPageLoading = true;
        var nextPageLink;
        if (nextPageLink = getNextPageLink())
            nextPageLink.click();
    }
});