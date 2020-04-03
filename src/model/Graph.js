import uuidv4 from "uuid";
class Node {
    _id = null;
    _key = null;

    constructor(key) {
        this._key = key;
        this._id = `node-${uuidv4()}`;
    }

    get id() {
        return this._id;
    }

    get key() {
        return this._key;
    }
}
/**
 * This class represents a grap
 */
class Graph {
    _adjacencyList = {};

    _database = {};

    /**
     * Add a node to the graph with given key
     * @param {*} key
     */
    add(key) {
        if (this._database[key] !== undefined) {
            throw Error("You can't have duplicate nodes");
        }

        let node = new Node(key);
        this._database[key] = node;

        this._adjacencyList[key] = {};

        return node;
    }

    /**
     * Creates a link of given weight between two nodes of the given keys
     * @param {*} key1
     * @param {*} key2
     * @param {*} weight
     */
    link(key1, key2, weight) {
        //adjacencyList = {key1: {key2: weight, key3: weight}, key2: {key1: weight}, key3: {key1: weight}}
        this._adjacencyList[key1][key2] = weight;
        this._adjacencyList[key2][key1] = weight;

        let linkId = `link-${key1}-${key2}`;
        if (key2 < key1) {
            linkId = `link-${key2}-${key1}`;
        }

        return {
            source: this._database[key1],
            target: this._database[key2],
            id: linkId,
            weight: weight
        };
    }
    /**
     * Deletes the node with the given key from the graph. It should
     * also delete the edge (if any) beteen the deleted node and all the other nodes
     * @param {} key
     */
    delete(key) {
        delete this._database[key];
        // delete this._adjacencyList[key];
        for (let item of Object.keys(this._adjacencyList[key])) {
            delete this._adjacencyList[item][key];
        }
        delete this._adjacencyList[key];
    }
    /**
     * Removes edges between two nodes of given keys
     * @param {*} key1
     * @param {*} key2
     */
    deleteEdge(key1, key2) {
        delete this._adjacencyList[key1][key2];
        delete this._adjacencyList[key2][key1];
    }
    containsKey(key) {
        return this._database[key] !== undefined;
    }

    containsEdge(key1, key2) {
        if (!this.containsKey(key1) && !this.containsKey(key2)) {
            return false;
        }

        return this._adjacencyList[key1].hasOwnProperty(key2);
    }

    getNode(key) {
        return this._database[key];
    }

    vertices() {
        return Object.values(this._database);
    }

    /**
     * This returns the number of Edges
     */
    edges() {
        let edges = [];

        // Keeps track of the edge that was selected to avoid duplicate edge.
        // The Edge Node(5)-----Node(6) is still same as Node(6)----Node(5)
        const selectedEdge = {};
        for (let sourceKey of Object.keys(this._adjacencyList)) {
            let target = this._adjacencyList[sourceKey];

            for (let targetKey of Object.keys(target)) {
                // the id of the link should be the same regardless of the order
                //of source and target. So, build the id with the smaller key first

                let linkId = `link-${sourceKey}-${targetKey}`;
                if (targetKey <= sourceKey) {
                    linkId = `link-${targetKey}-${sourceKey}`;
                }

                if (selectedEdge[linkId] === true) continue;
                selectedEdge[linkId] = true;

                edges.push({
                    id: linkId,
                    //   source: sourceKey,
                    //   target: targetKey,
                    source: this._database[sourceKey],
                    target: this._database[targetKey],
                    weight: target[targetKey]
                });
            }
        }

        return edges;
    }

    /**
     * Given the starting and ending Node, it returns an object containing the shortest path 
     * from key1 to key2 and all the nodes that were checked (to compute cost) while checking
     * for the shortest path. The returned object looks like this
     * {
     *   path: [1,3,4,5],
     *   checkedNodes: [
     *      {1: [2,3]},
     *      {3: [2,4]}
     *      {2: [5, 4]},
     *      {4: [5]},
     *      {5: []}
     *   ]
     * }
     * 
     * Note:
     *  * path is the shortest path from key1 to key2
     *  * checkedNodes is an array of objects whose key is the keys that were checked for cost computation, and value is the array of the neighbors (of the key) that were
     *      checked
     */
    dikjstras(key1, key2) {

        // This collects the nodes that were checked (for cost) to determine the path from key1 and key2
        const collector = [];

        // pathTable contains all the keys, cost to visit them and the previous node
        // Initially the cost will be infity and the previous node will be null
        const pathTable = {};

        //visited object keys track of all the keys that have already been visited
        const visited = {};

        for (let key of Object.keys(this._database)) {
            if (key === key1) {
                pathTable[key] = {
                    cost: 0,
                    previous: null
                };
            } else {
                pathTable[key] = {
                    cost: Number.MAX_SAFE_INTEGER,
                    previous: null
                };
            }
        }

        // const stack = [];
        // stack.push(this.getNode(key1));
        // let currentNodeKey = this.getNode(key1);
        let currentNodeKey = key1;
        while (currentNodeKey !== null) {
            // let current = stack.pop();

            visited[currentNodeKey] = true;

            let minCost = Number.MAX_SAFE_INTEGER;
            let minCostNeighbor = null;

            // This stores all the neighbors of currentNodeKey for which the cost of traversal was computed
            // It will eventually be added to the collector defined above
            let costCheckedNeighbors = [];
            for (let neighbor of Object.keys(this._adjacencyList[currentNodeKey])) {

                // If the neighbor is already visited, continue
                if (visited[neighbor]) continue;
                costCheckedNeighbors.push(neighbor);

                let weight = this._adjacencyList[currentNodeKey][neighbor];

                let newCost = pathTable[currentNodeKey].cost + weight;

                // If the neighbor is not visited and the cost to visit the neighbor is less than
                // the current cost to visit that neighbor (from other nodes), update the pathTable with the new
                // cost and previous node
                if (newCost < pathTable[neighbor].cost) {
                    pathTable[neighbor].cost = newCost;
                    pathTable[neighbor].previous = currentNodeKey;
                }

                // Find the neighbor that has the least cost to visit from the current node
                // Note: Here, it doesn't matter if the cost to visit the neighboring node is greater than
                // the cost to visit that node from other nodes. For example, take the following situation
                // currentNodeKey = b. You would still need to visit Node(d) from Node(b), even if the cost to go from c to d is less
                // than the cost to go from b to d. Why? Because b has two unvisited neighbors (assuming c is visited), and visitng d has less cost
                // than visiting e
                //  Node(c)----4----Node(b)
                //  |              /    |
                //  |            /      |
                //  5          /        |
                //  |        6          10
                //  |      /            |
                //  |    /              |
                //  |  /                |
                // Node(d)------------Node(e)
                if (newCost < minCost) {
                    minCost = newCost;
                    minCostNeighbor = neighbor;
                }
            }

            // Add the cost checked neighbors of currentNodeKey to the collector
            let temp = {};
            temp[currentNodeKey] = costCheckedNeighbors;
            collector.push(temp);
            currentNodeKey = minCostNeighbor;
        }
        // Now, check the path table, The path table should contain both key1 and key2.
        // Otherwise, path does not exist between those nodes. We already know
        // path table contains key1. Does it contain key2?
        if (pathTable[key2] === undefined) return {};

        // Now, trace back to find the path between key1 and key2
        let previousNode = key2;
        const path = [];
        while (previousNode !== null) {
            path.push(previousNode);
            previousNode = pathTable[previousNode].previous;
        }

        return {
            path: path.reverse(),
            checkedNodes: collector
        }
    }

    /**
     * This returns the string representation of graph
     * TODO: Implement
     */
    toString() {}
}

export {
    Graph
};