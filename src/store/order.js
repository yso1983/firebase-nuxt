export const state = () => ({
  menus: [],
  users: [],
 }); 
 
export const getters =  {
  menus(state) {
    return state.menus;
  },
  users(state) {
    return state.users;
  }
}

export const mutations = { 
  setMenus (state, menus) { 
    state.menus = menus;
  },
  setUsers (state, users) { 
    state.users = users;
  },
}