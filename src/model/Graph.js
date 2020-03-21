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

    add(key) {

        if (this._database[key] !== undefined) {
            throw Error("You can't have duplicate nodes");
        }

        let node = new Node(key);
        this._database[key] = node;

        this._adjacencyList[key] = {};

        return node;
    }

    link(key1, key2, weight) {
        //adjacencyList = {key1: {key2: weight, key3: weight}, key2: {key1: weight}, key3: {key1: weight}}
        this._adjacencyList[key1][key2] = weight;
        this._adjacencyList[key1][key2] = weight;
        console.log(JSON.stringify(this.edges()));
    }
    delete(key) {
        delete this._database[key];
        // delete this._adjacencyList[key];
        for (let item of Object.keys(this._adjacencyList[key])) {
            delete this._adjacencyList[item][key]
        }
        delete this._adjacencyList[key];
    }
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

        return this._adjacencyList.hasOwnProperty(key1) && this._adjacencyList.hasOwnProperty(key2)
    }

    getNode(key) {
        return this._database[key];
    }

    /**
     * This returns the number of
     */
    vertices() {
        // return Object.values(this._database);
        // return [{
        //         id: "19156473-da4d-4b18-a56d-f743134063a8",
        //         key: "3"
        //     },
        //     {
        //         id: "15286d3f-5962-45b0-bf2b-cf99155a4715",
        //         key: "a"
        //     }
        // ]

        // return this._database;
        // let vertices = [];
        // for(let node of Object.keys(this._database)){
        //     vertices.
        // }

        return Object.values(this._database);
    }

    /**
     * This returns the number of Edges
     */
    edges() {
        let edges = [];

        for (let sourceKey of Object.keys(this._adjacencyList)) {

            let target = this._adjacencyList[sourceKey];

            for (let targetKey of Object.keys(target)) {
                edges.push({
                    id: `link-${sourceKey}-${targetKey}`,
                    source: sourceKey,
                    target: targetKey,
                    weight: target[targetKey]
                })
            }
        }

        return edges;
    }

    /**
     * This returns the string representation of graph
     */
    toString() {

    }
}

export {
    Graph
}