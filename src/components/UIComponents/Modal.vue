<template>
	<div>
		<!-- The modal -->
		<b-modal
			v-model="showModal"
			id="aa-graph-modal"
			ref="aa-modal"
			@hidden="closeModal"
			><slot name="modal-body"></slot>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="float-right">
						<slot name="modal-button">
							<b-button
								variant="primary"
								size="sm"
								@click="closeModal"
							>
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
			this.showModal = newValue;
		}
	},
	methods: {
		closeModal() {
			this.showModal = false;
			this.$emit("close");
		}
	}
};
</script>
<style scoped>
.modal-backdrop {
	background: none;
}
</style>
