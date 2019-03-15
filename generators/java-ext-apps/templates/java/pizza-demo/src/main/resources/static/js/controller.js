var pizzaName = 'pizzaApp:controller'
var pizzaService = SYMPHONY.services.register(pizzaName)

SYMPHONY.remote.hello().then(function (data) {
  SYMPHONY.application
    .register('pizzaApp', [ 'entity', 'modules', 'applications-nav' ], [ pizzaName ])
    .then(function (response) {
      var modulesService = SYMPHONY.services.subscribe('modules')
      var navService = SYMPHONY.services.subscribe('applications-nav')
      var entityService = SYMPHONY.services.subscribe('entity')
      var orderHistory = []

      navService.add('pizza-nav', 'Pizza App', pizzaName)
      entityService.registerRenderer('com.symphony.ps.pizzaMenu', {}, pizzaName)

      fetch('https://localhost:4000/orders')
        .then(res => res.json())
        .then(res => {
          orderHistory = res
        })

      pizzaService.implement({
        render: function (type, entityData) {
          const existingOrder = orderHistory.filter(o => o.id === entityData.quoteId)
          if (existingOrder.length === 1) {
            const template = `<entity id="button-template" class="template">
              <card id="card">
                <h2>Pizza Menu</h2>
                <p>You have previously chosen ${existingOrder[0].choice}</p>
              </card>
            </entity>`
            return { template, data: { accent: 'tempo-bg-color--green' } }
          }

          entityData.instanceId = entityData.quoteId
          entityData.renderTime = new Date()

          switch (type) {
            case 'com.symphony.ps.pizzaMenu':
              return this.getMenuTemplate(entityData)
            default:
              return { data: {}, template: `<entity>Invalid element type ${entityData.type}</entity>` }
          }
        },
        getMenuTemplate: function (entityData) {
          const menuOptions = entityData.options
            .map(option => `<action class="button" id="${option.replace(/[^\w]/g, '')}"/>`)
            .join('')
          const data = { accent: 'tempo-bg-color--blue' }

          entityData.options.forEach(option => {
            const thisId = option.replace(/[^\w]/g, '')
            data[thisId] = {
              label: option,
              service: pizzaName,
              data: {
                cmd: 'menuSelect',
                choice: option,
                entity: entityData
              }
            }
          })

          const template = `<entity id="button-template" class="template">
              <card id="card">
                <h2>Pizza Menu</h2>
                <p>Please select your choice of pizza</p>
                <p>${menuOptions}</p>
              </card>
            </entity>`

          return {
            template,
            data,
            entityInstanceId: entityData.instanceId
          }
        },
        action: function (data) {
          if (data.cmd === 'menuSelect') {
            const template =
                        `<entity id="button-template" class="template">
              <card id="card">
                <h2>Pizza Menu</h2>
                <p>Loading...</p>
              </card>
            </entity>`

            entityService.update(data.entity.instanceId, template, { accent: 'tempo-bg-color--yellow' })

            fetch('https://localhost:4000/order', {
              method: 'POST',
              body: JSON.stringify({
                id: data.entity.quoteId,
                choice: data.choice,
                date: new Date().getTime()
              }),
              headers: { 'Content-Type': 'application/json' }
            })
              .then(res => res.json())
              .then(res => {
                this.menuSelect(res)
              })
              .catch(error => console.error('Error:', error))
          }
        },
        menuSelect: function (data) {
          const template =
                    `<entity id="button-template" class="template">
            <card id="card">
              <h2>Pizza Menu</h2>
              <p>You have chosen ${data.choice}</p>
            </card>
          </entity>`
          orderHistory.push({ id: data.id, date: data.date, choice: data.choice })
          entityService.update(data.id, template, { accent: 'tempo-bg-color--green' })
        },
        select: function (id) {
          if (id === 'pizza-nav') {
            modulesService.show(
              'pizzaOrderHistory',
              { title: 'Pizza App Manager' },
              pizzaName,
              'https://localhost:4000/app.html',
              { 'canFloat': true }
            )
          }
        },
        getOrderHistory: function () {
          return orderHistory
        },
        getMenu: function () {
          return fetch('https://localhost:4000/menu')
            .then(res => res.json())
        },
        addMenu: function (newItem) {
          return fetch('https://localhost:4000/menu', {
            method: 'POST',
            body: JSON.stringify(newItem),
            headers: { 'Content-Type': 'application/json' }
          })
            .then(res => res.json())
        }
      })
    })
})
