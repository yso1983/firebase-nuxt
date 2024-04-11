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
    disable-pagination
  >
    <template v-slot:item.actions="{ item, index}">
      <v-select
        :ref="`selRef${item.id}`"
        v-model="selItemUsers[item.id]"
        item-text="name"
        item-value="id"
        :items="selUsers"
        prepend-icon="mdi-text-account"
        :menu-props="{maxHeight: '400', overflowY: true}"
        chips
        :label="item.name"
        multiple
        outlined
        hide-details
        dense
        @change="changeVal(`${item.id}`, $event)"
        @click.prevent="selClick(`${item.id}`)"
        class="my-3"
        item-disabled="disable"
        style="font-weight: 600;"
      >
        <template v-slot:prepend-item>
          <v-card :style="`background-color: ${$vuetify.theme.dark ? '#263238' : '#F5F5F5'}; font-weight: 800;`">
            <v-card-actions>
                <span class='ml-3'>{{item.name}}</span>
                <v-btn color="primary" class="ml-auto mr-2" @click.stop="closeSel(`selRef${item.id}`)" >닫기</v-btn>
            </v-card-actions>
          </v-card>
        </template>
        <template v-slot:item="{ parent, active, item, attrs, on }">
          <v-list-item v-on="on" v-bind="attrs" #default="{ active }" :style="`background-color: ${$vuetify.theme.dark ? '#424242' : '#EEEEEE'}`"  :disable="!active && !item.menu">
            <v-list-item-action>
              <v-checkbox :input-value="active"></v-checkbox>
            </v-list-item-action>
            <v-list-item-content light>
              <v-list-item-title>
                <v-row no-gutters align="center" style="font-weight: 600;">
                  <span>{{ item.name, parent.value }}</span>
                  <v-spacer></v-spacer>
                  <v-chip :text-color="$vuetify.theme.dark ? 'white' : 'black'" small v-if="parent.value != item.menu?.id">{{ getMenuName(item)}}</v-chip>
                </v-row>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-slot:selection="{ parent, item, index }">
          <v-chip small v-if="index === 0">
            <span>{{ item.name }}</span>
          </v-chip>
          <span
            v-if="index === 1"
            class="grey--text text-caption"
          >
            외 + {{ parent.value?.length - 1 }} 명
          </span>
        </template>
        <template v-slot:append-item>
          <div class="text-center py-2 mb-2" :style="`background-color: ${$vuetify.theme.dark ? '#263238' : '#F5F5F5'}`" @click.stop>
            <v-btn color="primary" @click="closeSel(`selRef${item.id}`)">
              닫기
            </v-btn>
          </div>
        </template>
      </v-select>
    </template>
  </v-data-table>
  <div class="text-center pt-2 mb-3">
    <v-btn
      depressed
      class="mr-2"
      @click="initialize"
      color="brown lighten-1"
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
      <v-icon v-if="!item.children" :color="item.gender == 'F' ? 'pink lighten-3' : 'primary'">
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
import { mapGetters } from 'vuex';

export default {
  name:'index',
  data: () => ({
    isLoading: true,
    dialog: false,
    dialogDelete: false,
    headers: [
      // { value: 'id', text: 'id' },
      // {
      //   text: '메뉴명',
      //   align: 'start',
      //   //sortable: false,
      //   value: 'name',
      //   class: 'text-left'
      // },
      { text: '선택', value: 'actions', sortable: false,width: '150px', },
    ],
    // menus: [],
    // users: [],
    selMenus: [],
    selClickCnt: 1,
    selUsers: [],
    selItemUsers: {},
    initiallyOpen: [],
    orderId: null,
    orderDate: null,
    uploadCompleted: true,
  }),

  computed: {
    ...mapGetters('order', ['menus', 'users']),
    items () {
      //let items = JSON.parse(JSON.stringify(this.menus));
      this.selMenus.forEach(item => {
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

      return this.selMenus.filter(i => i.cnt > 0);
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
  },

  mounted() {
    this.getUsers()
    this.getMenus()
    this.readOrders()
  },

  methods: {
    initialize () {
      this.getUsers()
      this.getMenus()
      this.selUsers.forEach(user => {
        user.menu = null;
      })
      this.selItemUsers = {}
    },

    // async getUsers() {

    //   const s = await this.$db.collection('users').get()
    //   this.users = []
    //   s.forEach(d => {
    //     const r = d.data()
    //     const user = Object.assign(r)
    //     user.id = d.id
    //     user.disable = false;
    //     this.users.push(user)
    //   })

    //   this.users = this.users.sort((a, b) => {
    //       return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    //   });

    //   this.selUsers = JSON.parse(JSON.stringify(this.users));
    // },
    async getUsers() {

      const lastName = '사용자';

      if(!this.users || this.users.length < 1) {
        
        const s = await this.$db.collection('users').get()
        let users = []
        s.forEach(d => {
          const r = d.data()
          const user = Object.assign(r)
          user.id = d.id
          user.disable = false;
          users.push(user)
        })

        users = users.sort((a, b) => {

          if(a.name.indexOf(lastName) > -1 && b.name.indexOf(lastName) == -1) return 1
          else if(a.name.indexOf(lastName) == -1 && b.name.indexOf(lastName) > -1) return -1

          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });

        this.$store.commit('order/setUsers', users)

      }

      this.selUsers = JSON.parse(JSON.stringify(this.users))
    },

    async changeVal(val, evt) {

      // 다른 메뉴 요소 제거
      Object.keys(this.selItemUsers).forEach(key => {
        if(val != key) {
          this.selItemUsers[key] = this.selItemUsers[key]?.filter(e => !evt.includes(e))
        }
      });

      let menu = this.selMenus.find(m => m.id === val) // this.menus.find(m => m.id === val)

      // 해당 메뉴 초기화 
      this.selUsers.forEach(user => {
        if(user.menu?.id == val) user.menu = null
      });

      // 유저 메뉴 설정
      evt.forEach(userId => {
        let user = this.selUsers.find(u => u.id === userId)
        if(user) {
          user.menu = JSON.parse(JSON.stringify(menu))
        }
      });

      this.updateOrders();
    },

    selClick(menuId) {
      // 이벤트 2번 발생하므로 한번한 처리하도록 ..
      if(this.selClickCnt == 1) {
        this.selUsers.forEach(user => {
          if(user.menu) {
            user.disable = user.menu.id != menuId;
          } else {
            user.disable = false;
          }
        });
        this.selClickCnt++;
      } else {
        this.selClickCnt = 1;
      }
    },

    closeSel(muneId) {
      //this.$refs[muneId]?.$el.click()
      this.$refs[muneId]?.blur()
    },

    getMenuName(item) {
      let name = '';
      if(item.menu) {
        name = item.menu?.name;
        name = name.length > 8 ? name.substring(0, 8) + '...' : name
      }
      return name;
    },

    addCnt(item, add) {
      item.addCnt = item.addCnt + add
      if(item.addCnt < 0 ) item.addCnt = 0
    },

    delItem(item) {
      if(item.menu) {
        this.selItemUsers[item.menu.id] = this.selItemUsers[item.menu.id]?.filter(e => item.id != e)
        let user = this.selUsers.find(u => u.id === item.id);
        if(user) user.menu = null;

        this.updateOrders();
      }
    },

    // async getMenus() {
    //   const s = await this.$db.collection('menuItems').get()
    //   this.menus = []
    //   s.forEach(d => {
    //     const r = d.data()
    //     const item = Object.assign(r)
    //     item.id = d.id
    //     item.children = []
    //     item.cnt = 0
    //     item.addCnt = 0
    //     item.totCnt = 0
    //     this.menus.push(item)
    //   })
    //   this.isLoading = false
    // },
    async getMenus() {
      if(!this.menus || this.menus.length < 1) {
        const s = await this.$db.collection('menuItems').get()
        let menus = []
        s.forEach(d => {
          const r = d.data()
          const item = Object.assign(r)
          item.id = d.id
          item.children = []
          item.cnt = 0
          item.addCnt = 0
          item.totCnt = 0
          menus.push(item)
        })
        this.$store.commit('order/setMenus', menus);
      }

      this.selMenus = JSON.parse(JSON.stringify(this.menus));

      this.isLoading = false
    },

    async readOrders() {
      
      await this.$db.collection('orders')
        .orderBy('orderDate', 'desc')
        .limit(1)
        .get()
        .then(o => {
          if(!o.empty) {
            const data = o.docs[0].data()
            this.orderId = o.docs[0].id

            this.selUsers = data.selUsers
            this.selItemUsers = data.selItemUsers
            this.orderDate = data.orderDate
          }
        })
 
      // console.log(this.orderId)
      // console.log(this.orderDate)
      // console.log(this.$moment().format("YYYY-MM-DD"))
      // console.log(!this.orderId)
      // console.log(this.orderDate != this.$moment().format("YYYY-MM-DD"))

      if(!this.orderId || this.orderDate != this.$moment().format("YYYY-MM-DD")) {

        const doc_ref = await this.$db.collection('orders').add( {  
          orderDate: this.$moment().format("YYYY-MM-DD"),
          selUsers: this.selUsers,
          selItemUsers: this.selItemUsers,
        })

        this.orderId = doc_ref.id;
        this.orderDate = doc_ref.orderDate
      }
    },
    async updateOrders() {
      // console.log("this.orderId - ", this.orderId)
      if(this.orderId) {
        // console.log("update order")

          this.$db
            .collection('orders')
            .doc(this.orderId)
            .update({  
              //orderDate: this.$moment().format("YYYY-MM-DD"),
              selUsers: this.selUsers,
              selItemUsers: this.selItemUsers,
            })
      }
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