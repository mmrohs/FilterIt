"use strict";

// Console Marker
console.time('FilterIt');

var node;
var nodeIterator;
var nodeData;
var tagName = '';

main();

/**
 * The main algorithm of this extension
 */
function main()
{
	// Create an iterator for all the Nodes
	var nodeIterator = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	if (nodeIterator == null)
	{
		console.log("Error: nodeIterator == null");
		return;
	}

	while (node = nodeIterator.nextNode()) 
	{
		nodeData = node.data.trim();
		tagName = node.parentElement.tagName.toLowerCase();
		if (NodeCanBeSkipped(nodeData, tagName))
			continue;

		console.log("node.data: " + node.data);
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

	const relevantTags = ["div","li","span","p",,"b","i","h1","h2","h3","h4","h5","h6","em","a","td"];
	for (let i = 0; i < relevantTags.length ; i++)
	{
		if (tagName == relevantTags[i])
			return false;
	}
	return true;
}

// Show execution time in console
console.timeEnd('FilterIt');
