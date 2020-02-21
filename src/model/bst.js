/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
"use strict";
class Node {
    id = null;
    key = null;
    left = null;
    right = null;

    constructor(data, id) {
        this.id = id;
        this.key = data;
        this.left = null;
        this.right = null;
    }
    set left(node) {
        this.left = node;
    }
    set right(node) {
        this.right = node;
    }
    get left() {
        return this.left;
    }
    get right() {
        return this.right;
    }

    get key() {
        return this.key;
    }

    children() {
        let children = [];
        if (this.left !== null) children.push(this.left);

        if (this.right !== null) children.push(this.right);

        return children;
    }
}
class BST {
    root = null;

    insert(data, id) {
        if (this.root === null) {
            this.root = new Node(data, id);
            return this.root;
        }

        let node = this.insertData(data, id, this.root);
        return node;
    }
    insertData(key, id, parentNode) {
        /* If the tree is empty, return a new node */
        if (parentNode === null) return new Node(key, id);

        /* Otherwise, recur down the tree */
        if (key <= parentNode.key)
            parentNode.left = this.insertData(key, id, parentNode.left);
        else if (key > parentNode.key)
            parentNode.right = this.insertData(key, id, parentNode.right);

        /* return the (unchanged) node pointer */
        return parentNode;
    }

    getLeafNodes() {
        let leafNodes = [];
        let queue = [];
        queue.push(this.root);

        while (queue.length > 0) {
            let node = queue.pop();

            if (node.children.length === 0) {
                leafNodes.push(node);
            } else {
                for (const child of node.children) {
                    queue.push(child);
                }
            }
        }

        return leafNodes;
    }

    getNode(key, id) {
        if (this.root === null) return null;

        if (this.root.key === key && this.root.id === id) return this.root;

        return this._searchNode(this.root, this.root.key, this.root.id);
    }

    _searchNode(parent, key, id) {
        if (parent === null) return null;

        if (key == parent.key && id === parent.id) {
            return parent;
        }

        if (key <= parent.key) {
            return this._searchNode(parent.left, key, id);
        } else {
            return this._searchNode(parent.right, key, id);
        }
    }

    // Returns parent node. If the node
    // exists, it's parent is returned. If the node does not
    // exist, a candidate-parent node is returned
    getParentNode(key, id) {
        if (
            this.root === null ||
            (this.root.left === null && this.root.right === null)
        )
            return null;

        return this._searchParentNode(this.root, key, id);
    }

    _searchParentNode(parent, key, id) {
        if (key <= parent.key) {
            // compare by key for data
            // compare by id if there are multiple nodes with same key
            if (
                parent.left === null ||
                (key === parent.left.key && id === parent.left.id)
            )
                return parent;

            return this._searchParentNode(parent.left, key, id);
        } else {
            if (
                parent.right === null ||
                (key === parent.right.key && id === parent.right.id)
            )
                return parent;

            return this._searchParentNode(parent.right, key, id);
        }
    }


    _inorderSuccessor(node) {
        let minValueNode = node;
        let nextSmallNode = node;
        while (nextSmallNode.left !== null) {
            nextSmallNode = nextSmallNode.left;
            if (nextSmallNode !== null) {
                minValueNode = nextSmallNode;
            }
        }

        return minValueNode;
    }

    height() {
        return this._height(this.root);
    }
    _height(node) {
        if (node === null) return 0;

        let leftHeight = this._height(node.left);
        let rightHeight = this._height(node.right);

        if (leftHeight > rightHeight) return leftHeight + 1;
        else return rightHeight + 1;
    }


    findSuccessor(key, id) {
        let parentNode = this.getParentNode(key, id);
        let targetNode = null;
        let successorNode = null;

        if (parentNode.left !== null && parentNode.left.key === key && parentNode.left.id === id) {
            targetNode = parentNode.left;
        } else {
            targetNode = parentNode.right;
        }

        //If the node to remove has no children
        if (targetNode.children().length === 0) {
            successorNode = null;
        }

        //If the node to remove has one child
        else if (targetNode.children().length === 1) {
            successorNode = targetNode.children()[0];
        } else {
            let collector = [];
            this._preorderTraversal(this.root, collector);

            for (let i = 0; i < collector.length; i++) {
                const node = collector[i];
                if (node.key === key && node.id === id) {
                    successorNode = collector[i + 1];
                }
            }
        }
        return {
            parent: parentNode,
            target: targetNode,
            successor: successorNode
        }
    }

    _preorderTraversal(node, collector) {
        if (node === null) return null;
        this._preorderTraversal(node.left, collector);
        collector.push(node);
        this._preorderTraversal(node.right, collector);
    }

    /**
     * Swaps nodes 
     * @param {object} node
     * @param {Object} successor
     */

    //TODO: Make this function more efficient
    deleteNode(removalNodeKey, removalNodeId, successorKey, successorId) {
        debugger;
        let parentNode = this.getParentNode(removalNodeKey, removalNodeId);

        let removalNode = null;
        if (parentNode.left != null && parentNode.left.id === removalNodeId) {
            removalNode = parentNode.left;
        } else {
            removalNode = parentNode.right;
        }

        //Since the successor is going to be one of the child nodes of the node
        // begin searching from this node
        let successorNode = null;
        if (successorKey !== null) {

            //Fet the successor Node's parent
            let successorParentNode = this._searchParentNode(parentNode, successorKey, successorId);

            //Get the successor Node
            successorNode = this._searchNode(successorParentNode, successorKey, successorId);

            // If the removal node has a left child (or a right child) and that left child  (or right child) is not the successor
            // itself, it (the child) becomes the left child (or the right child) of the successor
            successorNode.left = (removalNode.left === null || removalNode.left.id === successorId) ? null : removalNode.left;
            successorNode.right = (removalNode.right === null || removalNode.right.id === successorId) ? null : removalNode.right;


            //Make sure you set the paren't reference to the successor node to null
            if (successorParentNode.left !== null && successorParentNode.left.id === successorId) {
                successorParentNode.left = null;
            } else {
                successorParentNode.right = null;
            }

        }

        if (removalNodeKey <= parentNode.key) {
            parentNode.left = successorNode;
        } else {
            parentNode.right = successorNode;
        }

    }


}

export {
    Node,
    BST
};

// function main() {
//     // let root = new Node(15, 'a');

//     let bst = new BST();
//     bst.insert(15, 'a');
//     bst.insert(10, 'b');
//     bst.insert(30, 'c');
//     bst.insert(20, 'd');
//     bst.insert(40, 'e');
//     bst.insert(25, 'g');
//     bst.insert(8, 'i');
//     bst.insert(12, 'j');

//     bst.insert(40, 'k');
//     bst.insert(35, 'l');
//     bst.insert(45, 'm');

//     let n = bst.findInorderSuccessor(30, 'c');
//     console.log(n.key);

// }

// main();