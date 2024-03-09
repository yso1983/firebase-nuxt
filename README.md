
    # memi nuxt lecture
    
    ## Install tools
    
    - node v8
    - yarn
    - firebase-tools
    
    ## .env File setting
    
    eg)
    ```text
    FIREBASE_APIKEY=yourKey
    FIREBASE_AUTHDOMAIN=yourDomain
    FIREBASE_PROJECTID=yourProjectId
    ``` 
    
    guide: [https://firebase.google.com/docs/firestore/quickstart](https://firebase.google.com/docs/firestore/quickstart)
    
    ## Build Setup
    
    ``` bash
    # install dependencies
    $ yarn
    
    # serve with hot reload at localhost:3000
    $ yarn dev
    
    # build for production and launch server
    $ yarn build
    $ yarn start
    
    # generate static project
    $ yarn generate
    ```
    
    ## Firebase Setup
    
    ```bash
    # login
    $ firebase login --no-localhost
    
    # init
    $ firebase init
    ```
    
    Select all and enter default
    
    ## deploy
    
    ```bash
    $ yarn firebase:deploy
    ```

    ```pinia
    https://pinia.vuejs.kr/ssr/nuxt
    https://stack94.tistory.com/entry/Nuxt3-Nuxt3%EC%97%90%EC%84%9C-Pinia-%EC%84%A4%EC%B9%98%ED%95%98%EA%B3%A0-%EC%82%AC%EC%9A%A9%ED%95%B4%EB%B3%B4%EC%9E%90
    ```
