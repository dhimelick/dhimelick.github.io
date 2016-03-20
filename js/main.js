var allGems, abbreviations, classSelection, gemGuideText, gemsAvailableToClass, gemsNotAvailableToClass, hashids, gemCellSource, gemCellTemplate;

var init = function()
{
    var a1 = $.get('json/gems.json'),
        a2 = $.get('json/abbreviations.json');

    hashids = new Hashids("ad5b8cb26d9e1739be52d6ab14969873", 8, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");

    gemCellSource   = $("#gem-cell-template").html();
    gemCellTemplate = Handlebars.compile(gemCellSource);

    $('.nothing-found-row').addClass('hide');

    $.when(a1, a2).done(function(r1, r2) {
        allGems         = r1[0];
        abbreviations   = r2[0];

        $('.loading-container').addClass('hide');

        buildFromUrl();
    });
};

var pickAndOrganiseGems = function()
{
    classSelection = $('select.class-selection').val();
    gemGuideText   = $('input.gem-guide-text').val();

    gemsAvailableToClass = [];
    gemsNotAvailableToClass = [];

    //Vaal Gems are not available to any class
    _.each(allGems, function(item) {
        if(item.isVaal && isMatch(gemGuideText, item.name)) {
            gemsNotAvailableToClass.push(item);
            removeGemFromText(item.name);
        }
    });

    //Look for gems by full name
    _.each(allGems, function(item) {
        if(!item.isVaal && isMatch(gemGuideText, item.name)) {
            if(_.contains(item.available_to, classSelection)){
                gemsAvailableToClass.push(item);                
                removeGemFromText(item.name);
            }            
        }
    });

    //Look for abbreviated gems
    _.each(abbreviations, function(item) {
        if(isMatch(gemGuideText, item.abbr)) {

            if(_.isString(item.desc)){
                var gem = _.find(allGems, function(gemItem) { 
                    return gemItem.name.trim().toLowerCase() === item.desc.trim().toLowerCase()
                });
                if(gem){
                    gemsAvailableToClass.push(gem);
                    removeGemFromText(gem.name);
                }

            } else if(_.isArray(item.desc)){
                _.each(item.desc, function(descItem){
                    var gem = _.find(allGems, function(gemItem) { 
                        return gemItem.name.trim().toLowerCase() === descItem.trim().toLowerCase()
                    });
                    if(gem) {
                        gemsAvailableToClass.push(gem);
                        removeGemFromText(gem.name);
                    }
                });
            }            
        }
    });

    //Remaining Gems are not available to class
    _.each(allGems, function(item) {
        if(!item.isVaal && isMatch(gemGuideText, item.name)) {
            if(!_.contains(item.available_to, classSelection)){
                gemsNotAvailableToClass.push(item);
                removeGemFromText(item.name);
            }
        }
    });

    if(!gemsAvailableToClass.length && !gemsNotAvailableToClass.length){
        $('.nothing-found-row').removeClass('hide');
        clearGemTable();
        return false;
    } else {
        $('.nothing-found-row').addClass('hide');
    }

    gemsAvailableToClass = _.sortBy(gemsAvailableToClass, function(item) { return item.required_lvl; });

    buildGemTable();
    buildShareLink();
}

var buildShareLink = function()
{
    var shareLink = {}
    if(gemsAvailableToClass.length) shareLink.found = hashids.encode(_.pluck(gemsAvailableToClass, 'id'));
    if(gemsNotAvailableToClass.length) shareLink.not_found = hashids.encode(_.pluck(gemsNotAvailableToClass, 'id'));
    shareLink     = $.param(shareLink);

    $('.build-gem-link-container').removeClass('hide');
    $('.buildGemLink').text(location.origin + "/poeGems/?" + shareLink);
    $('.buildGemLink').attr('href', location.origin + "/poeGems/?" + shareLink);
}

var buildGemTable = function()
{
    $('.gem-tables-container').removeClass('hide');

    $('html, body').animate({
        scrollTop: $('.gem-tables-container').offset().top
    }, 300);

    clearGemTable();

    if(gemsAvailableToClass.length) {
        $('.foundGemsContainer').removeClass('hide');
        for(var i = 0; i < gemsAvailableToClass.length; i++) 
        {
            if(i % 4 === 0) {
                $('.gemTable').append('<div class="row"></div>');
            }

            var html = gemCellTemplate(gemsAvailableToClass[i]);
            $('.gemTable .row:last').append(html);
        }        
    }

    if(gemsNotAvailableToClass.length) {
        $('.notFoundGemsContainer').removeClass('hide');
        for(var i = 0; i < gemsNotAvailableToClass.length; i++) 
        {
            if(i % 4 === 0) {
                $('.notAvailableGemTable').append('<div class="row"></div>');    
            }
            var html = gemCellTemplate(gemsNotAvailableToClass[i]);
            $('.notAvailableGemTable .row:last').append(html);
        }        
    }
}

var clearGemTable = function()
{
    $('.gemTable').html('');
    $('.gemTable').append('<div class="row"></div>');
    $('.notAvailableGemTable').html('');
    $('.notAvailableGemTable').append('<div class="row"></div>');

    $('.foundGemsContainer').addClass('hide');
    $('.notFoundGemsContainer').addClass('hide');

    $('.build-gem-link-container').addClass('hide');
}

var buildFromUrl = function()
{
    var urlToParse  = location.search;  
    var result      = parseQueryString(urlToParse);
    var foundIds    = [];
    var notFoundIds = [];

    if(!result.found) return false;

    foundIds    = hashids.decode(result.found);
    notFoundIds = hashids.decode(result.not_found);

    gemsAvailableToClass = _.filter(allGems, function(item) {
        return _.contains(foundIds, item.id)
    });
    gemsNotAvailableToClass = _.filter(allGems, function(item) {
        return _.contains(notFoundIds, item.id)
    });

    if(!gemsAvailableToClass.length){
        $('.nothing-found-row').removeClass('hide');
        return false;
    }

    gemsAvailableToClass = _.sortBy(gemsAvailableToClass, function(item) { return item.required_lvl; });

    buildGemTable();
}

var parseQueryString = function(url)
{
    var urlParams = {};
    url.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) {
            urlParams[$1] = $3;
        }
    );

    return urlParams;
}

var isMatch = function(searchOnString, searchText) {
    searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return searchOnString.match(new RegExp("\\b"+searchText+"\\b", "i")) != null;
}

var removeGemFromText = function(gemTxt)
{
    var regEx = new RegExp(gemTxt, "ig");
    gemGuideText = gemGuideText.replace(regEx, '');
}

$('.gem-guide-form').validator().on('submit', function (e) {
    if (!e.isDefaultPrevented()) {
        pickAndOrganiseGems();        
        e.preventDefault();
    }
})

$('.clear-form-input').on('click', function() 
{
    clearGemTable();

    $('.nothing-found-row').addClass('hide');
    $('select.class-selection').val([]);
    $('input.gem-guide-text').val('');
});

$(document).on('click', '.gem-cell-content .item-complete', function(){
    var checked = $(this).prop('checked');
    if(checked) {
        $(this).parent().addClass('disabled');
    } else {
        $(this).parent().removeClass('disabled');
    }
});

$(document).ready(function() {
    init();
});
