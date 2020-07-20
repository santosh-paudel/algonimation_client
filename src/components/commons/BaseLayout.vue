<template>
    <div class="container pt-2 pb-0 pl-2 h-100" style="position:relative">
        <div class="d-flex flex-column h-100" style="border: 1px solid #E5E5E5;">
            <div
                class="pt-4 pb-0 pl-2"
                ref="graph-operation-panel"
                style="background-color: rgba(212, 114, 140, 0.1)"
            >
                <div class="d-flex flex-row justify-content-start mb-0" style="height:40px">
                    <!-- Show the button to generate random trees, graphs, etc if the value prop randomizeBtn.show  is set to true. If yes,
                    user the value of randomizeBtn.btnText to display text button. When the user clicks this button, the method onRandomizeBtnClicked
                    is called, which emits the appropriate event to let the parent component know that the user has asked to generate random data. 
                    -->
                    <b-button
                        v-if="randomizeBtn.show"
                        variant="light"
                        class="text-secondary btn-sm mr-4 aa-button"
                        @click="$emit('on-rand-btn-click',{})"
                    >{{randomizeBtn.btnText}}</b-button>

                    <!-- Draw a text box and a button for each action names in the basic UserAction -->
                    <div
                        v-for="basicAction in basicUserActions"
                        style="max-width: 160px"
                        :key="basicAction.name"
                        class="input-group"
                    >
                        <b-form-input
                            id="input-small"
                            size="sm"
                            :placeholder="basicAction.inputRule.hint"
                            :ref="basicAction.name"
                        ></b-form-input>
                        <b-button
                            variant="outline-light"
                            class="text-secondary btn-sm mr-4 aa-button"
                            @click="onBasicAction(basicAction)"
                        >{{basicAction.name}}</b-button>
                    </div>
                    <input-data-list
                        :dataList="actionNames"
                        placeholder="Search graph algorithms"
                        height="30px"
                        @on-item-selected="onUserAction($event)"
                    ></input-data-list>
                    <div class="ml-auto mr-2" style="margin-right: 2px">
                        <b-icon
                            class="aa-setting-btn"
                            icon="gear-fill"
                            variant="secondary"
                            aria-hidden="true"
                            font-scale="1.5"
                            @click="isShowSettingsBox = !isShowSettingsBox"
                        ></b-icon>
                        <b-collapse
                            v-model="isShowSettingsBox"
                            class="mt-2"
                            style="position:absolute; width: 500px !important; height:500px !important"
                        >
                            <settings-box :settings="settings"></settings-box>
                        </b-collapse>
                    </div>
                </div>
                
                <div class="d-flex flex-row justify-content-center mb-0" style="height:20px">
                    
                    <input 
                        type="file" 
                        name="inputfile"
                        id="inputfile"
                        @change="$emit('on-import', $event)"
                    >

                    <b-button
                        variant="light"
                        class="text-secondary btn-sm mr-4 aa-button"
                        @click="$emit('on-export',{})"
                    >Export Tree to File</b-button>
                </div>

                <div
                    class="text-left text-info mt-4"
                    style="font-size:0.9rem;"
                    v-html="userInstruction"
                ></div>
                <hr class="w-100 mt-0 mb-0" />
            </div>
            <div class="w-100 h-100">
                <!-- <aa-modal-box :show="showModalBox" @close="showModalBox = false">
                    <template v-slot:modal-body>
                        <b-form>
                            <b-form-group
                                id="input-group-source-node"
                                label="Enter the starting node"
                                label-for="input-source-node"
                            >
                                <b-form-input
                                    id="input-source-node"
                                    v-model="graphOperationSelectedNode1"
                                    type="text"
                                    required
                                    placeholder="Example: 50"
                                ></b-form-input>
                            </b-form-group>
                            <b-form-group
                                id="input-group-target-node"
                                label="Enter the ending node"
                                label-for="input-target-node"
                            >
                                <b-form-input
                                    id="input-target-node"
                                    v-model="graphOperationSelectedNode2"
                                    type="text"
                                    required
                                    placeholder="Example: 72"
                                ></b-form-input>
                            </b-form-group>
                        </b-form>
                    </template>
                    <template v-slot:modal-button>
                        <b-button
                            type="submit"
                            variant="primary"
                            size="sm"
                            @click="
								doGraphOperation(
									{
										key1: graphOperationSelectedNode1,
										key2: graphOperationSelectedNode2
									},
									selectedGraphOperation
								)
							"
                        >Submit</b-button>
                    </template>
                </aa-modal-box>-->
                <drawing-board-fluid
                    class="aa-graph-canvas"
                    id="canvas-382d3"
                    bgcolor="rgba(212, 114, 140, 0.03)"
                    @on-canvas-click="$emit('on-canvas-click', $event)"
                    @on-canvas-ready="$emit('on-canvas-ready',$event)"
                ></drawing-board-fluid>
            </div>
            <slot name="canvas-footer"></slot>
        </div>
    </div>
</template>
<script>
import DrawingBoardFluid from "@/components/commons/DrawingBoardFluid.vue";
import InputDataList from "@/components/UIComponents/InputDataList.vue";

import SettingsBox from "./SettingsBox.vue";
import { MathUtil } from "../../util/MathUtil";
// import Modal from "@/components/UIComponents/Modal";
/**
 * @example ../../../docs/readme/BaseLayout.md
 */
export default {
    name: "BaseLayout",
    props: {
        /**
         *
         */
        randomizeBtn: {
            type: Object,
            default: function() {
                return {
                    show: false,
                    btnText: "Generate Random ..."
                };
            }
        },
        /**
         * This prop should contain a description of usability.
         * Example: "Click on the canvas below to create new nodes. Click and
         *              drag your mouse from a node to another to draw a link
         *              between the nodes. Click on the link to edit the weight of
         *              the link. Use the controls below to perform graph operations"
         */
        userInstruction: {
            type: String,
            default: "This is where the user instruction goes"
        },
        /**
         * Most Data Structures support operations such as Insertion, Deletion, Lookup, etc.
         * This prop lists all such operations that the user should be able to perform on the select data structures. 
         * Currently, it only supports Insertion, Deletion and Lookup. Each object in the array has the following properties
         * {
         *  name // Name of the operation. Example: "Insert"
         *  inputRules{ // inputRules is an object that describe further inputs required from the user to perform
                        // the selected operation.
         *      type: // Data type of the input. Example: "integer"
         *      hint: // Input hint that describe the types of input that should be provided (Example: "E.g. 5")
         *  }
         * }
         */
        basicUserActions: {
            type: Array,
            default: function() {
                return [
                    {
                        name: "Insert",
                        inputRule: {
                            type: "integer",
                            hint: "E.g. 5"
                        }
                    },
                    {
                        name: "Delete",
                        inputRule: {
                            type: "integer",
                            hint: "E.g. 8"
                        }
                    },
                    {
                        name: "Look up",
                        inputRule: {
                            type: "integer",
                            hint: "E.g. 12"
                        }
                    }
                ];
            }
        },
        /**
         * This prop should contain an array of actions other than the basic
         * actions defined above that the user can perform.
         * Each action is an object that contains the following attributes:
         * 1. action Name: Name of the action (Example: Breadth First Search, )
         *                  Such actions are the names of the algorithms or problems that can be
         *                  executed on a data structure.
         *                  Example:['Breadth First Search', 'Depth First Search'...]
         * 2. inputRules: An array of objects that describe what kind of inputs are required
         *                from the user to perform such actions
         */
        customUserActions: {
            type: Array,
            default: function() {
                return [
                    {
                        actionName: "No Actions",
                        inputRules: [
                            {
                                prompt: "Please Enter input for this action",
                                type: "integer"
                            }
                        ]
                    }
                ];
            }
        },
        settings: {
            type: Object,
            default: function() {
                return {
                    animationControl: {}
                };
            }
        }
    },
    data: function() {
        return {
            basicActionInput: "",
            isShowSettingsBox: false
        };
    },
    computed: {
        actionNames() {
            const actionNames = [];
            this.customUserActions.forEach(action => {
                actionNames.push(action.actionName);
            });

            return actionNames;
        }
    },
    methods: {
        /**
         * This method is called when the user Performs the basic actions
         * @param {string} actionName Name of the action that the user picked
         * @public
         */
        onUserAction(actionName) {
            let inputRule = null;
            this.customUserActions.forEach(action => {
                if (action.actionName === actionName) {
                    inputRule = action.inputRule;
                }
            });

            switch (inputRule) {
                case "two ints":
                    console.log("###");
                    break;
                default:
                    this.$emit("on-user-action", {
                        actionName: actionName,
                        inputRule: {}
                    });
            }
        },
        onActionWithinputRule(actionName, inputRule) {
            this.$emit("on-user-action", { actionName, inputRule });
        },
        onBasicAction(basicAction) {
            // eslint-disable-next-line no-debugger
            debugger;
            let userInput = this.$refs[basicAction.name][0].$el.value;
            if (["integer", "double"].includes(basicAction.inputRule.type)) {
                userInput = Number(userInput);
            }

            const isValidInput = this.validateBasicActionInput(
                basicAction.inputRule,
                userInput
            );

            if (isValidInput) {
                this.$emit("on-user-action", {
                    actionName: basicAction.name,
                    userInput
                });
            } else {
                console.error(
                    `Invalid Input {${userInput}} provided for action ${basicAction.name}`
                );
            }
        },

        validateBasicActionInput(inputRule, userInput) {
            const requiredDataType = inputRule.type;

            let isDataTypeMatch = false;
            switch (requiredDataType) {
                case "integer":
                    isDataTypeMatch = MathUtil.isInt(userInput);
                    break;
                case "double":
                    isDataTypeMatch = MathUtil.isFloat(userInput);
                    break;
                case "string":
                    isDataTypeMatch = typeof userInput === "string";
                    break;

                default:
                    isDataTypeMatch = false;
            }

            if (isDataTypeMatch) {
                return true;
            }

            return false;
        }
    },
    components: {
        "drawing-board-fluid": DrawingBoardFluid,
        "input-data-list": InputDataList,
        "settings-box": SettingsBox

        // "aa-modal-box": Modal
    }
};
</script>
<style scoped>
.aa-button {
    border: 1px solid #a8acb1;
    height: 30px;
}
.aa-setting-btn {
    vertical-align: middle;
}

.aa-setting-btn:hover {
    transform: scale(1.1);
    transition: all 0.25s ease-in-out;
}
</style>