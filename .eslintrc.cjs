module.exports = { extends:['next/core-web-vitals'], rules:{
  'no-restricted-syntax':[
    'error',
    { selector:"JSXAttribute[name.name='style']", message:'No inline styles.' },
    { selector:"Literal[value=/^#|rgb\\(|hsl\\(|oklch\\(/].parent.type=Literal", message:'No hardcoded colors; use tokens.' }
  ]
}}
