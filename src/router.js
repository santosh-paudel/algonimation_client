import Vue from "vue";
import Router from "vue-router";


import Home from "@/components/pages/Home/Home";
import BinarySearchTree from "@/components/pages/BinarySearchTree/BinarySearchTree";
import UndirectedGraph from "@/components/pages/UndirectedGraph/UndirectedGraph";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [{
      path: "/",
      name: "Home",
      component: Home
    }, {
      path: "/bst",
      name: "BinarySearchTree",
      component: BinarySearchTree,
    },
    {
      path: "/graph",
      name: "UndirectedGraph",
      component: UndirectedGraph,
    }
  ]
});