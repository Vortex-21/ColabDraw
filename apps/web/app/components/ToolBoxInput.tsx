import React, { ReactElement } from 'react'

const ToolBoxInput = ({onChangeHandler, id, tool, Icon}:{onChangeHandler:(e:any)=>void, id:string,tool:string, Icon:ReactElement}) => {
  return (
   <>
   <label
          htmlFor={id}
          className={`rounded-md px-4 py-2 ${tool === id ? "bg-gray-500" : "bg-white hover:bg-gray-300"}`}
        >
          {Icon}
        </label>
        <input
          onChange={onChangeHandler}
          className="sr-only"
          type="radio"
          id={id}
          name="tool"
        />
    </>
  )
}

export default ToolBoxInput