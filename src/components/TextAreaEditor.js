import { useState, useEffect } from "react"
import { CiMaximize1, CiMinimize1 } from "react-icons/ci"
import { copyTextToClipboard, getSettings, setSetting } from "./utils"

export default function TextAreaEditor({ id, isSeperatedCodeView, title, value, onChange, disabled, placeholder }) {
    const [isHover, setisHover] = useState(false)
    const [isMinimized, setisMinimized] = useState(getSettings().isMinimized[id])


    const toggleMinimized = () => {
        const newState=!isMinimized
        setisMinimized(newState)
        setSetting("isMinimized." + id, newState)
    }



    if (id !== "full" && isSeperatedCodeView || id === "full" && !isSeperatedCodeView)
        return (
            <div className={!isMinimized ? "editor" : "editor minimized"}
                onMouseEnter={() => setisHover(true)}
                onMouseLeave={() => setisHover(false)}>

                <div className="editor-header">
                    <div className="editor-header-title">{title}</div>
                    <button onClick={toggleMinimized} className="editor-header-button">{isMinimized ? <CiMaximize1 /> : <CiMinimize1 />}</button>
                </div>

                <div className={!isMinimized ? "editor-content" : "editor-content minimized"}>
                    <textarea
                        disabled={disabled}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                    />
                    <button disabled={disabled} className="editor-copy-button" onClick={()=>{copyTextToClipboard(value)}} style={!isHover ? { display: "none" } : { display: "block" }}>Copy</button>
                </div>
            </div>
        )
}