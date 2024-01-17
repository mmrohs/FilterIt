"use strict";

// Relevant tags for filtering
const relevantTags = new Set(["div","li","span","p","b","i","h1","h2","h3","h4","h5","h6","em","a","td"]);

// Filter terms specified by the user
var filterlist = [];


main();


/**
 * The main algorithm of this extension
 */
async function main()
{
	console.time('FilterIt');

	let bOK = await LoadAndCheckFilterlist();
	if (!bOK)
		return;

	await FilterDocument();

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
					// +++ DEBUG +++
					//console.log("node.tagName: " + node.tagName + ", node.data: " + node.data);
					
				// Replace the text in the node and all of its sibling notes 
				FilterNoteAndSiblings(node)
			}
		}

		// +++ DEBUG +++
		//console.log("tagName: " + tagName + ", node.data: " + node.data);
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
 * Filters the note and all of its sibling notes (with the same parent note)
 * The first note gets the '+++ filtered +++' text, the rest are cleared
 */
function FilterNoteAndSiblings(node)
{
	var parentNode = node.parentElement;

	// +++ DEBUG +++
	//console.log("parentNode.tagName: " + parentNode.tagName + ", parentNode.data: " + parentNode.data);
	//console.log("parentNode.textContent: " + parentNode.textContent);

	var i = 0;
	for (var childNode of parentNode.childNodes)
	{
		// +++ DEBUG +++
		//console.log("childNode.tagName: " + childNode.tagName + ", childNode.data: " + childNode.data);

		if (i++ == 0)
		{
			childNode.data = "+++ filtered +++";
		}
		else
		{
			childNode.data = "";
		}
	}
}
