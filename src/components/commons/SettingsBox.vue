<template>
    <div>
        <b-card>
            <range-input
                :min="formattedSetting.min"
                :max="formattedSetting.max"
                :step="formattedSetting.step"
            ></range-input>
        </b-card>
    </div>
</template>
<script>
import RangeInput from "./RangeInput.vue";
export default {
    name: "SettingsBox",
    props: {
        settings: {
            type: Object,
            default: function() {
                return {
                    animationControl: {
                        prompt: "Animation Spped",
                        show: true,
                        options: {
                            range: {
                                min: "0.1",
                                max: "2",
                                step: "0.1"
                            },
                            showRangeLabel: true
                        }
                    }
                };
            }
        }
    },
    data: function() {
        return {};
    },
    computed: {
        formattedSetting() {
            // First show Animation Setting. If the user has provided all the values,
            // Use those values or assign default values
            const animationControl = this.settings.animationControl || {};
            animationControl.show =
                animationControl.show == false ? false : true;

            animationControl.options = animationControl.options || {};

            animationControl.options.range = animationControl.options.range || {
                min: animationControl.options.min || "0.1",
                max: animationControl.options || "2",
                step: animationControl.options || "0.1"
            };
            animationControl.showRangeLabel =
                animationControl.showRangeLabel == true ? true : false;

            return { animationControl };
        }
    },
    components: {
        "range-input": RangeInput
    }
};
</script>
<style scoped>
</style>
