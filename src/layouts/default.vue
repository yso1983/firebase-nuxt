<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
      v-if="isLoginPage"
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app v-if="isLoginPage">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <!-- <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn> -->
      <!-- <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn> 
      <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>mdi-minus</v-icon>
      </v-btn>-->
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
      <!-- <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn> -->
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light> mdi-repeat </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-pencil-box-outline',
          title: '주문',
          name: 'index',
          to: '/',
        },
        {
          icon: 'mdi-coffee-outline',
          title: '메뉴',
          name: 'item',
          to: '/item',
        },
        {
          icon: 'mdi-account',
          title: '맴버',
          name: 'user',
          to: '/user',
        },
        {
          icon: 'mdi-login',
          title: '로그인',
          name: 'login',
          to: '/login',
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
    }
  },
  computed: {
    title() {
      return this.items.find(i => i.name == this.$route.name)?.title;
    },
    isLoginPage() {
      return this.$route?.name != 'login';
    }
  },
  create() {
    this.$auth().onAuthStateChanged((user) => {
      if (!user) {
        this.$router.push({name: 'login'})
      }
    })
  },
  mounted() {
    this.$auth().onAuthStateChanged((user) => {
      if (!user) {
        this.$router.push({name: 'login'})
      }
    })
  },
}
</script>

<style>
  .v-text-field.v-text-field--enclosed .v-text-field__details { margin-bottom: 0px;}
  .v-text-field.v-text-field--enclosed .v-text-field__details .v-messages { min-height: 0px;}
  .v-text-field.v-text-field--enclosed .v-text-field__details .v-messages.theme--dark { min-height: 0px;}

  .v-data-table__mobile-row {width: 100%;}
  .v-data-table__mobile-row div:first-child { text-align: left;}
  .v-data-table__mobile-row__cell {width: 100%;}
  .v-data-table__mobile-row__cell .v-select .v-input__control { min-width: 300px;}

  .v-treeview-node__append .v-text-field__slot input { width:40px;}
  .v-treeview-node__append .v-text-field__details { margin-bottom: 0px;}
  .v-treeview-node__append .v-text-field__details .v-messages { min-height: 0px;}
  .v-treeview-node__append .v-text-field__details .v-messages.theme--dark { min-height: 0px;}

  .centered-input input {text-align: center}
</style>