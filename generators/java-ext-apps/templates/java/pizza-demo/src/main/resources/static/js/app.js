var pizzaName = 'pizzaApp:view'
let launchMenuDialog
let addMenuOption

SYMPHONY.remote.hello().then(function (data) {
  var themeColor = data.themeV2.name
  var themeSize = data.themeV2.size
  document.body.className = 'symphony-external-app ' + themeColor + ' ' + themeSize
  document.querySelector('#orderHistory').innerHTML = 'Loading..'

  SYMPHONY.application
    .connect('pizzaApp', ['pizzaApp:controller', 'dialogs'], [pizzaName])
    .then(function (response) {
      var pizzaApp = SYMPHONY.services.subscribe('pizzaApp:controller')
      var dialogService = SYMPHONY.services.subscribe('dialogs')

      var manageMenuTemplate =
            `<dialog>
                <h3>Manage Menu</h3>
                <br />
                <ol>
                    <iterate id="choices">
                        <li><text id="name" /></li>
                    </iterate>
                </ol>
                <br />
            </dialog>`
      var manageMenuData = { 'choices': [] }
      pizzaApp.invoke('getMenu').then((menu) => {
        menu.forEach(name => {
          manageMenuData.choices.push({ name })
        })
      })
      launchMenuDialog = function () {
        dialogService.show('manageMenuDialog', 'manageMenuService', manageMenuTemplate, manageMenuData, {})
      }
      addMenuOption = function () {
        const newItem = document.querySelector('#addMenuOptionInput').value

        console.log(newItem)
        console.log(manageMenuData.choices)
        console.log(manageMenuData.choices.map(o => o.name).indexOf(newItem))

        if (manageMenuData.choices.map(o => o.name).indexOf(newItem) > -1) {
          dialogService.show('menuItemAddedDialog', 'menuItemAddedService', '<dialog>Item already exists<br/><br/></dialog>', {}, {})
        }
        else {
          pizzaApp.invoke('addMenu', { 'name': newItem }).then((menu) => {
            manageMenuData.choices = []
            menu.forEach(name => {
              manageMenuData.choices.push({ name })
            })
            dialogService.show('menuItemAddedDialog', 'menuItemAddedService', `<dialog>Item Added: ${newItem}<br/><br/></dialog>`, {}, {})
          })
        }
      }

      pizzaApp.invoke('getOrderHistory').then((orderHistory) => {
        if (orderHistory.length === 0) {
          document.querySelector('#orderHistory').innerHTML = 'No orders yet'
          return
        }
        const rowData = orderHistory
          .map(order => {
            const date = new Date(order.date)
            const formattedDateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
            return `<tr><td>${order.id}</td><td>${formattedDateTime}</td><td>${order.choice}</td></tr>`
          })
          .join('')

        const tableData = `<table><tr><th>Order ID</th><th>Date</th><th>Order</th></tr>${rowData}</table>`
        document.querySelector('#orderHistory').innerHTML = tableData
      })
    })
})
