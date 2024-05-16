export function extractWebCodes(code = "") {
  const htmlPattern = /(?:<!DOCTYPE html>|<html>)[\s\S]*?<\/html>/gi
  const scriptPattern = /<script\b[^>]*>[\s\S]*?<\/script>/gi
  const cssPattern = /<style\b[^>]*>[\s\S]*?<\/style>/gi

  let nonHtmlCode = ""
  let htmlCode = ""
  let cssCode = ""
  let jsCode = ""

  const htmlMatches = code.match(htmlPattern) || []
  const jsMatches = code.match(scriptPattern) || []
  const cssMatches = code.match(cssPattern) || []

  jsMatches.forEach(match => {
    jsCode += match.trim() + "\n"
  })


  cssMatches.forEach(match => {
    cssCode += match.trim() + "\n"
  })



  htmlMatches.forEach(htmlBlock => {
    let cleanedHtml = htmlBlock.replace(scriptPattern, "").replace(cssPattern, "")
    htmlCode += cleanedHtml.trim() + "\n"
  })

  const nonHtmlBlocks = code.split(htmlPattern)
  nonHtmlBlocks.forEach(block => {
    let cleanedNonHtml = block.replace(scriptPattern, "").replace(cssPattern, "")
    nonHtmlCode += cleanedNonHtml.trim() + "\n"
  })

  return {
    html: htmlCode.trim(),
    js: jsCode.trim(),
    css: cssCode.trim(),
    nonhtml: nonHtmlCode.trim()
  }
}




export function readFile(extension = ".html") {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = extension

    input.onchange = (event) => {
      const file = event.target.files[0]

      if (!file.type.includes("htm")) {
        reject("Unsupported File type !!")
      }

      const reader = new FileReader()
      reader.readAsText(file)

      reader.onload = (e) => {
        resolve(e.target.result)
      }

      reader.onerror = () => {
        reject("Can't open File !!")
      }
    }



    input.oncancel = () => {
      resolve("")
    }

    input.click()
  })
}





export function saveAsHtml(content, filename) {
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


export function getSettings() {
  return JSON.parse(localStorage.getItem("settings")) || {
    isMinimized: {
      full: false,
      html: false,
      css: false,
      js: false,
      preview: false,
      editor: false
    },
    code: {
      seperated: true,
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



export const copyTextToClipboard = async (value) => {
      await navigator.clipboard.writeText(value)
}