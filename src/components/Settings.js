export default function Settings() {

}




export function getSettings() {
    return JSON.parse(localStorage.getItem("settings")) || {
        isMinimized: {
            html: false,
            css: false,
            js: false
        },
    }
}

export function setSettings(settings) {
    localStorage.setItem("settings", JSON.stringify(settings))
}


export function setSetting(keys, value) {
    let settings = { ...getSettings() };
    const keysArray = keys.split('.');
    let current = settings


    for (let a = 0; a < keysArray.length - 1; a++) {
        const key = keysArray[a]
        current = current[key]
    }

    current[keysArray[keysArray.length - 1]] = value


    setSettings(settings)
}
