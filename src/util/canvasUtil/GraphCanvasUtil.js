import * as d3 from "d3";
import { BasicCanvasUtil } from "./BasicCanvasUtil";
class GraphCanvasUtil extends BasicCanvasUtil {
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
        return d.data === undefined ? d.key : d.data.key;
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
   * This method draws a links between each descendant node of the given node in the parameter and it's parent.
   * For example, if the given node is Node(5) which has a left child Node(4), and Node(4) has a left child Node(3), a link is
   * drawn between Node(5) and Node(4), another between Node(4) and Node(3)
   */
  static async drawLinksGraph(links, opt) {
    opt.parentClass = opt.parentClass || "svg";
    opt.cssClass = opt.cssClass || "link";
    opt.removeExitLinks =
      opt.removeExitLinks === undefined ? false : opt.removeExitLinks;
    opt["stroke-width"] = opt["stroke-width"] || "2px";
    opt["stroke"] = opt["stroke"] || "red";
    opt.transitionTime =
      opt.transitionTime === undefined ? 0 : opt.transitionTime;
    opt.mouseover = opt.mouseover === undefined ? null : opt.mouseover;
    opt.mouseout = opt.mouseout === undefined ? null : opt.mouseout;
    opt.click = opt.click === undefined ? null : opt.click;

    opt.radiusOffset = opt.radiusOffset === undefined ? 30 : opt.radiusOffset;

    links.forEach(link => {
      let distance = Math.sqrt(
        (link.source.x - link.target.x) ** 2 +
          (link.source.y - link.target.y) ** 2
      );

      link.distance = distance;
    });

    const updateLinks = d3
      .select(`.${opt.parentClass}`)
      .selectAll(`.${opt.cssClass}`)
      .data(links, link => {
        return `${link.source.id}-link-${link.target.id}`;
      });

    let enterLinks = updateLinks
      .enter()
      .append("g")
      .attr("id", function(link) {
        return `${link.source.id}-link-${link.target.id}`;
      })
      .attr("class", opt.cssClass);

    enterLinks
      .append("line")
      .attr("stroke-width", opt["stroke-width"])
      .attr("stroke", opt["stroke"]);

    //Remove any links from the DOM which could not be bound to a datum
    if (opt.removeExitLinks) {
      updateLinks.exit().remove();
    }

    // Before the animation, lower the links
    // to appear behind the circle
    enterLinks.lower();

    if (opt.mouseover !== null) {
      enterLinks.on("mouseover", function(d, i) {
        opt.mouseover(this, d, i);
      });
    }

    if (opt.mouseout !== null) {
      enterLinks.on("mouseout", function(d, i) {
        opt.mouseout(this, d, i);
      });
    }

    if (opt.click !== null) {
      enterLinks.on("click", function(d, i) {
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
        let vector = [
          link.target.x - link.source.x,
          link.target.y - link.source.y
        ];

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
        let vector = [
          link.target.x - link.source.x,
          link.target.y - link.source.y
        ];

        let magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
        let unitVector = [vector[0] / magnitude, vector[1] / magnitude];

        // //Now compute the target
        // link.target.x = link.source.x + targetDistance * unitVector[0];
        let y = link.source.y + targetDistance * unitVector[1];
        return y;
      })
      .attr("x2", function(link) {
        // return d.x;
        // return d.target.x;
        let targetDistance = link.distance - opt.radiusOffset;

        //vector from source to target
        let vector = [
          link.target.x - link.source.x,
          link.target.y - link.source.y
        ];

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
        let vector = [
          link.target.x - link.source.x,
          link.target.y - link.source.y
        ];

        let magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
        let unitVector = [vector[0] / magnitude, vector[1] / magnitude];

        // //Now compute the target
        // link.target.x = link.source.x + targetDistance * unitVector[0];
        let y = link.source.y + targetDistance * unitVector[1];
        return y;
      })
      .end();

    enterLinks
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", opt["font-size"])
      .attr("fill", "#000000")
      .raise();

    enterLinks
      .merge(updateLinks)
      .select("text")
      .attr("transform", link => {
        // return `translate(${(d.source.x + d.target.x) / 2 - 5}, ${(d.source.y +
        //   d.target.y) /
        //   2 -
        //   5})`;
        //Find the midpoint between the source and target
        let midpoint = [
          (link.source.x + link.target.x) / 2,
          (link.source.y + link.target.y) / 2
        ];
        //Find midpoint vector from source to midpoint
        let [m, n] = [midpoint[0] - link.source.x, midpoint[1] - link.source.y];

        // let y = Math.sqrt(
        let v =
          Math.sqrt(
            ((9 + m ** 2 + n ** 2) * m ** 2 -
              2 * Math.pow(n, 4) -
              2 * m ** 2 * n ** 2) /
              (m ** 2 + n ** 2)
          ) - n;

        let u = (m ** 2 + n ** 2 - n * v) / m;

        return `translate(${u}, ${v})`;
      })
      .text(d => {
        console.log(d);
        return "10";
      });
  }
}

export { GraphCanvasUtil };
