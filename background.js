/*
* Called when the item has been created or when creation failed due to an error.
*/
function onCreated()
{
    if (browser.runtime.lastError)
    {
        console.log(`Error: ${browser.runtime.lastError}`);
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
 * Creates the context menu item for clearing the filter list
 */
browser.menus.create(
    {
        id: "clear-filter-list",
        title: browser.i18n.getMessage("menuItemClearFilterList"),
        contexts: ["selection","tools_menu"]
    }, 
    onCreated
);

/**
 * Definition of the filter list storage object
 */
let FilterList = 
{
    items: []
};

/**
 * Gets called if the user clicks on the "add-to-filter-list" button 
 */
function OnAddToFilterList(selectionText)
{
    // Try to retrieve the array from storage
    var filterList = null;
    let results = browser.storage.local.get("FilterList");
    results.then(
        function(storedlist) { filterList = storedlist; },
        function(e) { console.error(e); }
    );

    // Add array to storage if necessary
    if (filterList == null)
    {
        let results = browser.storage.local.set(FilterList);
        results.then(
            function(storedlist) { filterList = storedlist; },
            function(e) { console.error(e); }
        );
    }

    console.log("Added '" + selectionText + "' to the FilterIt filter list");
}

/**
 * Gets called if the user clicks on the "clear-filter-list" button 
 */
function OnClearFilterList()
{
    let results = browser.storage.local.remove("FilterList");
    results.then(
        function() { console.log("filter list cleared"); },
        function(e) { console.error(e); }
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
        case "clear-filter-list":
            OnClearFilterList();
            break;
    }
});