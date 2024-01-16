"use strict";

// Relevant tags for filtering
const relevantTags = new Set(["div","li","span","p",,"b","i","h1","h2","h3","h4","h5","h6","em","a","td"]);

// Filter terms specified by the user
var filterlist = [];


main();


/**
 * The main algorithm of this extension
 */
async function main()
{
	console.time('FilterIt');
	console.time('Time1');

	let bOK = await LoadAndCheckFilterlist();
	if (!bOK)
		return;

	console.timeEnd('Time1');
	console.time('Time2');

	await FilterDocument();

	console.timeEnd('Time2');

	// Show execution time in console
	console.timeEnd('FilterIt');
}

/**
 * Retrieves and checks the filter list from local storage
 */
async function LoadAndCheckFilterlist()
{
	// Try to retrieve the filter list from storage
	let ret = await GetFilterlist();
	if (!ret)
		return false;

	if (filterlist != null)
	{
		console.log("FilterIt - items in the filter list: " + filterlist.length);
	}

	// Check if the user chose set any filters yet
	return filterlist != null && filterlist.length > 0;
}

/**
 * Retrieves the filter list from local storage and copies the filtered terms to 'filterlist'
 */
async function GetFilterlist()
{
	async function ReadFromStorage()
	{
		return new Promise((resolve, reject) => 
		{
			let results = browser.storage.local.get({storagelist: []});
			results.then(
				function(item) 
				{
					if (item != null && item.storagelist != null && item.storagelist != undefined)
					{
						resolve(item.storagelist);
					}
					else
					{
						reject();
					}
				},
				function(e) { console.error(e); reject(); }
			)
		});
	}

	let storagelist = await ReadFromStorage();
	if (storagelist != null && storagelist != undefined)
	{
		filterlist = storagelist;
		return true;
	}
	else
	{
		return false;
	}
}

/**
 * Determines if a node can be skipped or not
 * @returns true if the node can be skipped
 */
function NodeCanBeSkipped(nodeData, tagName)
{
	// minimum of text: 3 characters
	if (nodeData.length <= 3)
		return true;

	// check if it's one of the relevant html tags
	return !relevantTags.has(tagName);
}

/**
 * Applies the user defined filter to the website document
 */
async function FilterDocument()
{
	// Create an iterator for all the Nodes
	var nodeIterator = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	if (nodeIterator == null)
	{
		console.log("Error: nodeIterator == null");
		return;
	}

	var node;
	var tagName;
	var nodeData;
	while (node = nodeIterator.nextNode())
	{
		nodeData = node.data.trim().toLowerCase();
		tagName = node.parentElement.tagName.toLowerCase();
		if (NodeCanBeSkipped(nodeData, tagName))
			continue;

		// Check if the node text contains one of the filtered terms
		let filter;
		for (let i = 0; i < filterlist.length; i++)
		{
			filter = filterlist[i].toLowerCase();
			if (nodeData.search(filter) != -1)
			{
				// Replace the node text
				node.data = "+++ filtered +++";
			}
		}

		// +++ DEBUG +++
		// console.log("node.data: " + node.data);
	}
} 