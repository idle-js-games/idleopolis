(function() {
    
    $('#io-goto-map').on('click', function() {
        $('.io-main-wrapper').animate({ scrollLeft: 0 });
        $('#io-game-menu button').removeClass('active');
        $(this).addClass('active');
    });
    
    $('#io-goto-research').on('click', function() {
        $('.io-main-wrapper').animate({ scrollLeft: 1004 });
        $('#io-game-menu button').removeClass('active');
        $(this).addClass('active');
    });
    
    $('#io-goto-stats').on('click', function() {
        $('.io-main-wrapper').animate({ scrollLeft: 2008 });
        $('#io-game-menu button').removeClass('active');
        $(this).addClass('active');
    });
    
    $('#io-goto-settings').on('click', function() {
        $('.io-main-wrapper').animate({ scrollLeft: 3012 });
        $('#io-game-menu button').removeClass('active');
        $(this).addClass('active');
    });
    
/*
    for(var i = 1; i < 20; i++) {
        $('#io-square-1').clone().appendTo('#io-the-land'); 
    }
*/

}());

