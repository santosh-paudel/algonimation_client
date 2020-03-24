import * as d3 from "d3";
class BasicCanvasUtil {
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
      .attr("transform", `translate(${translationX}, ${translationY})`)
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
  static async traverseCircularNodes(
    nodes,
    parentGroup,
    fadeOutAtEnd,
    selectionId,
    ringColor,
    transitionTime,
    collector = null
  ) {
    if (nodes.length === 0) return;

    let currentNode = nodes[0];

    let currentNodeId =
      currentNode.data === undefined ? currentNode.id : currentNode.data.id;
    let currentNodeInDOM = d3.select(`#${currentNodeId}`).select("circle");
    let currentNodeRadius = parseInt(
      currentNodeInDOM.style("r").replace("px", "")
    );
    let currentNodeStrokeWidth = parseInt(
      currentNodeInDOM.style("stroke-width").replace("px", "")
    );

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
      let key =
        currentNode.data === undefined ? currentNode.key : currentNode.data.key;
      collector.push(key);
    }
    // Note: Do not use nodes.splice(1) to iterate
    // through the nodes as it modified the original
    // nodes array
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];

      await BasicCanvasUtil.moveCircularNodeById(
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
      BasicCanvasUtil.removeElementById(selectionId, transitionTime);
    }
    return currentNode;
  }

  static async traverseCircularNodesById(
    nodeIds,
    parentGroup,
    fadeOutAtEnd,
    selectionId,
    ringColor,
    transitionTime,
    collector = null
  ) {
    // eslint-disable-next-line no-debugger
    debugger;
    if (nodeIds.length === 0) return;

    const nodes = [];
    nodeIds.forEach(id => {
      // let datum = d3.select(`#${id}`).datum();
      let d = d3.select(`#${id}`);
      let datum = d.datum();
      nodes.push(datum);
    });

    BasicCanvasUtil.traverseCircularNodes(
      nodes,
      parentGroup,
      fadeOutAtEnd,
      selectionId,
      ringColor,
      transitionTime,
      collector
    );
  }
}

export { BasicCanvasUtil };
