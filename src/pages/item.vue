<template>
  <v-data-table
    :headers="headers"
    :items="desserts"
    class="elevation-1"
    :loading="isLoading"
    loading-text="Loading... Please wait"
    hide-default-footer
    hide-default-header
    :custom-sort="customSort"
    item-key="id"
    id="itemTbl"
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
          max-width="500px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
              v-on="on"
            >
              메뉴 등록
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
                      v-model="editedItem.name"
                      label="메뉴명"
                    ></v-text-field>
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
              <v-btn color="blue darken-1" text @click="deleteItemConfirm">확인</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>

    <template v-slot:item.name="{ item }">
    <v-container>
      <v-row  no-gutters>
        <v-col cols="9" class="text-left">
          {{item.name}}
        </v-col>
        <v-col cols="3">
          <v-icon
            small
            class="mr-5"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            small
            @click="deleteItem(item)"
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
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="deleteItem(item)"
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
    name:'item',
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
        },
        // { text: '수정/삭제', value: 'actions', sortable: false,width: '150px', },
      ],
      desserts: [],
      selectedItem: null, 
      editedItem: {
        name: ''
      },
      defaultItem: {
        name: '',
      },
    }),

    computed: {
      formTitle () {
        return this.selectedItem ? '수정' : '등록'
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
        //this.desserts = []
        this.read();
      },

      editItem (item) {
    
        this.selectedItem = item
        this.editedItem = Object.assign({}, this.selectedItem)
        this.dialog = true
      },

      deleteItem (item) {
        this.selectedItem = item
        this.editedItem = Object.assign({}, this.selectedItem)
        this.dialogDelete = true
      },

      async deleteItemConfirm () {
        this.remove(this.selectedItem)
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.selectedItem = null
        })
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.selectedItem = null
        })
      },

      async save () {
        if (this.selectedItem == null) {
          await this.create();
        } else {
          await this.update();
        }
        this.close()
      },
      async create() {
        const item = Object.assign(this.editedItem)
        const s = await this.$db.collection('menuItems').add(item)
        this.dialog = false
        await this.read()
      },
      async read() {
        const s = await this.$db.collection('menuItems').get()
        this.desserts = []
        s.forEach(d => {
          const r = d.data()
          const item = Object.assign(r)
          item.id = d.id
          item.children = []
          item.cnt = 0
          item.addCnt = 0
          item.totCnt = 0
          this.desserts.push(item)
        })
        
        this.$store.commit('order/setMenus', this.desserts);

        this.isLoading = false;
      },
      async update() {
        await this.$db
          .collection('menuItems')
          .doc(this.selectedItem.id)
          .update(this.editedItem)
        this.dialog = false
        await this.read()
      },
      async remove(p) {
        await this.$db
          .collection('menuItems')
          .doc(p.id)
          .delete()
        await this.read()
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