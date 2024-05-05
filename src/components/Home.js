import { GenerativeModel } from "@google/generative-ai"
import { useState } from "react"
import './styles.css' // Import CSS file
import Loading from "react-loading"

export default function Home() {
    // Google Generative AI API Key
    const api = "AIzaSyCxxGXr_e3TBkNfF0M5pr-twylMdKbu8JI"
    // show error reason if AI prompt failed
    const onErrorShowReason = true
    // Default prompt - don't change
    const prompt = "generate web page code, if not possible as response return " + (onErrorShowReason ? "'null:<reason>'" : "'null'") + ", the following prompt is : "


    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(null)
    const [isErrorMsg, setisErrorMsg] = useState(false)
    const [gptInstance, setGptInstance] = useState()
    const [gptResult, setGptResult] = useState("")

    const [htmlCode, sethtmlCode] = useState("")
    const [cssCode, setcssCode] = useState("")
    const [jsCode, setjsCode] = useState("")


    const getGPT = () => {
        if (!gptInstance) {
            const newGPT = new GenerativeModel(api, {
                model: "gemini-1.0-pro",
                generationConfig: {
                    temperature: 0.5
                }
            })
            setGptInstance(newGPT)
            return newGPT
        }
        return gptInstance
    }

    const handleGPTError = (error) => {
        return onErrorShowReason ? "null:Can't generate for " + error + " reason !" : "null"
    }

    const getGPTResult = async () => {
        let response
        try {
            response = (await getGPT().startChat().sendMessage(prompt + input)).response

            // clean result code
            const result = response.text().replace(/```\w*/g, '')

            return result
        } catch (error) {
            return handleGPTError(response.candidates[0].finishReason)
        }
    }


    const extractWebCodes = (code = "") => {
        const htmlPattern = /<!DOCTYPE html>[\s\S]*?<\/html>/i
        const scriptPattern = /<script\b[^>]*>[\s\S]*?<\/script>/gi
        const cssPattern = /<style\b[^>]*>[\s\S]*?<\/style>/gi

        let htmlCode = ""
        let cssCode = ""
        let jsCode = ""

        // extract
        const htmlMatch = code.match(htmlPattern)
        const scriptsMatch = code.match(scriptPattern)
        const cssMatch = code.match(cssPattern)


        // setup codes
        if (htmlMatch) {
            htmlCode = (htmlMatch[0].replace(scriptPattern, "")).replace(cssPattern, "")
        }
        if (scriptsMatch) {
            scriptsMatch.forEach(script => {
                jsCode += script
            })
        }
        if (cssMatch) {
            cssMatch.forEach(style => {
                cssCode += style
            })
        }

        return {
            html: htmlCode,
            js: jsCode,
            css: cssCode
        }
    }


    const chat = async () => {
        setIsLoading(true)
        setisErrorMsg(false)

        const result = await getGPTResult()

        if (result.indexOf("null") === 0) {
            setisErrorMsg(onErrorShowReason ? result.slice(5) : true)
        }


        // AI RESULT
        setGptResult(result)
        const extractedCode = extractWebCodes(result)
        sethtmlCode(extractedCode.html)
        setcssCode(extractedCode.css)
        setjsCode(extractedCode.js)

        setIsLoading(false)
    }

    const copyTextToClipboard = async (text = "") => {
        try {
            await navigator.clipboard.writeText(text)
        } catch (error) {
            alert("Sorry can't copy the provided Code !!")
        }
    }



    return (
        <div className="container">
            <div className="editor-container">
                <div className="left-container">
                    {isLoading ?
                        <Loading className="loader" type="spin"></Loading>
                        :
                        <iframe srcDoc={isErrorMsg ? isErrorMsg : (htmlCode + cssCode + jsCode)} title="Result"></iframe>
                    }
                </div>



                <div className="right-container">
                    <textarea
                        disabled={isLoading}
                        value={htmlCode}
                        onChange={(e) => sethtmlCode(e.target.value)}
                        placeholder="<html>&#10;&#0;&#0;Html Code&#10;</html>"
                    ></textarea>
                    <textarea
                        disabled={isLoading}
                        value={cssCode}
                        onChange={(e) => setcssCode(e.target.value)}
                        placeholder="<style>&#10;&#0;&#0;Css Code&#10;</style>"
                    ></textarea>
                    <textarea
                        disabled={isLoading}
                        value={jsCode}
                        onChange={(e) => setjsCode(e.target.value)}
                        placeholder="<script>&#10;&#0;&#0;Js Code&#10;</script>"
                    ></textarea>
                </div>
            </div>


            <div className="input-container">
                <input
                    className="input-field"
                    disabled={isLoading}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key == "Enter") {
                            chat()
                        }
                    }}
                />
                <button className="generate-button" disabled={isLoading} onClick={chat}>
                    Generate
                </button>
            </div>
        </div >
    )
}
