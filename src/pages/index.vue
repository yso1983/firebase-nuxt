<template>
  <div>
  <v-data-table
    :headers="headers"
    :items="menus"
    class="elevation-1"
    :loading="isLoading"
    loading-text="Loading... Please wait"
    hide-default-footer
    hide-default-header
    :custom-sort="customSort"
  >
    <template v-slot:item.actions="{ item, index}">
      <v-select
        v-model="selItemUsers[item.id]"
        item-text="name"
        item-value="id"
        :items="selUsers"
        label="메뉴를 선택하세요."
        prepend-icon="mdi-text-account"
        :menu-props="{ maxHeight: '350'}"
        multiple
        full-width
        dense
        solo
        hide-details
        @change="changeVal(`${item.id}`, $event)"
      >
        <template v-slot:item="{ parent, active, item, attrs, on }">
          <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
            <v-list-item-action>
              <v-checkbox :input-value="active"></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                <v-row no-gutters align="center">
                  <span>{{ item.name, parent.value }}</span>
                  <v-spacer></v-spacer>
                  <v-chip text-color="white" small v-if="parent.value != item.menu?.id">{{ getMenuName(item)}}</v-chip>
                </v-row>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-slot:selection="{ parent, item, index }">
          <v-chip v-if="index === 0">
            <span>{{ item.name }}</span>
          </v-chip>
          <span
            v-if="index === 1"
            class="grey--text text-caption"
          >
            (외 +{{ parent.value?.length - 1 }}) = 총{{parent.value?.length}}
          </span>
        </template>
      </v-select>
    </template>
  </v-data-table>
  <div class="text-center pt-2 mb-3">
    <v-btn
      depressed
      class="mr-2"
      @click="initialize"
    >
      초기화
    </v-btn>
    <!-- <v-btn
      depressed
      color="primary"
      
    >
      제출
    </v-btn> -->
  </div>
  <v-divider></v-divider>
  <v-treeview
    :open.sync="initiallyOpen"
    :items="items"
    activatable
    color="warning"
    item-key="name"
    open-on-click
  >
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="!item.children" :color="item.gender == 'F' ? 'pink' : 'primary'">
        mdi-account
      </v-icon>
      <v-icon v-else> 
        mdi-food
      </v-icon>
    </template>
    <template v-slot:append="{ item, open }">
      <v-text-field v-if="item.children" 
        v-model="item.totCnt" 
        readonly
        class="centered-input"
        >
        <v-btn
          slot="append-outer"
          icon
          color="indigo"
          outlined
          @click.stop="addCnt(item, 1)"
        >
          <v-icon dark>
            mdi-plus
          </v-icon>
        </v-btn>
        <v-btn
          slot="prepend"
          icon
          color="indigo"
          outlined
          @click.stop="addCnt(item, -1)"
        >
          <v-icon dark>
            mdi-minus
          </v-icon>
        </v-btn>
      </v-text-field>
      <v-btn v-if="!item.children" 
        slot="append-outer"
        icon
        color="indigo"
        outlined
        @click.stop="delItem(item)"
      >
        <v-icon dark>
          mdi-delete
        </v-icon>
      </v-btn>
    
    </template>
  </v-treeview>
</div>
</template>
<script>
  export default {
    name:'index',
    data: () => ({
      isLoading: true,
      dialog: false,
      dialogDelete: false,
      headers: [
        // { value: 'id', text: 'id' },
        {
          text: '메뉴명',
          align: 'start',
          //sortable: false,
          value: 'name',
          class: 'text-left'
        },
        { text: '수정/삭제', value: 'actions', sortable: false,width: '150px', },
      ],
      menus: [],
      users: [],
      selUsers: [],
      selItemUsers: {},

      initiallyOpen: [],
    }),

    computed: {
      items () {
        let items = this.menus;
        items.forEach(item => {
          let userIds = this.selItemUsers[item.id];
          let cnt = 0;
          if(userIds) {
            item.children = [];
            userIds.forEach(userId => {
              let user = this.selUsers.find(u => u.id === userId);
              if(user) {
                item.children.push(JSON.parse(JSON.stringify(user)));
              }
              cnt++;
            });

            item.cnt = cnt;
          }

          item.totCnt = item.cnt + item.addCnt;
        });

        return items.filter(i => i.cnt > 0);
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },

    created () {
      this.getUsers()
      this.read()
    },

    methods: {
      initialize () {
        this.selUsers.forEach(user => {
          user.menu = null;
        })
        this.selItemUsers = {}
        this.read()
      },

      async getUsers() {

        const s = await this.$db.collection('users').get()
        this.users = []
        s.forEach(d => {
          const r = d.data()
          const user = Object.assign(r)
          user.id = d.id
          this.users.push(user)
        })

        this.users = this.users.sort((a, b) => {
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });

        this.selUsers = JSON.parse(JSON.stringify(this.users));
      },

      changeVal(val, evt) {

        // 다른 메뉴 요소 제거
        Object.keys(this.selItemUsers).forEach(key => {
          if(val != key) {
            console.log("key", key)
            this.selItemUsers[key] = this.selItemUsers[key]?.filter(e => !evt.includes(e))
          }
        });

        let menu = this.menus.find(m => m.id === val);

        // 해당 메뉴 초기화 
        this.selUsers.forEach(user => {
          if(user.menu?.id == val) user.menu = null;
        });

        // 유저 메뉴 설정
        evt.forEach(userId => {
          let user = this.selUsers.find(u => u.id === userId);
          if(user) {
            user.menu = JSON.parse(JSON.stringify(menu));
          }
        });
      },

      getMenuName(item) {
        let name = '';
        if(item.menu) {
          name = item.menu?.name;
          name = name.length > 8 ? name.substring(0, 8) + '...' : name;
        }
        return name;
      },

      addCnt(item, add) {
        item.addCnt = item.addCnt + add;
        if(item.addCnt < 0 ) item.addCnt = 0;
      },

      delItem(item) {
        console.log(item)
        if(item.menu) {
          this.selItemUsers[item.menu.id] = this.selItemUsers[item.menu.id]?.filter(e => item.id != e)
          let user = this.selUsers.find(u => u.id === item.id);
          if(user) user.menu = null;
        }
      },

      async read() {
        const s = await this.$db.collection('menuItems').get()
        this.menus = []
        s.forEach(d => {
          const r = d.data()
          const item = Object.assign(r)
          item.id = d.id
          item.children = [];
          item.cnt = 0;
          item.addCnt = 0;
          item.totCnt = 0;
          this.menus.push(item)
        })
        this.isLoading = false;
      },
      customSort: function(items, index, isDesc) {
        items.sort((a, b) => {
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
        return items;
      }
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