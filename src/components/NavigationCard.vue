<template>
	<b-card
		no-body
		style="width: 400px;"
		@click="navigate"
		class="aa-nav-card overflow-hidden mt-2"
	>
		<b-row no-gutters class="h-100">
			<!-- <b-col md="6">
				<div
					class="rounded-0 container-fluid h-100 w-100"
					:style="this.bgImgstyle"
				></div>
            </b-col>-->
			<b-col md="6">
				<b-card-img :src="app.image" class="rounded-0"></b-card-img>
			</b-col>
			<b-col md="6" style="background-color: #F7F7F9">
				<b-card-body :title="app.name" title-tag="h5">
					<b-card-text class="aa-nav-card-desc">{{
						charLimitedDescription
					}}</b-card-text>
				</b-card-body>
			</b-col>
		</b-row>
	</b-card>
</template>
<script>
export default {
	name: "NavigationCard",
	props: {
		// name: String,
		// description: String,
		// image: String
		app: Object
	},
	methods: {
		navigate: function() {
			this.$router.push({ path: this.app.path });
		}
	},
	computed: {
		bgImgstyle() {
			return `background-image: url(${this.app.image});\
            background-position: center;
            backround-size: contain`;
		},
		charLimitedDescription() {
			const limit = 128;

			if (this.app.description.length >= limit) {
				return this.app.description.substring(0, limit);
			}

			return this.app.description;
		}
	}
};
</script>
<style scoped>
.aa-nav-card {
	transition: border-color 0.6s ease;
	cursor: pointer !important;
}

.aa-nav-card * {
	cursor: inherit;
}
.aa-nav-card:hover {
	border-color: #3e3e3e;
}

.aa-nav-card-desc {
	font-size: 15px;
}
</style>
