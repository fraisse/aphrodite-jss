import {create, createGenerateClassName} from 'jss'
import preset from 'jss-preset-default'

const meta = 'aphrodite-jss'
const isNotFalsy = val => !!val
const getClassName = rule => rule.className
const mergeStyles = (style, rule) => ({...style, ...rule.style})

export default function aphroditeJss(jss, options) {
  const renderSheet = () => (
    jss.createStyleSheet(null, {meta, ...options}).attach()
  )

  let sheet = renderSheet()

  function css(...rules) {
    // Filter falsy values to allow `css(a, test && c)`.
    rules = rules.filter(isNotFalsy)

    if (!rules.length) return ''

    // A joined class name from all rules.
    const className = rules.map(getClassName).join('--')

    if (sheet.getRule(className)) return className

    const style = rules.reduce(mergeStyles, {})
    sheet.addRule(className, style, {selector: `.${className}`})

    return className
  }

  function register(styles) {
    return Object.keys(styles).reduce((map, name) => {
      if (name[0] === '@') {
        sheet.addRule(name, styles[name])
        return map
      }
      map[name] = {
        className: createGenerateClassName(name, JSON.stringify(styles[name])),
        style: styles[name]
      }
      return map
    }, {})
  }

  function reset() {
    jss.removeStyleSheet(sheet)
    sheet = renderSheet()
  }

  return {
    StyleSheet: {create: register},
    toString: () => sheet.toString(),
    css,
    reset,
    version: __VERSION__
  }
}

export const {css, StyleSheet, reset, toString, version} = aphroditeJss(create(preset()))
