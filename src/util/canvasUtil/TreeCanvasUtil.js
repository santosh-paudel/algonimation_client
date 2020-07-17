import * as d3 from "d3";
import { BasicCanvasUtil } from "./BasicCanvasUtil";
class TreeCanvasUtil extends BasicCanvasUtil {
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
    opt.removeExitNodes =
      opt.removeExitNodes === undefined ? false : opt.removeExitNodes;
    opt["stroke-width"] = opt["stroke-width"] || "2px";
    opt["stroke"] = opt["stroke"] || "red";
    opt["radius"] = opt["radius"] || "50px";
    opt["fill"] = opt["fill"] || "blue";
    opt["font-size"] = opt["font-size"] || "12px";
    opt["font-color"] = opt["font-color"] || "red";
    //By default, the nodes appear at (0,0) position on the screen although their datum may have x and y position
    //specified. Unless this argument is true, the nodes will not be translated to their new position
    opt.fixedAtOrigin = opt.fixedAtOrigin || false;

    opt.transitionTime =
      opt.transitionTime === undefined ? 0 : opt.transitionTime;

    opt.click = opt.click === undefined ? null : opt.click;
    opt.mouseover = opt.mouseover === undefined ? null : opt.mouseover;
    opt.mouseout = opt.mouseout === undefined ? null : opt.mouseout;
    opt.dragEvents = opt.dragEvents === undefined ? null : opt.dragEvents;

    let updateNodes = d3
      .select(`.${opt.parentClass}`)
      .selectAll(`.${opt.cssClass}`)
      .data(nodes, node => {
        return node.data === undefined ? node.id : node.data.id;
      });

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
      .attr("stroke-width", opt["stroke-width"])
      .attr("fill", opt.fill);

    //append text


    enterNode
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", opt["font-size"])
      .attr("fill", opt["font-color"])
      .attr("transform", `translate(0, 7)`)
      .text(d => {
        return d.data.key;
      });

    // enterNode.on("mouseover", function (d) {
    //     opt.mouseover(this, d);
    // });

    if (opt.mouseover !== null) {
      enterNode.on("mouseover", function(d, i) {
        opt.mouseover(this, d, i);
      });
    }

    if (opt.mouseover !== null) {
      enterNode.on("mouseout", function(d, i) {
        opt.mouseout(this, d, i);
      });
    }

    if (opt.click !== null) {
      enterNode.on("click", function(d, i) {
        opt.click(this, d, i);
      });
    }

    if (opt.dragEvents !== null) {
      enterNode.call(
        d3
          .drag()
          .on("start", function(d, i) {
            opt.dragEvents.start(d, i);
          })
          .on("drag", function(d, i) {
            opt.dragEvents.drag(d, i);
          })
          .on("end", function(d, i) {
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
        await mergedNode
          .transition()
          .duration(opt.transitionTime)
          .attr("transform", function(d) {
            return `translate(${d.x},${d.y})`;
          })
          .end();
      } else {
        mergedNode.attr("transform", function(d) {
          return `translate(${d.x},${d.y})`;
        });
      }
    }
  }


  /**
   * This method deletes given node and its links
   * For example, if the given node is Node(10) which has a left child Node(5), and right child Node(15), Node(10)
   * link between Node(10) and Node(5), another between Node(10) and Node(15) is deleted
   */
  static clearNode(nodeId){
    d3.select('#'+nodeId).remove();
    d3.select('#link-'+nodeId).remove();    
  }

  /**
   * This method draws a links between each descendant node of the given node in the parameter and it's parent.
   * For example, if the given node is Node(5) which has a left child Node(4), and Node(4) has a left child Node(3), a link is
   * drawn between Node(5) and Node(4), another between Node(4) and Node(3)
   */
  static async drawLinks(nodes, opt) {
    opt.parentClass = opt.parentClass || "svg";
    opt.cssClass = opt.cssClass || "link";
    opt.removeExitLinks =
      opt.removeExitLinks === undefined ? false : opt.removeExitLinks;
    opt["stroke-width"] = opt["stroke-width"] || "2px";
    opt["stroke"] = opt["stroke"] || "red";
    opt.transitionTime =
      opt.transitionTime === undefined ? 0 : opt.transitionTime;

    const updateLinks = d3
      .select(`.${opt.parentClass}`)
      .selectAll(`.${opt.cssClass}`)
      .data(nodes, node => {
        return node.data === undefined ? node.id : node.data.id;
      });

    let enterLinks = updateLinks
      .enter()
      .append("line")
      .attr("id", function(node) {
        return `link-${node.data.id}`;
      })
      .attr("class", opt.cssClass)
      .attr("stroke-width", opt["stroke-width"])
      .attr("stroke", opt["stroke"]);

    //Remove any links from the DOM which could not be bound to a datum
    if (opt.removeExitLinks) {
      updateLinks.exit().remove();
    }

    // Before the animation, lower the links
    // to appear behind the circle
    enterLinks.lower();

    enterLinks
      .attr("x1", d => {
        // return d.parent.x;
        return d.parent.x;
      })
      .attr("y1", d => {
        // return d.parent.y;
        return d.parent.y;
      })
      .attr("x2", function(d) {
        // return d.parent.x;
        return d.parent.x;
      })
      .attr("y2", d => {
        // return d.parent.y;
        return d.parent.y;
      });

    await enterLinks
      .merge(updateLinks)
      .transition()
      .duration(opt.transitionTime)
      .attr("x1", d => {
        return d.parent.x;
        // return d.parent === undefined ? d.source.x : d.parent.x;
      })
      .attr("y1", d => {
        return d.parent.y;
        // return d.parent === undefined ? d.source.y : d.parent.y;
      })
      .attr("x2", function(d) {
        return d.x;
        // return d.x === undefined ? d.target.x : d.x;
      })
      .attr("y2", d => {
        return d.y;
        // return d.y === undefined ? d.target.y : d.y;
      })
      .end();
  }
}

export { TreeCanvasUtil };
