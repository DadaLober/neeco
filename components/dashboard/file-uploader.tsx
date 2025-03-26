"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploaderProps {
    onFileContent: (content: string, name: string) => void
}

export function FileUploader({ onFileContent }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const validateFile = (file: File): boolean => {
        // Check if the file is a text file
        if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
            setError("Only text files (.txt) are allowed")
            return false
        }

        // Clear any previous errors
        setError(null)
        return true
    }

    const readFile = (file: File) => {
        if (!validateFile(file)) return

        const reader = new FileReader()

        reader.onload = (e) => {
            const content = e.target?.result as string
            onFileContent(content, file.name)
            setFileName(file.name)
        }

        reader.onerror = () => {
            setError("Failed to read file")
        }

        reader.readAsText(file)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0]
            readFile(file)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            readFile(file)
        }
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleClearFile = () => {
        setFileName(null)
        onFileContent("", "")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,text/plain" className="hidden" />

                <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium">Drag and drop your text file here or click to browse</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">Only .txt files are supported</p>

                    {fileName ? (
                        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-primary break-all">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{fileName}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={handleClearFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" onClick={handleButtonClick} className="mt-2" size="sm">
                            Select File
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}

