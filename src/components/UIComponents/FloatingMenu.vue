<template>
  <!-- <div id="aa-floating-boxu3" :key="key">
        <li v-for="item in menuItems" :key="item">{{ item.message }}</li>
    </div>-->
  <div id="aa-floating-menu" class="list-group" :style="style">
    <li
      v-for="item in menuItems"
      class="list-group-item floating-menu-item text-secondary py-1 rounded-0"
      style="font-size:0.9rem;"
      :key="item"
      @click="onItemSelected(item)"
    >
      {{ item }}
    </li>
  </div>
</template>
<script>
export default {
  name: "FloatingMenu",
  props: {
    coords: {
      type: Object,
      required: true
    },
    menuItems: {
      type: Array
    }
  },
  computed: {
    displayProperty() {
      return this.show === true ? "block" : "none";
    },
    style() {
      return {
        position: "absolute",
        left: `${this.coords.x}px`,
        top: `${this.coords.y}px`,
        width: "10em"
      };
    }
  },
  methods: {
    onItemSelected: function(selectedItem) {
      this.$emit("on-item-selected", selectedItem);
    }
  }
};
</script>
<style scoped>
#aa-floating-menu {
  position: absolute;
}

.floating-menu-item:hover {
  /* max-height: 40px; */
  background-color: #f2f2f2;
  cursor: pointer;
}
</style>
