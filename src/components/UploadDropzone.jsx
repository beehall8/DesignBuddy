import { useCallback, useRef, useState } from 'react'

export default function UploadDropzone({ onFile, fileName, loading, error }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(
    (files) => {
      if (files && files[0]) onFile(files[0])
    },
    [onFile]
  )

  return (
    <div
      className={`dropzone ${dragActive ? 'drag-active' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragActive(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".stl,.glb,.gltf"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {loading ? (
        <p>Loading model…</p>
      ) : fileName ? (
        <>
          <p className="dropzone-filename">{fileName}</p>
          <p className="dropzone-hint">Click or drop to replace</p>
        </>
      ) : (
        <>
          <p>Drop an STL or glTF/GLB file here</p>
          <p className="dropzone-hint">or click to browse</p>
        </>
      )}
      {error && <p className="dropzone-error">{error}</p>}
    </div>
  )
}
