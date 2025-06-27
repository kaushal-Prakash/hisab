import React from 'react'

function layout({children}) {
  return (
    <div className='grid place-content-center pt-20'>{children}</div>
  )
}

export default layout