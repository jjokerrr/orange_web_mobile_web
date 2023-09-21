<template>
  <div style="background-color: white;padding: 16px;">
  </div>
</template>

<script>
export default {
  data () {
    return {
      currentItem: ['1', '2', '3', '4']
    }
  }
}
</script>

<style scoped>
</style>

<style lang="scss" scoped>
  @import '@/assets/style/element-variables.scss';
  .title {
    border: 1px solid #EDEDED;
    border-left-width: 5px;
    border-left-color: $--color-primary;
    margin-bottom: 20px;
  }

  .title p {
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    margin: 0px;
    padding-left: 20px;
  }

  .title p span {
    font-size: 20px;
    color: $--color-primary;
  }

  .item-list {
    margin: 0px;
  }
  .item-list li {
    margin: 10px 0px;
  }

  .item {
    height: 48px;
    display: flex;
    align-items: center;
  }

  strong.warning {
    color: red;
    font-size: 16px;
  }
</style>
