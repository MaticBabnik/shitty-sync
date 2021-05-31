<template>
    <svg viewbox="0 0 24 24" width="24" height="24">
         <use :xlink:href="`${file}#${name}`"></use>
    </svg>
</template>

<script>
export default {
    props:{
        file:{type:String, required:true},
        name:{type:String, required:true}
    }
}
</script>