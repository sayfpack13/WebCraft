import { useEffect, useRef, useState } from "react";
import { VscOpenPreview, VscPreview } from "react-icons/vsc";
import { getSettings, readFile, setSetting } from "./utils";
import { toast } from "react-toastify";

export function Header({ minimizeButtonMenu,helpDomain, onOpenFile, onSaveFile, onClearEditor, onsetisPreviewMinimized, onsetisEditorMinimized }) {

    const [isPreviewMinimized, setisPreviewMinimized] = useState(getSettings().isMinimized.preview)
    const [isEditorMinimized, setisEditorMinimized] = useState(getSettings().isMinimized.editor)

    const togglePreview = () => {
        const newState = !isPreviewMinimized
        setisPreviewMinimized(newState)
        setSetting("isMinimized.preview", newState)
        onsetisPreviewMinimized(newState)
    }
    const toggleEditor = () => {
        const newState = !isEditorMinimized
        setisEditorMinimized(newState)
        setSetting("isMinimized.editor", newState)
        onsetisEditorMinimized(newState)
    }

    const MenuButton = ({ title, btns = [{ title: "", onClick: () => { } }] }) => {
        const [isMinimized, setisMinimized] = useState(true)
        const menuRef = useRef(null);

        const toggleMinimized = () => {
            setisMinimized(!isMinimized)
        }

        const clickEvent = (e) => {
            if (!menuRef.current.contains(e.target)) {
                setisMinimized(true)
            }
        }

        useEffect(() => {
            document.addEventListener("click", clickEvent)
            return () => {
                document.removeEventListener("click", clickEvent);
            }
        }, [])

        return (
            <div ref={menuRef} className="header-button-container">
                <button onClick={toggleMinimized} className={isMinimized ? "header-button" : "header-button active"}>{title}</button>
                {!isMinimized &&
                    <div className="header-button-menu">
                        {btns.map((btn, index) => {
                            if (btn.title) {
                                return (
                                    <button key={index} onClick={() => {
                                        toggleMinimized()
                                        btn.onClick()
                                    }} className="header-button-option">{btn.title}</button>
                                )
                            } else {
                                return (
                                    <div key={index} className="header-button-divider"></div>
                                )
                            }
                        })}
                    </div>
                }
            </div>
        )
    }


    const openFile = async () => {
        try {
            const result = await readFile()
            if (!result) {
                return
            }

            onOpenFile(result)
        } catch (error) {
            toast.error(error)
        }
    }



    return (
        <div className="header-container">
            <div className="header-left">
                <MenuButton title={"File"} btns={[
                    { title: "Open File...", onClick: () => { openFile() } },
                    { title: "Save File", onClick: () => { onSaveFile() } },
                    { title: "", onClick: () => { } },
                    { title: "Clear Editor", onClick: () => { onClearEditor() } },
                ]} />
                <MenuButton title="Help" btns={[
                    { title: "About", onClick: () => { window.open(helpDomain) } },
                ]} />
            </div>

            <div className="header-right">
                <button onClick={togglePreview} className={isPreviewMinimized ? "header-button active" : "header-button"}><VscPreview /></button>
                <button onClick={toggleEditor} className={isEditorMinimized ? "header-button active" : "header-button"}><VscOpenPreview /></button>
            </div>
        </div>
    )
}