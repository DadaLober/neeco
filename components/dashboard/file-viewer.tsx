import { ScrollArea } from "@/components/ui/scroll-area"

interface FileViewerProps {
    content: string | null
}

export function FileViewer({ content }: FileViewerProps) {
    return (
        <ScrollArea className="h-[200px] sm:h-[300px] w-full rounded-md border p-3 sm:p-4">
            {content ? (
                <pre className="text-xs sm:text-sm whitespace-pre-wrap">{content}</pre>
            ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    <p className="text-xs sm:text-sm">Upload a text file to view its contents</p>
                </div>
            )}
        </ScrollArea>
    )
}

