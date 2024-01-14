/*
* Called when the item has been created or when creation failed due to an error.
*/
function onCreated()
{
    if (browser.runtime.lastError)
    {
        console.log("Error at creating menu: " + browser.runtime.lastError);
    } 
    else
    {
        console.log("Menu created successfully");
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
 * Creates the context menu item for showing all the items in the filter list
 */
browser.menus.create(
    {
        id: "show-filter-list",
        title: browser.i18n.getMessage("menuItemShowFilterList"),
        contexts: ["selection"]
    }, 
    onCreated
);

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
 * Gets called if the user clicks on the "add-to-filter-list" button 
 */
function OnAddToFilterList(selectionText)
{
    // Remove line breaks
    selectionText = selectionText.replace(/\n|\r/g, "");

    // Try to retrieve the array from storage
    var filterlist = [];
    let results = browser.storage.local.get({storagelist: []});
    results.then(
        function(item) 
        {
            if (item != null && item.storagelist != null)
            {
                filterlist = item.storagelist;
            }
        },
        function(e) { console.error(e); return; }
    ).then(
        function() 
        {
            // Add selected term to filter list
            filterlist.push(selectionText);
            console.log("Added '" + selectionText + "' to the FilterIt filter list");
        },
        function(e) { console.error(e); return; }
    ).then(
        function()
        {
            // Save array in storage
            if (filterlist != null)
            {
                let results = browser.storage.local.set({storagelist: filterlist});
                results.then(
                    function(item) { console.log("Saved FilterIt filter list to local storage"); },
                    function(e) { console.error(e); return; }
                );
            }
        },
        function(e) { console.error(e); return; }
    )
}

/**
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
                    console.log("FilterIt filter list element: " + element);
                });
            }
        },
        function(e) { console.error(e); return; }
    )
}

/**
 * Gets called if the user clicks on the "clear-filter-list" button 
 */
function OnClearFilterList()
{
    let results = browser.storage.local.remove({storagelist: []});
    results.then(
        function() { console.log("FilterIt filter list cleared"); },
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
            console.log(`Unknown menuItemId ${info.menuItemId}`);
    }
});