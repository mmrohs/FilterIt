/*
* Called when the item has been created or when creation failed due to an error.
*/
function onCreated()
{
    if (browser.runtime.lastError)
    {
        console.log("FilterIt - Error at creating menu: " + browser.runtime.lastError);
    } 
    else
    {
        console.log("FilterIt - Menu created successfully");
    }
}

/**
 * Creates the context menu item for adding new terms to the filter list
 */
browser.menus.create(
    {
        id: "add-to-filter-list",
        title: browser.i18n.getMessage("menuItemAddToFilterList"),
        contexts: ["selection"]
    }, 
    onCreated
);


/**
 * Creates the context menu item for showing all the items inside the filter list
 * +++ ONLY FOR DEBUGGING PURPOSES +++ 
 */
/*
browser.menus.create(
    {
        id: "show-filter-list",
        title: browser.i18n.getMessage("menuItemShowFilterList"),
        contexts: ["selection"]
    }, 
    onCreated
);*/

/**
 * Creates the context menu item for clearing the filter list
 */
browser.menus.create(
    {
        id: "clear-filter-list",
        title: browser.i18n.getMessage("menuItemClearFilterList"),
        contexts: ["selection"]
    }, 
    onCreated
);

/**
 * Adds a new item to the filter list
 * Gets called if the user clicks on the "add-to-filter-list" button 
 */
function OnAddToFilterList(selectionText)
{
    var oldLength = 0;
    var filterlist = [];

    // Try to retrieve the array from storage
    let results = browser.storage.local.get({storagelist: []});
    results.then(
        function(item) 
        {
            if (item != null && item.storagelist != null)
            {
                filterlist = item.storagelist;
                oldLength = filterlist.length;
            }
        },
        function(e) { console.error(e); return; }
    ).then(
        function() 
        {
            // Remove line breaks from the selected text
            selectionText = selectionText.replace(/\n|\r/g, "");

            // Adds the selected text to the filter list (unless it's already in there)
            if (!filterlist.includes(selectionText))
            {
                filterlist.push(selectionText);
                console.log("FilterIt - Added '" + selectionText + "' to the filter list");
            }
            else
            {
                console.log("FilterIt - Selected text '" + selectionText + "' already in the filter list");
            }
        },
        function(e) { console.error(e); return; }
    ).then(
        function()
        {
            // Save array to local storage
            if (filterlist != null && filterlist.length > oldLength)
            {
                let results = browser.storage.local.set({storagelist: filterlist});
                results.then(
                    function(item) { console.log("FilterIt - Saved the filter list to local storage"); },
                    function(e) { console.error(e); return; }
                );
            }
        },
        function(e) { console.error(e); return; }
    )
}

/**
 * Outputs all filter list items to the browser console
 * Gets called if the user clicks on the "show-filter-list" button 
 */
function OnShowFilterList()
{
    var filterlist = [];
    let results = browser.storage.local.get({storagelist: []});
    results.then(
        function(item) { filterlist = item.storagelist; },
        function(e) { console.error(e); return; }
    ).then(
        function()
        {
            if (filterlist != null)
            {
                filterlist.forEach(element => {
                    console.log("FilterIt - filter list element: " + element);
                });
            }
        },
        function(e) { console.error(e); return; }
    )
}

/**
 * Clears the filter list
 * Gets called if the user clicks on the "clear-filter-list" button 
 */
function OnClearFilterList()
{
    var filterlist = [];
    let results = browser.storage.local.set({storagelist: filterlist});
    results.then(
        function() { console.log("FilterIt - filter list cleared"); },
        function(e) { console.error(e); return; }
    );
}

/**
 * Event listener for the extension specific context menu items
 */
browser.menus.onClicked.addListener((info, tab) => 
{
    switch (info.menuItemId)
    {
        case "add-to-filter-list":
            OnAddToFilterList(info.selectionText);
            break;
        case "show-filter-list":
            OnShowFilterList();
            break;
        case "clear-filter-list":
            OnClearFilterList();
            break;
        default:
            console.log(`FilterIt - Unknown menuItemId ${info.menuItemId}`);
    }
});