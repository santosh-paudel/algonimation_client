<template>
	<div>
		<div
			id="aa-user-search-container"
			class="aa-keep-dropdown"
			v-on:click.stop="showDropDown"
		>
			<div class="input-group mr-sm-2">
				<input
					class="form-control border-right-0 aa-keep-dropdown"
					type="search"
					:placeholder="hint"
					aria-label="Search"
					v-model="searchString"
				/>
				<div class="input-group-append aa-keep-dropdown">
					<div class="input-group-text bg-transparent">
						<b-icon-chevron-down
							scale="1"
							style="cursor:pointer"
						></b-icon-chevron-down>
					</div>
				</div>
			</div>
			<ul v-if="showItems" class="list-group aa-search-suggestion-list">
				<li
					v-for="suggestion in displayList"
					class="list-group-item text-left pt-2 pb-2 rounded-0 aa-list-item"
					@click="onItemSelected(suggestion)"
					:key="suggestion"
				>
					{{ suggestion }}
				</li>
			</ul>
		</div>
	</div>
</template>
<script>
/* eslint-disable no-debugger */
import { BIconChevronDown } from "bootstrap-vue";
export default {
	name: "InputDataList",
	props: {
		dataList: {
			type: Array,
			required: true
		},
		hint: {
			type: String,
			required: false,
			default: "Search"
		}
	},
	data: function() {
		return {
			searchString: "",
			showItems: false
		};
	},
	computed: {
		displayList() {
			const list = [];
			this.dataList.forEach(item => {
				if (
					item.toLowerCase().includes(this.searchString.toLowerCase())
				) {
					list.push(item);
				}
			});

			return list;
		}
	},
	methods: {
		onItemSelected(item) {
			this.showItems = false;
			this.$emit("on-item-selected", item);
		},
		showDropDown(event) {
			if (!event.target.classList.contains("aa-list-item")) {
				this.showItems = true;
			}
		},
		closeDropDown(event) {
			let exceptionClass = "aa-keep-dropdown";

			if (!event.target.classList.contains(exceptionClass)) {
				this.showItems = false;
			}
		}
	},
	mounted() {
		window.onclick = event => {
			this.closeDropDown(event);
		};
	},
	components: {
		BIconChevronDown
	}
};
</script>
<style scoped>
#aa-user-search-container {
	position: relative;
}

.aa-search-suggestion-list {
	position: absolute;
	width: 100%;
}

.aa-search-suggestion-list li {
	z-index: 1000;
	max-height: 40px;
}

.aa-search-suggestion-list li:hover {
	background-color: #f4f4f4;
}
</style>
