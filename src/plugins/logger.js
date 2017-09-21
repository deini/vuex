// Credits: borrowed code from fcomb/redux-logger

import { deepCopy } from '../util'

export default function createLogger ({
  collapsed = true,
  filter = (mutation, stateBefore, stateAfter) => true,
  transformer = state => state,
  mutationTransformer = mut => mut,
  actionFilter = (action, state) => true,
  actionTransformer = act => act,
  logActions = false,
  logMutations = true
} = {}) {
  return store => {
    let prevState = deepCopy(store.state)

    if (logMutations) {
      store.subscribe((mutation, state) => {
        if (typeof console === 'undefined') {
          return
        }
        const nextState = deepCopy(state)

        if (filter(mutation, prevState, nextState)) {
          const formattedTime = getFormattedTime()
          const formattedMutation = mutationTransformer(mutation)
          const message = `mutation ${mutation.type}${formattedTime}`

          startMessage(message, collapsed)
          console.log('%c prev state', 'color: #9E9E9E; font-weight: bold', transformer(prevState))
          console.log('%c mutation', 'color: #03A9F4; font-weight: bold', formattedMutation)
          console.log('%c next state', 'color: #4CAF50; font-weight: bold', transformer(nextState))
          endMessage()
        }

        prevState = nextState
      })
    }

    if (logActions) {
      store.subscribeAction((action, state) => {
        if (typeof console === 'undefined') {
          return
        }

        const currentState = deepCopy(state)

        if (actionFilter(action, currentState)) {
          const formattedTime = getFormattedTime()
          const formattedAction = actionTransformer(action)
          const message = `action ${action.type}${formattedTime}`

          startMessage(message, collapsed)
          console.log('%c action', 'color: #03A9F4; font-weight: bold', formattedAction)
          endMessage()
        }
      })
    }
  }
}

function startMessage (message, collapsed) {
  const startMessage = collapsed
    ? console.groupCollapsed
    : console.group

  // render
  try {
    startMessage.call(console, message)
  } catch (e) {
    console.log(message)
  }
}

function endMessage () {
  try {
    console.groupEnd()
  } catch (e) {
    console.log('—— log end ——')
  }
}

function getFormattedTime () {
  const time = new Date()
  return ` @ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`
}

function repeat (str, times) {
  return (new Array(times + 1)).join(str)
}

function pad (num, maxLength) {
  return repeat('0', maxLength - num.toString().length) + num
}
