import * as d3 from "d3";
class GraphCanvasUtil {

    /**
     * This method removes the element of given Id by fading it out over
     * transitionTime (parameter) milliseconds
     * @param {String} id id of the element that should be removed
     * @param {Integer} transitionTime 
     */
    static async removeElementById(id, transitionTime) {
        await d3
            .select(`#${id}`)
            .transition()
            .duration(transitionTime)
            .style("opacity", 0)
            .end();

        d3.select(`#${id}`).remove();
    }

    /**
     * This method moves the circle represented by the given id (parameter) to
     * new coordinates (newPosX, newPosY) over the given period of time (transitionTime)
     * Note: This does not work for group because group does not have a x and y coordinate
     * @param {String} id id of the cicle in DOM that should be moved
     * @param {Integer} newPosX New X coodinate
     * @param {Integer} newPosY New Y coordinate
     * @param {Integer} transitionTime animation time in milliseconds 
     * @returns {Promise} Returns a Promise that resolves after thetransition is complete. If the 
     * transition is cancelled or interrupted, the promise rejects
     */
    static moveCircularNodeById(id, newPosX, newPosY, transitionTime) {
        return d3
            .select(`#${id}`)
            .transition()
            .duration(transitionTime)
            .attr("cx", newPosX)
            .attr("cy", newPosY)
            .end();
    }

    static translateNode(id, translationX, translationY, transitionTime) {
        return d3
            .select(`#${id}`)
            .transition()
            .duration(transitionTime)
            .attr(
                "transform",
                `translate(${translationX}, ${translationY})`
            )
            .end();
    }

    /**
     * This method traverses along the nodes (parameter) in the DOM. Although, the nodes
     * are D3 objects, this method assumes that they are also drawn in the DOM. The traversal
     * occurs by iterating through each nodes and drawing hilighting them along the edges by drawing
     * an overlapping circle. The radius and strokeWidth of the overlapping circle is 
     * determined by measuring the radius and stroke width of the first circles in the
     * given list of the nodes
     *
     * @param {Array} nodes - An array of nodes which should be traversed in the DOM
     * @param {Array} parentGroup - SVG group element which parents all the nodes that are going to be traversed
     * @param {Boolean} fadeOutAtEnd - If true, the overlapping circle will fade out when it reaches the last
     * node in the given list of nodes. Otherwise, the overlapping circle will not be removed after the 
     * traversal
     * @param {String} selectionId - id that should be assigned to the overlapping circle
     * @param {String} ringColor - Hex color string that should be applied to the border of the overlapping
     * circle
     * @param {Integer} transitionTime - 
     */
    static async traverseCircularNodes(nodes, parentGroup, fadeOutAtEnd, selectionId, ringColor, transitionTime, collector = null) {

        if (nodes.length === 0) return;

        let currentNode = nodes[0];
        // eslint-disable-next-line no-unused-vars
        let currentNodeInDOM = d3.select(`#${currentNode.data.id}`).select("circle");
        let currentNodeRadius = parseInt(currentNodeInDOM.style("r").replace("px", ""));
        let currentNodeStrokeWidth = parseInt(currentNodeInDOM.style("stroke-width").replace("px", ""));

        let overlappingCircleRadius = currentNodeRadius + currentNodeStrokeWidth;

        let outerRing = parentGroup
            .append("circle")
            .attr("id", selectionId)
            .style("opacity", "0")
            .attr("cx", currentNode.x) //TODO: 50 is the actual transaction of the svg. Make this a variable
            .attr("cy", currentNode.y) //TODO: 50 is the actual transaction of the svg. Make this a variable
            .attr("r", overlappingCircleRadius)
            .attr("fill", "none")
            .attr("stroke-width", `${currentNodeStrokeWidth + 1}px`)
            .attr("stroke", ringColor);


        await outerRing
            .transition()
            .ease(d3.easeLinear)
            .duration(transitionTime)
            .style("opacity", "1")
            .end();

        if (collector !== null) collector.push(currentNode.data.key);
        // Note: Do not use nodes.splice(1) to iterate
        // through the nodes as it modified the original
        // nodes array
        for (let i = 1; i < nodes.length; i++) {
            const node = nodes[i];

            await GraphCanvasUtil.moveCircularNodeById(
                selectionId,
                node.x,
                node.y,
                transitionTime
            );

            currentNode = node;
            if (collector !== null) collector.push(node.data.key);
        }

        if (fadeOutAtEnd) {
            // this.fadeOutRing(selectionId);
            GraphCanvasUtil.removeElementById(
                selectionId,
                transitionTime
            );
        }
        return currentNode;
    }

    static async traverseCircularNodesById(nodeIds, parentGroup, fadeOutAtEnd, selectionId, ringColor, transitionTime, collector = null) {
        if (nodeIds.length === 0) return;

        const nodes = [];
        nodeIds.forEach((id) => {
            let datum = d3.select(`#${id}`).datum();
            nodes.push(datum);
        });

        GraphCanvasUtil.traverseCircularNodes(nodes, parentGroup, fadeOutAtEnd, selectionId, ringColor, transitionTime, collector);
    }

    /**
     * Draws nodes using the specified cssSelectionClass string. A node
     * is a group that contains a circle and a text inside the circle. The text
     * represents the key of the node.
     *
     * @param node Object - A Node object as represented in d3 tree hierarchy. This can be a root/parent node (in which case
     * all the descendant nodes are also drawn). This can also be a single node, in which case the single node is drawn
     * @param cssClass String - CSS class that should be used to select the existing
     *      node to update. Note: All the existing nodes are updated before binding a new node
     * @param translate Boolean - By default, the nodes appear at (0,0) position on the screen although their datum may have x and y position
     * specified. Unless this argument is true, the nodes will not be translated to their new position
     * */
    static async drawCircularNodes(nodes, opt) {

        opt.parentClass = opt.parentClass || "svg";

        //Class that should be assigned to the node
        opt.cssClass = opt.cssClass || "node";
        opt.removeExitNodes = opt.removeExitNodes || false;
        opt['stroke-width'] = opt['stroke-width'] || "2px";
        opt['stroke'] = opt['stroke'] || 'red';
        opt['radius'] = opt['radius'] || "50px";
        opt['fill'] = opt['fill'] || 'blue';
        opt['font-size'] = opt['font-size'] || '12px';
        opt['font-color'] = opt['font-color'] || 'red';
        //By default, the nodes appear at (0,0) position on the screen although their datum may have x and y position
        //specified. Unless this argument is true, the nodes will not be translated to their new position
        opt.fixedAtOrigin = opt.fixedAtOrigin || false;

        opt.transitionTime = opt.transitionTime || 1000;


        let updateNodes = d3.select(`.${opt.parentClass}`)
            .selectAll(`.${opt.cssClass}`)
            .data(nodes, node => node.data.id);

        const enterNode = updateNodes
            .enter()
            .append("g")
            .attr("id", d => {
                return d.data.id;
            })
            .attr("class", opt.cssClass);

        if (opt.removeExitNodes) {
            updateNodes.exit().remove();
        }

        enterNode
            .append("circle")
            .attr("r", opt.radius)
            .attr("stroke", opt.stroke)
            .attr("stroke-width", opt['stroke-width'])
            .attr("fill", opt.fill);

        //append text
        enterNode
            .append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", opt['font-size'])
            .attr("fill", opt['font-color'])
            .attr("transform", `translate(0, 7)`)
            .text(d => d.data.key);

        if (!opt.fixedAtOrigin) {
            await enterNode
                .merge(updateNodes)
                .transition()
                .duration(opt.transitionTime)
                .attr("transform", function (d) {
                    return `translate(${d.x},${d.y})`;
                })
                .end();
        }
    }

    /**
     * This method draws a links between each descendant node of the given node in the parameter and it's parent.
     * For example, if the given node is Node(5) which has a left child Node(4), and Node(4) has a left child Node(3), a link is
     * drawn between Node(5) and Node(4), another between Node(4) and Node(3)
     */
    static async drawLinks(nodes, opt) {

        opt.parentClass = opt.parentClass || "svg";
        opt.cssClass = opt.cssClass || 'link';
        opt.removeExitLinks = opt.removeExitLinks === undefined ? true : opt.removeExitLinks;
        opt['stroke-width'] = opt['stroke-width'] || "2px";
        opt['stroke'] = opt['stroke'] || 'red';
        opt.transitionTime = opt.transitionTime || 1000;

        const updateLinks = d3.select(`.${opt.parentClass}`)
            .selectAll(`.${opt.cssClass}`)
            .data(nodes, node => node.data.id);

        let enterLinks = updateLinks
            .enter()
            .append("line")
            .attr("id", function (node) {
                return `link-${node.data.id}`
            })
            .attr("class", opt.cssClass)
            .attr("stroke-width", opt['stroke-width'])
            .attr("stroke", opt['stroke'])
            .attr("x1", d => {
                return d.parent.x;
            })
            .attr("y1", d => {
                return d.parent.y;
            })
            .attr("x2", function (d) {
                return d.parent.x;
            })
            .attr("y2", d => {
                return d.parent.y;
            });

        //Remove any links from the DOM which could not be bound to a datum
        if (opt.removeExitLinks) {
            updateLinks.exit().remove();
        }

        // Before the animation, lower the links
        // to appear behind the circle
        enterLinks.lower();

        await enterLinks
            .merge(updateLinks)
            .transition()
            .duration(opt.transitionTime)
            .attr("x1", d => {
                return d.parent.x;
            })
            .attr("y1", d => {
                return d.parent.y;
            })
            .attr("x2", function (d) {
                return d.x;
            })
            .attr("y2", d => {
                return d.y;
            })
            .end();
    }


}

export {
    GraphCanvasUtil
}