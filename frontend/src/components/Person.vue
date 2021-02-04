<template>
    <div class="user-card">
        <span class="nickname">
            {{nickname}}
        </span>
        <span class="id">
            {{id}}
        </span>
        <span class="role">
            {{role}}
            <div class="small-btn" v-if="isLocalUserAdmin && role != 'admin'">Promote</div>    
        </span>
        
    </div>
</template>

<script>
export default {
    props:{
        nickname:{type:String,required:true},
        id:{type:String,required:true},
        role:{type:String,required:true},
        isLocalUserAdmin:{type:Boolean,required:true}
    }
}
</script>

<style lang="less">
@import url('@/assets/colors.less');
.user-card {
    display: flex;
    flex-direction: column;
    padding: 4px;
    border: 1px solid @base01;
    border-radius: 4px;
    .nickname{
        font-weight: 600;
        color:@green;
        width: fit-content;
    }
    .id {
        width: fit-content;
        background-color: @base02;
        border-radius: 2px;
        font-family: monospace;
        color: @base00;
        border: 1px solid @base01;
    }
    .role{
        width: fit-content;
        font-weight: 600;
        color:@yellow;
    }
    .small-btn {
        font-size:10px;
        border: 1px solid @red;
        color: @red;
        border-radius: 2px;
        display:inline;
        padding: 2px;        
        user-select: none;
        cursor: pointer;
    }
    .small-btn:hover{
            background-color: @red;
            color:@base03;
        }
}
</style>