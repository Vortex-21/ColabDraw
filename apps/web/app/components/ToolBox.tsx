import React from 'react'
import ToolBoxInput from './ToolBoxInput'
import { Hand, Pencil, Square, TextCursor } from 'lucide-react'

const ToolBox = ({changeToolHandler, tool}:{changeToolHandler:(e:any)=>void, tool: string}) => {
  return (
    <nav className="flex justify-center items-center gap-4 px-4 py-2 rounded-lg z-20 bg-white text-black  absolute top-5 left-[50%] translate-x-[-50%]">
        <ToolBoxInput
          onChangeHandler={changeToolHandler}
          id="draw"
          tool={tool}
          Icon={<Square size={18} strokeWidth={1.75} />}
        ></ToolBoxInput>

        <ToolBoxInput
          onChangeHandler={changeToolHandler}
          id="pointer"
          tool={tool}
          Icon={<Hand size={18} strokeWidth={1} />}
        ></ToolBoxInput>

        <ToolBoxInput
          onChangeHandler={changeToolHandler}
          id="text"
          tool={tool}
          Icon={<TextCursor size={18} strokeWidth={1} />}
        ></ToolBoxInput>

        <ToolBoxInput
          onChangeHandler={changeToolHandler}
          id="pencil"
          tool={tool}
          Icon={<Pencil size={18} strokeWidth={1} />}
        />
      </nav>
  )
}

export default ToolBox