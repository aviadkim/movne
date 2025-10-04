function initPage(){
    
    /*$(window).on("load", function(){
        // Split text into spans
        let typeSplit = new SplitText('.main_title, .sec_item_title, .foundations_title, .how_title, .how_item_title, .features_title, .quality_tx, .top_tx > div, .panel_right h3, .meet_meet_title, .sec_meet_title', {
        types: "words",
        wordsClass: "word",
        charsClass: "char",
        tag: "span"
        });
        
        // Link timelines to scroll position
        function createScrollTrigger(triggerElement, timeline) {
            // Reset tl when scroll out of view past bottom of screen
            ScrollTrigger.create({
                trigger: triggerElement,
                start: "top bottom",
                onLeaveBack: () => {
                    timeline.progress(0);
                    timeline.pause();
                }
            });
        
            // Play tl when scrolled into view (60% from top of screen)
            ScrollTrigger.create({
            trigger: triggerElement,
            start: "top 60%",
            onEnter: () => timeline.play()
            });
        }
        $('.main_title, .sec_item_title, .foundations_title, .how_title, .how_item_title, .features_title, .quality_tx, .top_tx > div, .panel_right h3, .meet_meet_title, .sec_meet_title').each(function (index) {
        let tl = gsap.timeline({ paused: true });
        tl.from($(this).find(".word"), { opacity: 0, x: "1em", duration: 0.6, ease: "power2.out", stagger: { amount: 0.8 } });
        createScrollTrigger($(this), tl);
        });
        gsap.set('.main_title, .sec_item_title, .foundations_title, .how_title, .how_item_title, .features_title, .quality_tx, .top_tx > div, .panel_right h3, .meet_meet_title, .sec_meet_title', { opacity: 1 });
        
        
        if ($('.statistics_item_title_in').length > 0){
            let ststart = "bottom bottom";
            let stend = "top top";          
            const stat_items = gsap.utils.toArray('.statistics_item_title_in');
            stat_items.forEach((text, i) => {
            
                gsap.from(text, {
                  textContent: "0",
                    duration: 1,
                    ease: "power1.inOut",
                    modifiers: {
                        textContent: value => formatNumber(value, 0)
                    },
                    scrollTrigger: {
                        trigger: text,
                        start: ststart,
                        end: stend,
                        toggleActions: "play none none reverse",
                        markers: false
                    }
                })
            });
            
            
            
            
            function formatNumber(value, decimals) {
                let s = (+value).toLocaleString('en-US').split(".");
                return decimals ? s[0] + "." + ((s[1] || "") + "00000000").substr(0, decimals) : s[0];
            }
        }
    });*/


    //window.onresize = updateZoom;
    $('a[href*="#"]').on('click', function(e) {
        if ($(this).attr('href') == '#') return true;
        if(this.pathname === window.location.pathname){
            var url = this.href;
            var hash = url.substring(url.indexOf('#'));
            e.preventDefault();
            goToEle($(hash));
            return false;
        }
    });
    if (window.location.hash){
        setTimeout(function(){
            goToEle($(window.location.hash));
        }, 1);
    }
    var hh = $('.header').outerHeight(true, true);
    var lastScrollTop = 0;
    $(document).scroll(function() {
        var st = $(this).scrollTop();
        if ($(document).scrollTop() > hh){
            $('body').addClass('scrolled');
        } else {
            $('body').removeClass('scrolled');
        }
        lastScrollTop = st;
    });
    $('.bt_menu').on('click', function(){
        $('body').toggleClass('mopen');
    });
    $('.mitem.s_bt a').on('click', function(){
        $('body').removeClass('mopen');
    });
    if (testMobile_768()){
        //$('.main_menu').height(window.innerHeight);
        $('.head_menu_wrap').show();
    }
    document.addEventListener( 'wpcf7mailsent', function(event){
        window.location.href = homeUrl + 'thank-you';
        /*
        $('.form_contact_in').hide();
        $('.form_contact_thank').show();*/
    }, false);
    $('.ele_1').paroller({
        factor: -0.1,
        type: 'foreground',
        direction: 'vertical',
        transition: 'transform 0.2s cubic-bezier(0,.33,.07,1.03)'
    });
    $('.ele_2').paroller({
        factor: 0.3,
        type: 'foreground',
        direction: 'vertical',
        transition: 'transform 0.2s cubic-bezier(0,.33,.07,1.03)'
    });
    $('.uparr').on('click', function(){
        goTop();
    });
    $('.logos_items').slick({
        rtl: true,
        centerMode: false,
        centerPadding: '0px',
        slidesToShow: 12,
        slidesToScroll: 1,
        infinite: true,
        dots: false,
        arrows: false,
        draggable: true,
        autoplay: true,
        speed: 2000,
        autoplaySpeed: 0,
        cssEase: 'linear',
        pauseOnHover: false,
        pauseOnFocus: false,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                }
            },
        ]
    });
	$(document).on('click', '.p_bt_1 a', function(){
		goToEle($('#meet'));
	});
    $('.compatible').slick({
        rtl: true,
        centerMode: false,
        centerPadding: '0px',
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        dots: true,
        arrows: false,
        autoplay: false,
        draggable: false,
        swipe: false,
        swipeToSlide: false,
        touchMove: false,
        draggable: false,
        accessibility: false,
        speed: 800,
    });
    $('.compatible .slick-dots').hide();
    $('.compatible').on('beforeChange', function(event, slick, currentSlide, nextSlide){
        if (nextSlide > 0 && nextSlide < 4) $('.compatible .slick-dots').show();
        else $('.compatible .slick-dots').hide();
    });
    $('.panel_1 .p_next > a').on('click', function(){
        $('.compatible').slick('slickGoTo', 1);
    });
    $('.panel_2 .p_next > a').on('click', function(){
        $('.compatible').slick('slickGoTo', 2);
    });
    $('.panel_3 .p_next > a').on('click', function(){
        $('.compatible').slick('slickGoTo', 3);
    });
    $('.panel_4 .p_next > a').on('click', function(){
        $('.compatible').slick('slickGoTo', 4);
    });
    $('.panswer').on('click', function(){
        if (!($(this).hasClass('active'))){
            $(this).closest('.panel').addClass('pactive');
            $(this).closest('.panel').find('.panswer.active').removeClass('active');
            $(this).addClass('active');
            $(this).closest('.panel_left').addClass('active');
        } else {
            $(this).closest('.panel').removeClass('pactive');
            $(this).removeClass('active');
            $(this).closest('.panel_left').removeClass('active');
        }
    });
    $('.panel_3 .panswer').on('click', function(){
        if ($(this).hasClass('pno')){
            if ($(this).hasClass('active')) panswerno();
            else pansweryes();
        } else {
            pansweryes();
        }
    });
    function panswerno(){
        $('.panel_5 .pbtns .p_bt_1').remove();
        $('.panel_5 > h3 > strong').text('מתנצלים :(');
        $('.panel_5 > p').html('לפי תקנות הרשות לניירות ערך, ללא הון <br>ראשוני ונזיל העולה על 100K$ לא תוכל <br>להשקיע במוצרים מובנים');
    }
    function pansweryes(){
        $('.panel_5 .pbtns .p_bt_1').remove();
        $('.panel_5 .pbtns').prepend('<div class="s_bt_2 p_bt_1 p_bt"><a href="javascript: void(0);">בואו נתאם שיחה!<span></span></a></div>');
        $('.panel_5 > h3 > strong').text('מדהים :)');
        $('.panel_5 > p').html('לפי תקנות הרשות לניירות ערך, נמצאת מתאים <br>להתחיל ולהשקיע במוצרים מובנים אצלנו');
    }
    $.fn.isInViewport = function() {
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();
    
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
    
        return elementBottom > viewportTop && elementTop < viewportBottom;
    };
    var wdth = screen.width;
    if (wdth > 770){
        jQuery(window).scroll(function() {
            if (jQuery('#mep_0').length > 0) {
                if (jQuery('#mep_0').isInViewport()) {
                    mejs.players[jQuery('#mep_0').attr('id')].media.play();
                } else {
                    mejs.players[jQuery('#mep_0').attr('id')].media.pause();
                }
            }
            if (jQuery('#mep_1').length > 0) {
                if (jQuery('#mep_1').isInViewport()) {
                    mejs.players[jQuery('#mep_1').attr('id')].media.play();
                } else {
                    mejs.players[jQuery('#mep_1').attr('id')].media.pause();
                }
            }
        });
    }
    $('.accord1 > ul > li > p').click(function(){
        $(this).next('.accord-content').slideToggle(200);
        $(this).closest('li').toggleClass('active');
        $(this).closest('li').siblings().find('.accord-content').slideUp(200);
        $(this).closest('li').siblings().removeClass('active');
        $(this).closest('ul').siblings().find('.accord-content').slideUp(200);
        $(this).closest('ul').siblings().find('li').removeClass('active');
    });
    // .accord_list_2 shown dynamically
    /*
    $('.faq .more').on('click', function(){
      $('.faq .more').hide();
      $('.accord_list_2').slideDown(200, function() {
        animateFadeInUpGroup('.accord_list_2 li', 0.1, 80);
      });
    });
    */
    $('.footer .more > a').on('click', function(){
        $('.ft_tx').toggleClass('active');
        if ($('.ft_tx').hasClass('active')) $(this).text('קראו פחות');
        else $(this).text('קראו עוד');
    });
    
    if ($('.filters_wrap').length) {
        var originLeft = (!($('html').attr('lang') == 'he-IL'));
        var $grid = $('.grid').isotope({
            originLeft: originLeft,
            itemSelector: '.grid-item',
            layoutMode: 'fitRows'
        });
        $('.filters_wrap').on( 'click', 'a', function(e) {
            e.preventDefault();
            var filterValue = $(this).attr('data-filter');
            $grid.isotope({ filter: filterValue });
            //goToEle($('.project_items_wrap'));
            return false;
        });
        $('.filters_wrap').each( function( i, buttonGroup ) {
            var $buttonGroup = $( buttonGroup );
            $buttonGroup.on( 'click', 'a', function() {
                $buttonGroup.find('.is-checked').removeClass('is-checked');
                $(this).addClass('is-checked');
            });
        });
    }
    $('.meet_item').on('click', function(){
        var meet_type = $(this).attr('data-meet-type');
        $('.meet').addClass('active');
        $('.meet').attr('data-meet-type', meet_type);
    });
    $('.meet_meet_in_top > a').on('click', function(){
        $('.meet').removeAttr('data-meet-type');
        $('.meet').removeClass('active');
    });
    $('.meet_form_tx > a').on('click', function(){
        $('.meet').addClass('active');
        $('.meet').attr('data-meet-type', 'contact');
    });
	var top_spacing = 0.0763888888888889 * $(window).width();
	new $.Zebra_Pin($('#side_menu'), {
		contain:true,
		top_spacing: top_spacing
	});
    if (testMobile_768()){
        window.addEventListener('scroll', function(e) {
            $('.values_item').each(function(){
                if (isOnScreen($(this))){
                    //$('.values_item.active').removeClass('active');
                    $(this).addClass('active');
                } else {
                    //$(this).removeClass('active');
                }
            });	
        });
    }
}
/*
var updateZoom = function() {
    let zoomLevel = ((window.outerWidth - 10) / window.innerWidth);
    zoomLevelPercent = zoomLevel * 100;
    $('body').css('zoom', zoomLevelPercent + '%');
    $('body').css('zoom', zoomLevel);
    $('body').css('-moz-transform', 'scale(zoomLevel, zoomLevel)');
}
*/
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function isScrolledIntoView(elem){
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom + 600) && (elemTop >= docViewTop));
}
function numberWithCommas(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function sortNumber(a, b) {
    return a - b;
}
function get_current_post_id() {
    var id = 0;
    if($('body').hasClass('single')) {
        var classList = $('body').attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            if (item.indexOf('postid') >= 0) {
                var item_arr = item.split('-');
                id =  item_arr[item_arr.length -1];
                return false;
            }
        });
    }
    return id;
}
function testMobile_1366(){
    return ($(window).width() < 1367);
}
function testMobile_1024(){
    return ($(window).width() < 1025);
}
function testMobile_768(){
    return ($(window).width() < 769);
}
function testMobile_576(){
    return ($(window).width() < 577);
}
function removeHash(){
    history.pushState("", document.title, window.location.pathname
        + window.location.search);
}
function goTop(){
    $('html, body').stop().animate({
        scrollTop: 0
    }, 500);
}
function goToEle(elem) {
    var off = $(elem).offset();
    var topOff = $('.head_sticky').outerHeight(true) + 40;
    if (testMobile_768()) topOff = (0.12 * $(window).width()) + 40;
    $('html,body').stop().animate({
        scrollTop: off.top - topOff + 3
    }, 800);
}
function goToHash(hash){
    hash = (typeof hash !== 'undefined') ?  hash : "";
    var goToUrl = '#'+hash;
    goToEle($(goToUrl));
    return false;
}
function is_touch_device() {
    return 'ontouchstart' in window        // works on most browsers
        || 'onmsgesturechange' in window;  // works on IE10 with some false positives
};
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1
}
function isWindows() {
    return navigator.platform.indexOf('Win') > -1
}
function isOnScreen(elem) {
    if( elem.length == 0 ) {
        return;
    }
    var $window = jQuery(window)
    var viewport_top = $window.scrollTop()
    var viewport_height = $window.height()
    var viewport_bottom = viewport_top + viewport_height
    var $elem = jQuery(elem)
    var top = $elem.offset().top
    var height = $elem.height()
    var bottom = top + height

    return (top >= viewport_top && top < viewport_bottom) ||
    (bottom > viewport_top && bottom <= viewport_bottom) ||
    (height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
}