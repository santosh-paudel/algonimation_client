<template>
    <b-row>
        <div class="col-md-6 col-sm-12 mt-1">
            <b-form-input
                class="aa-new-input"
                placeholder="5"
                :state="inputError ? false : null"
                v-model="userInput"
            ></b-form-input>
        </div>
        <div class="col-md-6 col-sm-12 mt-1">
            <b-button block variant="outline-info" @click="onUserInput">{{buttonLabel}}</b-button>
        </div>
    </b-row>
</template>
<script>
export default {
    props: {
        inputType: String, //Supported values are "string", "integer"
        buttonLabel: String //The label that should display in the button
    },
    data: function() {
        return {
            userInput: "",
            inputError: false
        };
    },
    methods: {
        onUserInput() {
            const input = this.sanitizeInput();

            //If the input not null, do not emit any events
            if (input !== null) {
                this.$emit("on-user-input", input);
            }
            this.userInput = "";
        },
        sanitizeInput() {
            //If the input is empty, just return null
            if (this.userInput === "") return null;

            switch (this.inputType) {
                case "string":
                    return this.userInput;
                case "integer":
                    return parseInt(this.userInput);

                default:
                    throw Error(
                        `UserInputBox only supports "string" and "integer" input types. "${this.inputType}" provided`
                    );
            }
        }
    }
};
</script>
<style scoped>
</style>