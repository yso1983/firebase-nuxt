export const state = () => ({
  counter: 0,
  isDarkTheme: true,
 }); 
 
export const getters =  {
  isDark(state) {
    return state.isDarkTheme;
  },
}

export const mutations = { 
  increment (state) { 
    state.counter++; 
  },
  setDark (state, isDark) { 
    state.isDarkTheme = isDark;
  },
}