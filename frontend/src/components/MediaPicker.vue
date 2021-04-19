<template>
    <div>
        <icon class="icon" file="/icons.svg" name="edit" @click="()=>show=true"/>
        <teleport to="body">
            <popup-dialog title="Select media" @close="()=>show=false" v-if="show">
                <input type="text" class="input" />
                <div class="button" @click="selectMedia">APPLY</div>
            </popup-dialog>
        </teleport>
    </div>
</template>

<script>
import Icon from "../components/Icon";
import PopupDialog from "./PopupDialog.vue";
export default {
    components: {
        Icon,
        PopupDialog,
    },
    data() {
        return {
            show:false,
        }
    },
    methods: {
        selectMedia() {
            console.log('SELECT');
            this.show=false;
        }
    },
};
</script>

<style>
</style>