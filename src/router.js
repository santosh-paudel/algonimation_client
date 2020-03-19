import Vue from "vue";
import Router from "vue-router";


import Home from "@/Home";
import BinarySearchTree from "@/apps/BinarySearchTree";
import UndirectedGraph from "@/apps/UndirectedGraph";

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