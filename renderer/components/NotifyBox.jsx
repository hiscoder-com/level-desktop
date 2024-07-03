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
        <div className="fixed right-2 bottom-2 px-4 py-2 rounded-md bg-green-600 text-white shadow-md">
          {notify}
        </div>
      )}
    </>
  )
}

export default NotifyBox
