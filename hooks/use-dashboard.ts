'use client'

import { analyzeFileContent, FileAnalysis, parseFileContent } from "@/schemas/validateDocument"
import { useState } from "react"
import { UnauthorizedResponse } from "@/schemas"

interface Props {
    addDocuments: (documents: unknown) => Promise<number | UnauthorizedResponse>
}

export function useDashboard({ addDocuments }: Props) {
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
            // Parse
            const parsedData = parseFileContent(fileContent);

            //Call
            await addDocuments(parsedData);

            alert(`File submitted successfully! ${parsedData.length} rows processed.`);
        } catch (error) {
            console.error("Error submitting file:", error);
            alert("Failed to submit file: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsProcessing(false);
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