
<template>
    <div id="aa-floating-boxu3" class="card" :style="style" :key="key">
        <h4 class="text-right aa-close-float-box mr-3 mt-1 mb-0">
            <span @click="onClose">×</span>
        </h4>
        <div class="card-body pt-2">
            <!-- <b-icon-plus scale="1.5" :style="{position: 'absolute'}"></b-icon-plus> -->
            <div class="input-group">
                <b-form-input
                    :state="errorMsg === '' ? null: false"
                    v-model="userInput"
                    :placeholder="placeholder"
                ></b-form-input>
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" @click="onInput" type="button">Submit</button>
                </div>
                <b-form-invalid-feedback id="input-live-feedback" class="text-left">{{errorMsg}}</b-form-invalid-feedback>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "FloatingInputBox",
    props: {
        title: {
            type: String,
            default: "Enter Input"
        },
        coords: {
            type: Object,
            required: true
        },
        errorMsg: {
            type: String,
            default: ""
        },
        placeholder: {
            type: String,
            default: "Input"
        }
    },
    data: function() {
        return {
            userInput: "",
            key: 0
        };
    },
    computed: {
        displayProperty() {
            return this.show === true ? "block" : "none";
        },
        style() {
            return {
                position: "absolute",
                left: `${this.coords.x}px`,
                top: `${this.coords.y - 50}px`,
                width: "16rem"
            };
        }
    },
    methods: {
        onInput: function() {
            if (this.userInput.trim() !== "") {
                this.$emit("on-user-input", this.userInput);
            }
            this.userInput = "";
        },
        onClose: function() {
            this.$emit("on-dialog-close", { tag: this.tag });
        }
    }
};
</script>
<style scoped>
#aa-floating-boxu3 {
    z-index: 1000;
    position: absolute;
}

.aa-close-float-box span {
    cursor: pointer;
    transform: rotate(45deg);
    color: #5d625b;
    transition: color 0.3s;
}

.aa-close-float-box span:hover {
    /* font-size: 1.4em; */
    transform: scale(2);
    color: #2d2f2c;
}
</style>