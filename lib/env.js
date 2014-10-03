module.exports = {
  isProd:   (typeof process !== 'undefined' && (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production'))
        ||  (typeof window !== 'undefined' && (window.ENV === 'prod' || window.ENV === 'production'))
}
