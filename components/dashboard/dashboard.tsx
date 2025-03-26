"use client"

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { FileViewer } from "./file-viewer"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import Link from "next/link"

export function Dashboard() {
    const [fileContent, setFileContent] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)

    const handleFileContent = (content: string, name: string) => {
        setFileContent(content)
        setFileName(name)
    }

    return (
        <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6 flex-1">
                <Card className="flex-1 min-w-0 border">
                    <CardContent className="p-4 sm:p-6">
                        <h2 className="text-xl font-semibold mb-4">Upload Text File</h2>
                        <FileUploader onFileContent={handleFileContent} />
                    </CardContent>
                </Card>

                <Card className="flex-1 min-w-0 border">
                    <CardContent className="p-4 sm:p-6">
                        <h2 className="text-xl font-semibold mb-4">{fileName ? `File: ${fileName}` : "Text Content"}</h2>
                        <FileViewer content={fileContent} />
                    </CardContent>
                </Card>
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