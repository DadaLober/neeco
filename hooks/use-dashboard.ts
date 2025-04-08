import { analyzeFileContent, FileAnalysis } from "@/schemas/validateDocument"
import { useState } from "react"

export function useDashboard() {
    const [fileContent, setFileContent] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [analysis, setAnalysis] = useState<FileAnalysis>({
        projectedRows: 0,
        invalidRows: 0,
        errors: [],
        analyzed: false
    })
    const [showErrors, setShowErrors] = useState(false)

    const handleFileContent = (content: string, name: string) => {
        setFileContent(content)
        setFileName(name)
        setShowErrors(false)

        if (content) {
            const result = analyzeFileContent(content)
            setAnalysis(result)
        } else {
            setAnalysis({
                projectedRows: 0,
                invalidRows: 0,
                errors: [],
                analyzed: false
            })
        }
    }

    const handleSubmit = async () => {
        if (!fileContent || analysis.projectedRows === 0) return

        setIsProcessing(true)
        try {
            console.log("Submitting file:", fileName)
            console.log("Projected rows to insert:", analysis.projectedRows)

            await new Promise(resolve => setTimeout(resolve, 1000))

            alert(`File submitted successfully! ${analysis.projectedRows} rows will be processed.`)
        } catch (error) {
            console.error("Error submitting file:", error)
            alert("Failed to submit file")
        } finally {
            setIsProcessing(false)
        }
    }

    const toggleShowErrors = () => {
        setShowErrors(prev => !prev)
    }

    return {
        fileContent,
        fileName,
        analysis,
        isProcessing,
        showErrors,
        handleFileContent,
        handleSubmit,
        toggleShowErrors,
    }
}
