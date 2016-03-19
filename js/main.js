var allGems, poeAbbreviations, classSelection, gemGuideText, gemsAvailableToClass, gemsNotAvailableToClass, hashids, gemCellSource, gemCellTemplate;

var init = function()
{
    var a1 = $.get('json/gems.json'),
        a2 = $.get('json/poeAbbreviations.json');

    hashids = new Hashids("ad5b8cb26d9e1739be52d6ab14969873", 8, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");

    gemCellSource   = $("#gem-cell-template").html();
    gemCellTemplate = Handlebars.compile(gemCellSource);

    $('.nothing-found-row').addClass('hide');

    $.when(a1, a2).done(function(r1, r2) {
        allGems          = r1[0];
        poeAbbreviations = r2[0];

        $('.loading-container').addClass('hide');

        buildFromUrl();
    });
};

var handleErrors = function()
{
    classSelection = $('select.class-selection').val();
    gemGuideText   = $('input.gem-guide-text').val();

    if(classSelection && gemGuideText)
    {
        return true;
    }

    if(!classSelection)
    {
        alert("EMPTY classSelection");
    }

    if(!gemGuideText)
    {
        alert("EMPTY gemGuideText");
    }

    return false;

};

var pickAndOrganiseGems = function()
{

    gemsAvailableToClass = [];
    gemsNotAvailableToClass = [];

    _.each(allGems, function(item) {
        if(item.isVaal && isMatch(gemGuideText, item.name)) {
            gemsNotAvailableToClass.push(item);
            removeGemFromText(item.name);
        }
    });

    _.each(allGems, function(item) {
        if(!item.isVaal && isMatch(gemGuideText, item.name)) {

            if(_.contains(item.available_to, classSelection)){
                gemsAvailableToClass.push(item);                    
            } else {
                gemsNotAvailableToClass.push(item);
            }

            removeGemFromText(item.name);
            
        }
    });

    if(!gemsAvailableToClass.length && !gemsNotAvailableToClass.length){
        $('.nothing-found-row').removeClass('hide');
        return false;
    }


    gemsAvailableToClass = _.sortBy(gemsAvailableToClass, function(item) { return item.required_lvl; });

    //TODO:
    //ABBREVIATIONS
    //MISSPELLS?

    buildShareLink();
    buildGemTable();
}

var buildShareLink = function()
{
    var shareLink = {'found': hashids.encode(_.pluck(gemsAvailableToClass, 'id')), 'not_found': hashids.encode(_.pluck(gemsNotAvailableToClass, 'id'))};
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

    for(var i = 0; i < gemsAvailableToClass.length; i++) 
    {
        if(i % 4 === 0) {
            $('.gemTable').append('<div class="row"></div>');
        }

        var html = gemCellTemplate(gemsAvailableToClass[i]);
        $('.gemTable .row:last').append(html);
    }

    for(var i = 0; i < gemsNotAvailableToClass.length; i++) 
    {
        if(i % 4 === 0) {
            $('.notAvailableGemTable').append('<div class="row"></div>');    
        }
        var html = gemCellTemplate(gemsNotAvailableToClass[i]);
        $('.notAvailableGemTable .row:last').append(html);
    }
}

var clearGemTable = function()
{
    $('.gemTable').html('');
    $('.gemTable').append('<div class="row"></div>');
    $('.notAvailableGemTable').html('');
    $('.notAvailableGemTable').append('<div class="row"></div>');
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

$('.gem-guide-form').submit(function( event ) {
    event.preventDefault();

    if(!handleErrors()){
        return false;
    }

    pickAndOrganiseGems();
});

$('.clear-form-input').on('click', function(){
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
