"use client"

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react"

interface SandpackDemoProps {
  /** The main App.tsx code for the demo. */
  code: string
  /** Additional files beyond App.tsx. */
  files?: Record<string, string>
  /** Title shown above the demo. */
  title?: string
}

export function SandpackDemo({ code, files, title }: SandpackDemoProps) {
  return (
    <div className="not-prose my-6">
      {title && (
        <p className="mb-2 text-sm font-medium text-fd-muted-foreground">
          {title}
        </p>
      )}
      <SandpackProvider
        template="react-ts"
        files={{
          "/App.tsx": code,
          ...files,
        }}
        customSetup={{
          dependencies: {
            hoyst: "latest",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
          },
        }}
        theme="dark"
      >
        <SandpackLayout>
          <SandpackCodeEditor
            showLineNumbers
            showTabs
            style={{ height: 400 }}
          />
          <SandpackPreview style={{ height: 400 }} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
