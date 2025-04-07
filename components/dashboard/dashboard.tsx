"use client"

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { FileViewer } from "./file-viewer"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle, Send, Database, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { analyzeFileContent, FileAnalysis } from "@/schemas"

export function Dashboard() {
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
            // Call the centralized validation function
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
        if (!fileContent || analysis.projectedRows === 0) return;

        setIsProcessing(true);
        try {
            // Here you would handle the submission of the file content
            // For example, sending it to an API endpoint
            console.log("Submitting file:", fileName);
            console.log("Projected rows to insert:", analysis.projectedRows);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert(`File submitted successfully! ${analysis.projectedRows} rows will be processed.`);
        } catch (error) {
            console.error("Error submitting file:", error);
            alert("Failed to submit file");
        } finally {
            setIsProcessing(false);
        }
    }

    const toggleShowErrors = () => {
        setShowErrors(!showErrors);
    }

    return (
        <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-6 flex-1">
                <Card className="border">
                    <CardContent className="p-4 sm:p-6">
                        <h2 className="text-xl font-semibold mb-4">Upload Text File</h2>
                        <FileUploader onFileContent={handleFileContent} />
                    </CardContent>
                </Card>

                {fileContent && (
                    <Card className="border">
                        <CardContent className="p-4 sm:p-6">
                            <h2 className="text-xl font-semibold mb-4">{fileName ? `File: ${fileName}` : "Text Content"}</h2>
                            <FileViewer content={fileContent} />

                            <div className="mt-4 text-xs space-y-1 text-muted-foreground">
                                <p>Expected format (each row):</p>
                                <code className="bg-gray-100 p-1 block rounded">
                                    referenceNo;documentType;documentStatus;purpose;supplier;OIC(bool);date(ISOstring);departmentId?
                                </code>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {analysis.analyzed && (
                    <Card className="border">
                        <CardContent className="p-4 sm:p-6">
                            <h2 className="text-xl font-semibold mb-4">File Analysis</h2>

                            <Alert className={analysis.invalidRows > 0 ? "bg-yellow-50" : "bg-green-50"}>
                                <AlertDescription className="flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    <span>
                                        <strong>{analysis.projectedRows}</strong> row{analysis.projectedRows !== 1 ? 's' : ''} ready to insert
                                        {analysis.invalidRows > 0 && (
                                            <span className="text-yellow-700"> ({analysis.invalidRows} invalid row{analysis.invalidRows !== 1 ? 's' : ''} skipped)</span>
                                        )}
                                    </span>
                                </AlertDescription>
                            </Alert>

                            {analysis.invalidRows > 0 && (
                                <div className="mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleShowErrors}
                                        className="w-full flex items-center gap-2 text-yellow-700"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        {showErrors ? "Hide Error Details" : "Show Error Details"}
                                    </Button>

                                    {showErrors && (
                                        <ScrollArea className="h-[150px] mt-2 rounded-md border p-2">
                                            <div className="space-y-2">
                                                {analysis.errors.map((error, idx) => (
                                                    <div key={idx} className="text-xs border-l-2 border-red-400 pl-2">
                                                        <div className="font-medium">Line {error.line}: {error.message}</div>
                                                        <div className="font-mono bg-gray-100 p-1 mt-1 rounded overflow-x-auto whitespace-nowrap">
                                                            {error.row}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </div>
                            )}

                            <div className="mt-4">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isProcessing || analysis.projectedRows === 0}
                                    className="w-full"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send className="h-4 w-4" />
                                            Submit {analysis.projectedRows > 0 ? `(${analysis.projectedRows} row${analysis.projectedRows !== 1 ? 's' : ''})` : 'File'}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="flex justify-center">
                <Link
                    href="/dashboard/getting-started"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                    <HelpCircle className="h-4 w-4" />
                    <span>Getting Started Guide</span>
                </Link>
            </div>
        </div>
    )
}