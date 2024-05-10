import { useState } from "react";
import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

export default function SettingsUI({isSeperatedCodeView,setisSeperatedCodeView, onClose }) {

    const OptionUI = ({ title, isEnabled, onToggle }) => {
        return (
            <div className="settings-option">
                <button onClick={() => { onToggle(!isEnabled) }} className="settings-option-toggle-button">
                    {isEnabled ? <FaToggleOn /> : <FaToggleOff />}
                    <div className="settings-option-title">
                        {title}
                    </div>
                </button>

            </div>
        )
    }

    return (
        <div className="settings">
            <div className="settings-content">
                <div className="settings-header">
                    <div className="settings-header-title">Settings</div>
                    <button onClick={onClose} className="settings-close-button"><IoIosClose /></button>
                </div>

                <OptionUI title={"Seperate Code View"} isEnabled={isSeperatedCodeView} onToggle={(value)=>{
                    setisSeperatedCodeView(value)
                    setSetting("code.seperated",value)
                }} />
            </div>
        </div>
    )
}




export function getSettings() {
    return JSON.parse(localStorage.getItem("settings")) || {
        isMinimized: {
            html: false,
            css: false,
            js: false
        },
        code: {
            seperated:true,
            full: "",
            html: "",
            css: "",
            js: ""
        },
    }
}

function setSettings(settings) {
    localStorage.setItem("settings", JSON.stringify(settings))
}


export function setSetting(keys, value) {
    let settings = { ...getSettings() };
    const keysArray = keys.split('.');
    let current = settings


    for (let a = 0; a < keysArray.length - 1; a++) {
        const key = keysArray[a]
        if (!current[key]) {
            current[key] = {}
        }
        current = current[key]
    }

    current[keysArray[keysArray.length - 1]] = value


    setSettings(settings)
}
