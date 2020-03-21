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

    /**
     * This translates the group element node to new coordinate
     * @param {*} id 
     * @param {*} translationX 
     * @param {*} translationY 
     * @param {*} transitionTime 
     */
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

        let currentNodeId = currentNode.data === undefined ? currentNode.id : currentNode.data.id;
        let currentNodeInDOM = d3.select(`#${currentNodeId}`).select("circle");
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

        outerRing.raise();


        await outerRing
            .transition()
            .ease(d3.easeLinear)
            .duration(transitionTime)
            .style("opacity", "1")
            .end();

        if (collector !== null) {
            let key = currentNode.data === undefined ? currentNode.key : currentNode.data.key;
            collector.push(key);
        }
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
            if (collector !== null) {
                const key = node.data === undefined ? node.key : node.data.key;
                collector.push(key);
            }
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
        // eslint-disable-next-line no-debugger
        debugger;
        if (nodeIds.length === 0) return;

        const nodes = [];
        nodeIds.forEach((id) => {
            // let datum = d3.select(`#${id}`).datum();
            let d = d3.select(`#${id}`);
            let datum = d.datum();
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
        opt.removeExitNodes = opt.removeExitNodes === undefined ? false : opt.removeExitNodes;
        opt['stroke-width'] = opt['stroke-width'] || "2px";
        opt['stroke'] = opt['stroke'] || 'red';
        opt['radius'] = opt['radius'] || "50px";
        opt['fill'] = opt['fill'] || 'blue';
        opt['font-size'] = opt['font-size'] || '12px';
        opt['font-color'] = opt['font-color'] || 'red';
        //By default, the nodes appear at (0,0) position on the screen although their datum may have x and y position
        //specified. Unless this argument is true, the nodes will not be translated to their new position
        opt.fixedAtOrigin = opt.fixedAtOrigin || false;

        opt.transitionTime = opt.transitionTime === undefined ? 0 : opt.transitionTime;


        opt.click = opt.click === undefined ? null : opt.click;
        opt.mouseover = opt.mouseover === undefined ? null : opt.mouseover;
        opt.mouseout = opt.mouseout === undefined ? null : opt.mouseout;
        opt.dragEvents = opt.dragEvents === undefined ? null : opt.dragEvents;


        let updateNodes = d3.select(`.${opt.parentClass}`)
            .selectAll(`.${opt.cssClass}`)
            .data(nodes, node => {
                return node.data === undefined ? node.id : node.data.id
            });

        const enterNode = updateNodes
            .enter()
            .append("g")
            .attr("id", d => {
                return d.data === undefined ? d.id : d.data.id;
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
            .text(d => {
                return d.data === undefined ? d.key : d.data.key
            });

        // enterNode.on("mouseover", function (d) {
        //     opt.mouseover(this, d);
        // });

        if (opt.mouseover !== null) {
            enterNode.on("mouseover", function (d, i) {
                opt.mouseover(this, d, i);
            });
        }

        if (opt.mouseover !== null) {
            enterNode.on("mouseout", function (d, i) {
                opt.mouseout(this, d, i);
            });
        }

        if (opt.click !== null) {
            enterNode.on("click", function (d, i) {
                opt.click(this, d, i);
            });
        }

        if (opt.dragEvents !== null) {
            enterNode.call(
                d3
                .drag()
                .on("start", function (d, i) {
                    opt.dragEvents.start(d, i);
                })
                .on("drag", function (d, i) {
                    opt.dragEvents.drag(d, i);
                })
                .on("end", function (d, i) {
                    opt.dragEvents.end(d, i);
                })
            );
        }



        //group element don't have x and y position. They need to be translated
        //by using transform property. if fixedAtOrigin is true, it means
        //the group element should be kept at origin
        if (!opt.fixedAtOrigin) {
            let mergedNode = enterNode.merge(updateNodes);

            //If the transitionTime is greater than 0, translate the node with transition
            //Otherwise, simply translate the node
            if (opt.transitionTime > 0) {
                await mergedNode.transition().duration(opt.transitionTime)
                    .attr("transform", function (d) {
                        return `translate(${d.x},${d.y})`;
                    })
                    .end();

            } else {
                mergedNode
                    .attr("transform", function (d) {
                        return `translate(${d.x},${d.y})`;
                    })
            }
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
        opt.removeExitLinks = opt.removeExitLinks === undefined ? false : opt.removeExitLinks;
        opt['stroke-width'] = opt['stroke-width'] || "2px";
        opt['stroke'] = opt['stroke'] || 'red';
        opt.transitionTime = opt.transitionTime === undefined ? 0 : opt.transitionTime;
        opt.mouseover = opt.mouseover === undefined ? null : opt.mouseover;
        opt.mouseout = opt.mouseout === undefined ? null : opt.mouseout;
        opt.click = opt.click === undefined ? null : opt.click;

        const updateLinks = d3.select(`.${opt.parentClass}`)
            .selectAll(`.${opt.cssClass}`)
            .data(nodes, node => {
                return node.data === undefined ? node.id : node.data.id;
            });

        let enterLinks = updateLinks
            .enter()
            .append("line")
            .attr("id", function (node) {
                return `link-${node.data === undefined ? node.id : node.data.id}`
            })
            .attr("class", opt.cssClass)
            .attr("stroke-width", opt['stroke-width'])
            .attr("stroke", opt['stroke']);

        //Remove any links from the DOM which could not be bound to a datum
        if (opt.removeExitLinks) {
            updateLinks.exit().remove();
        }

        // Before the animation, lower the links
        // to appear behind the circle
        enterLinks.lower();

        //If the transition time is 0, the nodes
        //should appear to grow from source to the target
        if (opt.transitionTime === 0) {
            enterLinks.attr("x1", d => {
                    // return d.parent.x;
                    return d.parent === undefined ? d.source.x : d.parent.x;
                })
                .attr("y1", d => {
                    // return d.parent.y;
                    return d.parent === undefined ? d.source.y : d.parent.y;
                })
                .attr("x2", function (d) {
                    // return d.parent.x;
                    return d.parent === undefined ? d.source.x : d.parent.x;
                })
                .attr("y2", d => {
                    // return d.parent.y;
                    return d.parent === undefined ? d.source.y : d.parent.y;
                });
        }

        if (opt.mouseover !== null) {
            enterLinks.on("mouseover", function (d, i) {
                opt.mouseover(this, d, i);
            });
        }

        if (opt.mouseout !== null) {
            enterLinks.on("mouseout", function (d, i) {
                opt.mouseout(this, d, i);
            });
        }

        if (opt.click !== null) {
            enterLinks.on("click", function (d, i) {
                d3.event.stopPropagation();
                opt.click(this, d, i);
            });
        }

        await enterLinks
            .merge(updateLinks)
            .transition()
            .duration(opt.transitionTime)
            .attr("x1", d => {
                // return d.parent.x;
                return d.parent === undefined ? d.source.x : d.parent.x;
            })
            .attr("y1", d => {
                // return d.parent.y;
                return d.parent === undefined ? d.source.y : d.parent.y;
            })
            .attr("x2", function (d) {
                // return d.x;
                return d.x === undefined ? d.target.x : d.x;
            })
            .attr("y2", d => {
                // return d.y;
                return d.y === undefined ? d.target.y : d.y;
            })
            .end();
    }

    /**
     * This method draws a links between each descendant node of the given node in the parameter and it's parent.
     * For example, if the given node is Node(5) which has a left child Node(4), and Node(4) has a left child Node(3), a link is
     * drawn between Node(5) and Node(4), another between Node(4) and Node(3)
     */
    static async drawLinksGraph(links, opt) {

        opt.parentClass = opt.parentClass || "svg";
        opt.cssClass = opt.cssClass || 'link';
        opt.removeExitLinks = opt.removeExitLinks === undefined ? false : opt.removeExitLinks;
        opt['stroke-width'] = opt['stroke-width'] || "2px";
        opt['stroke'] = opt['stroke'] || 'red';
        opt.transitionTime = opt.transitionTime === undefined ? 0 : opt.transitionTime;
        opt.mouseover = opt.mouseover === undefined ? null : opt.mouseover;
        opt.mouseout = opt.mouseout === undefined ? null : opt.mouseout;
        opt.click = opt.click === undefined ? null : opt.click;

        opt.radiusOffset = opt.radiusOffset === undefined ? 30 : opt.radiusOffset;

        links.forEach((link) => {
            let distance = Math.sqrt((link.source.x - link.target.x) ** 2 + (link.source.y - link.target.y) ** 2);

            link.distance = distance;
        });

        const updateLinks = d3.select(`.${opt.parentClass}`)
            .selectAll(`.${opt.cssClass}`)
            .data(links, link => {

                return `${link.source.id}-link-${link.target.id}`
            });

        let enterLinks = updateLinks
            .enter()
            .append("g")
            .attr("id", function (link) {
                return `${link.source.id}-link-${link.target.id}`
            })
            .attr("class", opt.cssClass)


        enterLinks.append("line")
            .attr("stroke-width", opt['stroke-width'])
            .attr("stroke", opt['stroke']);

        //Remove any links from the DOM which could not be bound to a datum
        if (opt.removeExitLinks) {
            updateLinks.exit().remove();
        }

        // Before the animation, lower the links
        // to appear behind the circle
        enterLinks.lower();



        if (opt.mouseover !== null) {
            enterLinks.on("mouseover", function (d, i) {
                opt.mouseover(this, d, i);
            });
        }

        if (opt.mouseout !== null) {
            enterLinks.on("mouseout", function (d, i) {
                opt.mouseout(this, d, i);
            });
        }

        if (opt.click !== null) {
            enterLinks.on("click", function (d, i) {
                d3.event.stopPropagation();
                opt.click(this, d, i);
            });
        }



        await enterLinks
            .merge(updateLinks)
            .select("line")
            .transition()
            .duration(opt.transitionTime)
            .attr("x1", link => {
                // return d.x;
                // return d.target.x;
                let targetDistance = opt.radiusOffset;

                //vector from source to target
                let vector = [link.target.x - link.source.x, link.target.y - link.source.y];

                let magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
                let unitVector = [vector[0] / magnitude, vector[1] / magnitude];

                // //Now compute the target
                let x = link.source.x + targetDistance * unitVector[0];
                // link.target.y = link.source.y + targetDistance * unitVector[1];
                return x;
            })
            .attr("y1", link => {
                // return d.parent.y;
                // return d.source.y;
                // return d.y;
                // return d.target.y;

                //compute the target
                let targetDistance = opt.radiusOffset;

                //vector from source to target
                let vector = [link.target.x - link.source.x, link.target.y - link.source.y];

                let magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
                let unitVector = [vector[0] / magnitude, vector[1] / magnitude];

                // //Now compute the target
                // link.target.x = link.source.x + targetDistance * unitVector[0];
                let y = link.source.y + targetDistance * unitVector[1];
                return y;
            })
            .attr("x2", function (link) {
                // return d.x;
                // return d.target.x;
                let targetDistance = link.distance - opt.radiusOffset;

                //vector from source to target
                let vector = [link.target.x - link.source.x, link.target.y - link.source.y];

                let magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
                let unitVector = [vector[0] / magnitude, vector[1] / magnitude];

                // //Now compute the target
                let x = link.source.x + targetDistance * unitVector[0];
                // link.target.y = link.source.y + targetDistance * unitVector[1];
                return x;
            })
            .attr("y2", link => {
                // return d.y;
                // return d.target.y;

                //compute the target
                let targetDistance = link.distance - opt.radiusOffset;

                //vector from source to target
                let vector = [link.target.x - link.source.x, link.target.y - link.source.y];

                let magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
                let unitVector = [vector[0] / magnitude, vector[1] / magnitude];

                // //Now compute the target
                // link.target.x = link.source.x + targetDistance * unitVector[0];
                let y = link.source.y + targetDistance * unitVector[1];
                return y;
            })
            .end();

        enterLinks.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", opt['font-size'])
            .attr("fill", "#000000").raise();

        enterLinks.merge(updateLinks).select("text")
            .attr("transform", (d) => {
                return `translate(${(d.source.x + d.target.x)/2 - 5}, ${(d.source.y + d.target.y)/2 - 5})`
            })
            .text(d => {
                console.log(d);
                return "10"
            });
    }

}

export {
    GraphCanvasUtil
}