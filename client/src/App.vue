<template>
  <div >
    <my-header></my-header>
    <div id="app">
      <router-view/>
    </div>
    <my-footer></my-footer>
  </div>

</template>

<script>
    import myHeader from './components/includes/myHeader.vue'
    import myFooter from './components/includes/myFooter.vue'

    export default
    {
        name: 'App',
        components:
            {
              myHeader,
              myFooter
            }
    }
</script>

<style scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
