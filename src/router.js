import Vue from "vue";
import Router from "vue-router";


import Home from "@/Home";
import BinarySearchTree from "@/apps/BinarySearchTree";
import GraphTheory from "@/apps/GraphTheory";

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
      name: "GraphTheory",
      component: GraphTheory,
    }
  ]
});