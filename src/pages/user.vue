<template>
  <v-data-table
    :headers="headers"
    :items="users"
    class="elevation-1"
    :loading="isLoading"
    loading-text="Loading... Please wait"
    hide-default-footer
    hide-default-header
    :custom-sort="customSort"
    disable-pagination
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <!-- <v-toolbar-title>메뉴</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider> -->
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          max-width="600px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
              v-on="on"
            >
              신규 등록
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="editedUser.name"
                      label="성명"
                    ></v-text-field>
                  </v-col>
                  <v-col>
                     <v-radio-group
                      v-model="editedUser.gender"
                      row
                    >
                      <v-radio
                        label="남"
                        value="M"
                      ></v-radio>
                      <v-radio
                        label="여"
                        value="F"
                      ></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click="save"
              >
                저장
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click="close"
              >
                취소
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">삭제하겠습니까?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete">취소</v-btn>
              <v-btn color="blue darken-1" text @click="deleteUserConfirm">확인</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    
    <template v-slot:item.name="{ item }">
    <v-container>
      <v-row  no-gutters>
        <v-col cols="6" class="text-left">
          {{item.name}}
        </v-col>
        <v-col cols="3" class="text-center">
          {{item.gndrTxt}}
        </v-col>
        <v-col cols="3">
          <v-icon
            small
            class="mr-4"
            @click="editUser(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            small
            @click="deleteUser(item)"
          >
            mdi-delete
          </v-icon>
        </v-col>
      </v-row>
    </v-container>
    </template>
    <!-- <template v-slot:item.actions="{ item, index}">
      <v-icon
        small
        class="mr-2"
        @click="editUser(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
        @click="deleteUser(item)"
      >
        mdi-delete
      </v-icon>
    </template> -->
    <!-- <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="initialize"
      >
        Reset
      </v-btn>
    </template> -->
  </v-data-table>
</template>
<script>
  export default {
    name:'user',
    data: () => ({
      isLoading: true,
      dialog: false,
      dialogDelete: false,
      headers: [
        // { value: 'id', text: 'id' },
        {
          text: '사용자',
          align: 'start',
          //sortable: false,
          value: 'name',
        },
        // { text: '성별', value: 'gndrTxt', width: '150px' },
        // { text: '수정/삭제', value: 'actions', sortable: false,width: '150px' },
      ],
      users: [],
      selectedUser: null, 
      editedUser: {
        name: '',
        gender: 'M',
        gndrTxt: '남',
      },
      defaultUser: {
        name: '',
        gender: 'M',
        gndrTxt: '남',
      },
    }),

    computed: {
      formTitle () {
        return this.selectedUser ? '수정' : '등록'
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
      this.initialize();
    },

    methods: {
      initialize () {
        //this.users = []
        this.read();
      },

      editUser (user) {
    
        this.selectedUser = user
        this.editedUser = Object.assign({}, this.selectedUser)

        this.dialog = true
      },

      deleteUser (user) {
        this.selectedUser = user
        this.editedUser = Object.assign({}, this.selectedUser)
        this.dialogDelete = true
      },

      async deleteUserConfirm () {
        this.remove(this.selectedUser)
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedUser = Object.assign({}, this.defaultUser)
          this.selectedUser = null
        })
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedUser = Object.assign({}, this.defaultUser)
          this.selectedUser = null
        })
      },

      async save () {
        if (this.selectedUser == null) {
          await this.create();
        } else {
          await this.update();
        }
        this.close()
      },
      async create() {
        this.editedUser.gndrTxt = this.editedUser.gender == 'M' ? '남' : '여';

        const user = Object.assign(this.editedUser)

        const s = await this.$db.collection('users').add(user)
        this.dialog = false
        await this.read()
      },
      async read() {
        // 한글 오름차순
        const s = await this.$db.collection('users').get()
        this.users = []
        s.forEach(d => {
          const r = d.data()
          const user = Object.assign(r)
          user.id = d.id
          user.disable = false;
          this.users.push(user)
        })

        this.$store.commit('order/setUsers',  this.customSort(this.users));

        this.isLoading = false;
      },
      async update() {

        this.editedUser.gndrTxt = this.editedUser.gender == 'M' ? '남' : '여';

        await this.$db
          .collection('users')
          .doc(this.selectedUser.id)
          .update(this.editedUser)
        this.dialog = false
        await this.read()
      },
      async remove(p) {
        await this.$db
          .collection('users')
          .doc(p.id)
          .delete()
        await this.read()
      },
      customSort: function(items, index, isDesc) {
        const lastName = '사용자';
        items.sort((a, b) => {
          
          if(a.name.indexOf(lastName) > -1 && b.name.indexOf(lastName) == -1) return 1
          else if(a.name.indexOf(lastName) == -1 && b.name.indexOf(lastName) > -1) return -1
            
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
        return items;
      }
    },
  }
</script>