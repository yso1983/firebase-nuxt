<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >

    <v-text-field
      v-model="form.email"
      :rules="emailRules"
      label="E-mail"
      required
    ></v-text-field>

    <v-text-field
      v-model="form.password"
      label="password"
      type="password"
    ></v-text-field>

    <v-btn
      color="blue"
      class="mr-4"
      @click="signIn"
    >
      signIn
    </v-btn>

  </v-form>
</template>
<script>
  export default {
    data: () => ({
      valid: true,
      name: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters',
      ],
      form: {
        email: 'guest@guest.com',
        password: ''
      },
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      select: null,
      items: [
        'Item 1',
        'Item 2',
        'Item 3',
        'Item 4',
      ],
      checkbox: false,
    }),

    methods: {
      async signIn() {
        try {
          const r = await this.$auth().signInWithEmailAndPassword(
            this.form.email,
            this.form.password
          )

          if(r && r.operationType == "signIn") {
            this.$router.push({name: 'index'})
          }
        } catch (e) {
          alert('로그인 실패!')
        }
      },
    },
  }
</script>