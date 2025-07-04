import React from 'react'

async function Group({params}) {
    const { id } = params;
  return (
    <div className='mt-96'>Group {id}</div>
  )
}

export default Group