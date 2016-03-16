$(document).ready(function() {
    $('select').material_select();
});

(function(){
    var allGems, vaalGems, quest_rewards, vendor_rewards, grouped_quest_rewards, grouped_vendor_rewards, classSelection, gemGuideText, orderedGems, foundGemsFromGuideTxt, notFoundGemsFromGuideTxt;

    var init = function()
    {
        var a1 = $.get('/json/quest_reward_filtered.json'),
        a2     = $.get('/json/vendor_reward.json'),
        a3     = $.get('/json/gems.json'),
        a4     = $.get('/json/vaalGems.json'),
        a5     = $.get('/json/poeAbbreviations.json');

        $.when(a1, a2, a3, a4, a5).done(function(r1, r2, r3, r4, r5) {
            quest_rewards    = r1[0];
            vendor_rewards   = r2[0];
            allGems          = r3[0];
            vaalGems         = r4[0];
            poeAbbreviations = r5[0];

            grouped_quest_rewards  = _.groupBy(quest_rewards, 'class');
            grouped_vendor_rewards = _.groupBy(vendor_rewards, 'class');

        });
    };

    var handleErrors = function()
    {
        classSelection = $('select.class-selection').val();
        gemGuideText   = $('input.gem-guide-text').val();

        if(classSelection && gemGuideText)
        {
            classSelection = classSelection.toLowerCase();
            classSelection = classSelection.charAt(0).toUpperCase() + classSelection.slice(1);

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
        var classQuestRewards  = grouped_quest_rewards[classSelection];
        var classVendorRewards = grouped_vendor_rewards[classSelection];

        foundGemsFromGuideTxt = [];
        notFoundGemsFromGuideTxt = [];

        _.each(vaalGems, function(item) {
            if(isMatch(gemGuideText, item)) {
                notFoundGemsFromGuideTxt.push(item);
                removeGemFromText(item);
            }
        });

        _.each(classVendorRewards, function(item) {
            if(isMatch(gemGuideText, item.reward)) {
                foundGemsFromGuideTxt.push(item);
                removeGemFromText(item.reward);
            }
        });

        _.each(classQuestRewards, function(item) {
            if(isMatch(gemGuideText, item.reward)) {
                foundGemsFromGuideTxt.push(item);
                removeGemFromText(item.reward);
            }
        });

        _.each(allGems, function(item) {
            if(isMatch(gemGuideText, item)) {
                notFoundGemsFromGuideTxt.push(item);
                removeGemFromText(item);
            }
        });



        foundGemsFromGuideTxt = _.sortBy(foundGemsFromGuideTxt, function(item) { return item.quest_id; })

        //TODO
        //ABBREVIATIONS
        //MISSPELLS?

        console.log("foundGemsFromGuideTxt", foundGemsFromGuideTxt);
        console.log("notFoundGemsFromGuideTxt", notFoundGemsFromGuideTxt);
        console.log("gemGuideText", gemGuideText);

        buildGemTable();
    }

    var buildGemTable = function()
    {
        var act1Gems = "";
        var act2Gems = "";
        var act3Gems = "";
        var act4Gems = "";
        var row      = "";

        _.each(foundGemsFromGuideTxt, function(item) {
            var itemLoc = item.quest_id.substring(0, 2);
            var gemImgName = item.reward.toLowerCase().trim().split(' ').join('_');

            switch(itemLoc){
                case 'a1':
                    act1Gems += "<div>"+item.reward+"</br>"+item.quest+"</br>"+item.npc+"</div>";
                break;
                case 'a2':
                    act2Gems += "<div>"+item.reward+"</br>"+item.quest+"</br>"+item.npc+"</div>";
                break;
                case 'a3':
                    act3Gems += "<div>"+item.reward+"</br>"+item.quest+"</br>"+item.npc+"</div>";
                break;
                case 'a4':
                    act4Gems += "<div>"+item.reward+"</br>"+item.quest+"</br>"+item.npc+"</div>";
                break;
            }

            row += "<tr><td>"+ act1Gems +"</td><td>"+ act2Gems +"</td><td>"+ act3Gems +"</td><td>"+ act4Gems +"</td></tr>";
        });

        console.log(row);


        $('.gemTable tbody').append(row);

        
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

    init();

    $('.gem-guide-form').submit(function( event ) {
        event.preventDefault();

        if(!handleErrors()){
            return false;
        }

        if(grouped_quest_rewards && grouped_vendor_rewards && allGems)
        {
            pickAndOrganiseGems();
        }
    });


})()