'use client'

import { useState } from "react"
import { analyzeFileContent, FileAnalysis, parseFileContent } from "@/schemas/validateDocument"
import { addDocuments } from "@/actions/itemActions"
import { Documents } from "@prisma/client"


interface Props {
    addDocuments: typeof addDocuments
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
            const parsedData = parseFileContent(fileContent)

            // Call
            const result = await addDocuments(parsedData)

            if (result.success) {
                alert(`File submitted successfully! ${parsedData.length} rows processed.`);
            } else {
                alert(`Failed to submit file: ${result.error.message}`);
            }
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