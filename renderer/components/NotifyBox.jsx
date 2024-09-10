import { useEffect, useState } from 'react'

function NotifyBox() {
  const [notify, setNotify] = useState(false)
  useEffect(() => {
    window.electronAPI.notify((data) => {
      setNotify(data)
      setTimeout(() => {
        setNotify(false)
      }, 2000)
    })

    return () => {
      window.electronAPI.removeNotify()
    }
  }, [])

  return (
    <>
      {notify && (
        <div className="fixed bottom-2 right-2 rounded-md bg-green-600 px-4 py-2 text-white shadow-md">
          {notify}
        </div>
      )}
    </>
  )
}

export default NotifyBox
