module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  assetsDir: 'static',
  devServer: {
    port: 8080,
    host: '127.0.0.1'
  },
  pages: {
    index: {
      // entry for the page
      entry: 'src/main.js',
      title: 'THE GAME(ザ・ゲーム) ONLINE',
    },
  }
}
