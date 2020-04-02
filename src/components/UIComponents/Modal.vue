<template>
  <div>
    <!-- The modal -->
    <b-modal id="aa-graph-modal" ref="aa-modal" @hidden="resetModal"
      ><slot name="modal-body"></slot>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="float-right">
            <slot name="modal-button">
              <b-button variant="primary" size="sm" @click="show = false">
                Close
              </b-button>
            </slot>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>
<script>
export default {
  name: "Modal",
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return { showModal: false };
  },
  watch: {
    show: function(newValue) {
      if (newValue) {
        this.$refs["aa-modal"].show();
      } else {
        this.$refs["aa-modal"].hide();
      }
    }
  },
  methods: {
    resetModal() {
      this.$emit("on-closed");
    },
    submit() {
      this.$emit("on-submit");
    }
  }
};
</script>
<style scoped>
.modal-backdrop {
  background: none;
}
</style>
