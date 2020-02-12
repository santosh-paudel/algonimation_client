import * as d3 from "d3";
import {
    BST
} from "./bst";

class BstD3Wrapper {
    depth = 9999999;
    treeLayout = null;
    d3Tree = null;

    bst = null;

    constructor(width, height) {
        this.cartisanWidth = width;
        this.cartisanHeight = height;
        this.treeLayout = d3.tree().size([this.cartisanWidth, this.cartisanHeight]);
        this.bst = new BST();
    }

    _buildTree() {
        let hierarchy = d3.hierarchy(this.bst.root, (data) => {
            return data.children;
        });

        this.d3Tree = this.treeLayout(hierarchy);


        this.d3Tree.descendants().forEach((node, index) => {

            // node.x += this.cartisanWidth / 3

            if (index === 0) return;

            if (node.y - node.parent.y > 180) node.y = node.parent.y + 180;

        });

    }

    tree(rebuild) {
        if (rebuild) {
            this._buildTree();
        }
        return this.d3Tree;
    }

    insert(data, id) {
        this.bst.insert(data, id);

        this._buildTree();

        for (const node of this.d3Tree.descendants()) {
            if (node.data.id === id) return node;
        }

        return null;

    }

}





export {
    BstD3Wrapper
}