const Symphony = require('symphony-api-client-node')
Symphony.setDebugMode(true)

const Helpers = require('./Helpers')

/** BEGIN: Initialize BotClient **/
console.log('Initialize ExpenseBot Client')
Symphony.initBot(__dirname + '/config.json')
  .then(() => {
    const listeners = {
      onMessageSent: botHearsSomething,
      onSymphonyElementsAction: botManagesActions
    }

    Symphony.getDatafeedEventsService(listeners)
  })

// Catch message from chat and process them
const botHearsSomething = (messages) => {
  messages.forEach((message, index) => {
    processMessage(message)
  })
}

// Catch messages due to Symphony Elements action and process them
const botManagesActions = (actions) => {
  actions.forEach((action, index) => {
    processAction(action)
  })
}

/** END: Initialize BotClient **/

/** BEGIN: Message processing **/

// Return help message from Bot configuration
const helpMessage = () => {
  const botUsername = Symphony.config.botUsername

  return '<h3>Use ExpenseBot to create and submit an expense form using Symphony Elements</h3>' +
    '<p>Type @' + botUsername + ' <b>\'create expense\'</b> to create an expense approval form</p>' +
    '<p>In order to assign your expense approval form to your manager, you must first add an expense</p>'
}

const processMessage = (message) => {
  const mentions = Symphony.getMentions(message)
  const botIsMentioned = mentions.indexOf(Symphony.getBotUser().id.toString()) !== -1

  if (botIsMentioned) {
    const cleanMessage = Helpers.parseAndCleanMessage(message)
    const commands = cleanMessage.split(' ')

    let sendHelpMessage = false
    if (commands.length > 0) {
      switch (commands[0].toLowerCase()) {
        case 'help': {
          sendHelpMessage = true
          break
        }
        case 'create': {
          if (commands[1] === 'expense') {
            sendCreateForm(message)
          } else {
            sendHelpMessage = true
          }
          break
        }
        default: {
          sendHelpMessage = true
        }
      }
    }

    if (sendHelpMessage) {
      console.log('Bot send help message')
      Symphony.sendMessage(message.stream.streamId, helpMessage(), null, Symphony.MESSAGEML_FORMAT)
    }
  }
}

/** END: Message processing **/

/** BEGIN: Manage Expense form **/

// Return help message from Bot configuration
const defaultExpenseFormData = {
  personName: '',
  expenses: [],
  reportTotal: 0.00
}

let expenseFormData = null

const createFormMessage = (personName) => {
  expenseFormData = Object.assign({}, defaultExpenseFormData)

  expenseFormData = {
    ...expenseFormData,
    personName
  }

  return buildCompleteMessage()
}

const buildCompleteMessage = (errorOnReferals = false) => {
  let message =
    '<h1>Expense form for ' + expenseFormData.personName + '</h1>' +
    '<hr />' +
    '<h3>Expense list :</h3>' +
    '<table>' +
    '<thead>' +
    '<tr>' +
    '<td>Expense Name:</td>' +
    '<td>Expense Date:</td>' +
    '<td>Expense Amount:</td>' +
    '</tr>' +
    '</thead>' +
    '<tbody>'
  expenseFormData.expenses.forEach((expense) => {
    message +=
      '<tr>' +
      '<td>' + expense.name + '</td>' +
      '<td>' + expense.date + '</td>' +
      '<td>$' + parseFloat(expense.price).toFixed(2) + '</td>' +
      '</tr>'
  })

  message +=
    '</tbody>' +
    '<tfoot>' +
    '<tr>' +
    '<td></td>' +
    '<td></td>' +
    '<td>Total: $' + parseFloat(expenseFormData.reportTotal).toFixed(2) + '</td>' +
    '</tr>' +
    '</tfoot>' +
    '</table>'

  message +=
    '<br />' +
    '<div style="display: flex;">' +
    '<div style="width: 70%;">' +
    '<h3>New expense :</h3>' +
    '<form id="add-expense-form">' +
    '<text-field name="vendor-textfield" placeholder="Enter a vendor: " required="true" />' +
    '<br />' +
    '<text-field name="date-textfield" placeholder="Enter a Date: " required="true" />' +
    '<br/>' +
    '<text-field name="price-textfield" placeholder="Enter a Price: " required="true" />' +
    '<br/>' +
    '<button type="action" name="add-expense-button">Add Expense</button>' +
    '</form>' +
    '</div>'

  if (expenseFormData.expenses.length > 0) {
    message +=
      '<div style="width: 30%;">' +
      '<h3>Expense Form Submission :</h3>'

    if (errorOnReferals) {
      message +=
        '<span class="tempo-text-color--red">' +
        'You need to choose a least on referal before to submit your expense form.' +
        '</span>'
    }

    message +=
      '<form id="expense-approval-form">' +
      '<p>Choose at least one referal to submit your expense form</p>' +
      '<br />' +
      '<person-selector name="person-selector" placeholder="Select Your Boss" required="true" />' +
      '<button type="action" name="submit-expense">Submit</button>' +
      '</form>' +
      '</div>'
  }

  message += '</div>'

  return message
}

const sendCreateForm = (message) => {
  console.log('Send create form message')
  Symphony.sendMessage(message.stream.streamId, createFormMessage(message.user.displayName), null, Symphony.MESSAGEML_FORMAT)
}

/** END: Manage Expense form **/

/** BEGIN: Action processing **/

const processAction = (action) => {
  if (expenseFormData !== null) {
    switch (action.formId) {
      case 'add-expense-form': {
        if (action.formValues.action === 'add-expense-button') {
          manageAddExpenseForm(action)
        }
        break
      }
      case 'expense-approval-form': {
        if (action.formValues.action === 'submit-expense') {
          manageExpenseApprovalForm(action)
        }
        break
      }
    }
  } else {
    console.log('Bot send help message')
    Symphony.sendMessage(action.streamId, helpMessage(), null, Symphony.MESSAGEML_FORMAT)
  }
}

const manageAddExpenseForm = (action) => {
  const { 'vendor-textfield': name, 'date-textfield': date, 'price-textfield': price } = action.formValues
  expenseFormData = {
    ...expenseFormData,
    expenses: [
      ...expenseFormData.expenses,
      {
        name,
        date,
        price
      }
    ]
  }

  const reportTotal = expenseFormData.reportTotal + parseFloat(price)

  expenseFormData = {
    ...expenseFormData,
    reportTotal
  }

  console.log('Send updated form message')
  Symphony.sendMessage(action.streamId, buildCompleteMessage(), null, Symphony.MESSAGEML_FORMAT)
}

// Return submission confirmation message
const confirmMessage = (referals) => {
  return '<h3>Your expense has been submitted to ' + referals.join(', ') + '.</h3>' +
    '<p>Thanks for using ExpenseBot !</p>'
}

const manageExpenseApprovalForm = (action) => {
  const { 'person-selector': referals } = action.formValues

  if (referals.length > 0) {
    Symphony.getUsersFromIdList(referals.join(',')).then((response) => {
      const referalsUsers = response.users.map(user => user.displayName)
      console.log('Send confirmation message')
      Symphony.sendMessage(action.streamId, confirmMessage(referalsUsers), null, Symphony.MESSAGEML_FORMAT)

      expenseFormData = null
    })
  } else {
    console.log('Send updated form message')
    Symphony.sendMessage(action.streamId, buildCompleteMessage(true), null, Symphony.MESSAGEML_FORMAT)
  }
}

/** END: Action processing **/
